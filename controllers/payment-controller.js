const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const sha256 = require("sha256");
const HttpError = require("../models/http-error");
const Cart = require("../models/cart");
const mongoose = require("mongoose");
const Orders = require("../models/orders");

const initiatePayment = async (req, res, next) => {
  const { userId } = req.userData;
  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some Error Occured while finding cart", 500));
  }
  if (!cart) {
    return next(new HttpError("Cart does not exist", 500));
  }

  const pipeline = [
    {
      $match: {
        _id: cart._id,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $group: {
        _id: "$_id",
        totalAmount: {
          $sum: {
            $multiply: [
              { $toInt: "$products.quantity" },
              { $toInt: "$products.price" },
            ],
          },
        },
      },
    },
    {
      $project: {
        totalAmount: 1,
        shippingCost: 100,
        gstAmount: { $multiply: ["$totalAmount", 0.18] }, // Assuming GST is 18%
        totalWithShippingAndGST: {
          $add: ["$totalAmount", 100, { $multiply: ["$totalAmount", 0.18] }],
        },
      },
    },
  ];

  const [{ totalWithShippingAndGST }] = await Cart.aggregate(pipeline);
  const MERCHANT_TRANSACTION_ID = uuidv4();
  const MERCHANT_USER_ID = userId;
  const order = new Orders({
    orderStatus: false,
    orderId: MERCHANT_TRANSACTION_ID,
    statusCode: "PAYMENT_PROCESSING",
    statusMessage: "Your payment is under-process",
    orderDetails: {
      orderId: MERCHANT_TRANSACTION_ID,
      orderTotal: totalWithShippingAndGST,
      shippingInfo: {
        address: "",
        state: "",
        city: "",
      },
    },
    cartItems: cart,
    userId,
  });

  await order.save();

  const payload = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    merchantTransactionId: MERCHANT_TRANSACTION_ID,
    merchantUserId: MERCHANT_USER_ID,
    amount: (totalWithShippingAndGST * 100).toFixed(0),
    redirectUrl: `${process.env.BACKEND_URL}/api/payment/redirect-url/${MERCHANT_TRANSACTION_ID}`,
    redirectMode: "REDIRECT",
    // callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback-url`,
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };
  console.log(payload);

  // SHA256(base64 encoded payload + “/pg/v1/pay” + salt key) + ### + salt index

  const bufferObj = Buffer.from(JSON.stringify(payload), "utf-8");
  const base64EncodedPayload = bufferObj.toString("base64");

  const xverify =
    sha256(
      base64EncodedPayload +
        process.env.PHONEPE_API_PAY_ENDPOINT +
        process.env.PHONEPE_SALT_KEY
    ) +
    "###" +
    process.env.PHONEPE_SALT_INDEX;

  // console.log(xverify);

  const options = {
    method: "post",
    url: `${process.env.PHONEPE_HOST_URL}${process.env.PHONEPE_API_PAY_ENDPOINT}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": xverify,
    },
    data: {
      request: base64EncodedPayload,
    },
  };

  let responseData;
  try {
    const response = await axios.request(options);
    responseData = await response.data;
  } catch (error) {
    console.log(error);
    res.json({ error });
    // return next(new HttpError("Error occred", 500));
  }

  res.json({
    success: responseData.success,
    url: responseData.data.instrumentResponse.redirectInfo.url,
    data: responseData,
  });
};

const processPayment = async (req, res, next) => {
  const { merchantTransactionId } = req.params;

  if (merchantTransactionId) {
    // SHA256(“/pg/v1/status/{merchantId}/{merchantTransactionId}” + saltKey) + “###” + saltIndex

    const xverify =
      sha256(
        `${process.env.PHONEPE_API_STATUS_ENDPOINT}/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}` +
          process.env.PHONEPE_SALT_KEY
      ) +
      "###" +
      process.env.PHONEPE_SALT_INDEX;

    const options = {
      method: "get",
      url: `${process.env.PHONEPE_HOST_URL}${process.env.PHONEPE_API_STATUS_ENDPOINT}/${process.env.PHONEPE_MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": xverify,
        "X-MERCHANT-ID": process.env.PHONEPE_MERCHANT_ID,
      },
    };

    let responseData;
    try {
      const response = await axios.request(options);
      responseData = await response.data;
    } catch (error) {
      console.log(error);
      return next(
        new HttpError("Some error occored while processing payment", 500)
      );
    }

    let updateOrder = {};
    if (responseData.code === "PAYMENT_SUCCESS") {
      updateOrder.orderStatus = responseData.success;
      updateOrder.statusCode = responseData.data.state;
      updateOrder.statusMessage = responseData.code;
      updateOrder.transactionId = responseData.data.transactionId;
      updateOrder.paymentType = responseData.data.paymentInstrument.type;
    } else if (response.data.code === "PAYMENT_ERROR") {
      updateOrder.orderStatus = responseData.success;
      updateOrder.statusCode = responseData.data.state;
      updateOrder.statusMessage = responseData.code;
      updateOrder.transactionId = responseData.data.transactionId;
      updateOrder.paymentType = null;
    } else if (response.data.code === "PAYMENT_DECLINED") {
      updateOrder.orderStatus = responseData.success;
      updateOrder.statusCode = responseData.data.state;
      updateOrder.statusMessage = responseData.code;
      updateOrder.transactionId = responseData.data.transactionId;
      updateOrder.paymentType = null;
    } else {
      updateOrder.orderStatus = false;
      updateOrder.statusCode = "PAYMENT_UNKNOWN";
      updateOrder.statusMessage =
        "There is an error trying to process your transaction at the moment. Please try again in a while.";
      updateOrder.transactionId = null;
      updateOrder.paymentType = null;
    }

    const orderId = responseData.data.merchantTransactionId;
    let order;
    try {
      order = await Orders.findOneAndUpdate({ orderId }, updateOrder, {
        new: true,
      });
    } catch (error) {
      return next(
        new HttpError(
          "Could not find the order, during payment processing",
          500
        )
      );
    }

    if (!order) {
      return res.json({ order: null });
    }

    res.redirect(`http://localhost:3000/confirmation`);
  } else {
    res.status(500).json({ error: "error" });
  }
};

exports.initiatePayment = initiatePayment;
exports.processPayment = processPayment;
