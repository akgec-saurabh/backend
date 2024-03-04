const mongoose = require("mongoose");
const Cart = require("./cart");
const User = require("./user");

const ordersSchema = mongoose.Schema({
  orderStatus: { type: Boolean },
  statusCode: { type: String },
  statusMessage: { type: String },
  orderId: { type: String },
  orderDetails: {
    orderId: { type: String },
    orderDate: { type: Date, default: Date.now },
    orderTotal: { type: Number },
    shippingInfo: {
      address: { type: String },
      state: { type: String },
      city: { type: String },
    },
  },
  transactionId: { type: String },
  paymentType: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  cartItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: Cart, required: true },
  ],
});

const Orders = mongoose.model("Orders", ordersSchema);
module.exports = Orders;
