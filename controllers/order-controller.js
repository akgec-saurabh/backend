const HttpError = require("../models/http-error");
const Orders = require("../models/orders");

const getOrdersById = async (req, res, next) => {
  //   const { userId } = req.userData;
  const { userId } = req.userData;

  let orders;
  try {
    orders = await Orders.find({ userId });
  } catch (error) {
    return next(new HttpError("Error occured while finding orders", 500));
  }
  res.json({ orders: orders });
};

exports.getOrdersById = getOrdersById;
