const mongoose = require("mongoose");
const Product = require("./product");
const User = require("./user");

const itemSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Product,
    required: true,
  },
  quantity: { type: Number, default: 1 },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  name: { type: String, required: true },
});

const cartSchema = new mongoose.Schema({
  products: [itemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
