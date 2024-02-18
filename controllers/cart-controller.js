const { validationResult } = require("express-validator");
const Cart = require("../models/cart");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const Product = require("../models/product");

const addToCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Input is invalid, please try again", 422));
  }

  const { userId } = req.userData;
  const { id, quantity, size, color, colorIndex, sizeIndex } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  let productExist;
  try {
    productExist = await Product.findById(id);
  } catch (error) {
    return next(new HttpError("Some error occured while finding Product", 500));
  }
  console.log(productExist);

  if (!productExist) {
    return next(new HttpError("This product does not  exists", 500));
  }

  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some error Occured while finding Cart", 500));
  }

  if (!cart) {
    cart = new Cart({ userId, products: [] });
  }

  let existingItem;
  try {
    existingItem = cart.products.find(
      (item) =>
        item.id.equals(new mongoose.Types.ObjectId(id)) &&
        item.size === size &&
        item.color === color
    );
    console.log(existingItem);
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Error occured while finding product in cart", 500)
    );
  }

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.products.push({
      id,
      quantity,
      color,
      size,
      price:
        productExist.additionalInformation.colors[colorIndex].sizes[sizeIndex]
          .price,
      image: productExist.additionalInformation.colors[colorIndex].images[0],
      name: productExist.name,
    });
  }

  try {
    await cart.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Error occured while saving to cart", 500));
  }

  res.status(200).json({ message: "Product added to cart successfully" });
};

const getCart = async (req, res, next) => {
  const { userId } = req.userData;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some error Occured while finding Cart", 500));
  }

  res.status(200).json({
    message: "Your Cart",
    count: cart?.products.length,
    cart: cart.products,
  });
};

/**
 * Remove From Cart
 */
const removeFromCart = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Input is invalid, please try again", 422));
  }

  const { userId } = req.userData;
  const { id, quantity, color, size } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  //also find the id and matches with products id to know if the product exist or user has manually add product id

  let productExist;
  try {
    productExist = await Product.findById(id);
  } catch (error) {
    return next(new HttpError("Some error occured while finding Product", 500));
  }

  if (!productExist) {
    return next(new HttpError("This product does not  exists", 500));
  }

  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some error Occured while finding Cart", 500));
  }

  if (!cart) {
    return next(new HttpError("Cart does not exist, please add products", 500));
  }

  let existingItemIndex;
  try {
    existingItemIndex = cart.products.findIndex(
      (item) =>
        item.id.equals(new mongoose.Types.ObjectId(id)) &&
        item.size == size &&
        item.color === color
    );
  } catch (error) {
    return next(
      new HttpError("Error occured while finding product in cart", 500)
    );
  }

  if (existingItemIndex !== -1) {
    cart.products.splice(existingItemIndex, 1);
  } else {
    return next(new HttpError("Product does not exist", 404));
  }
  try {
    await cart.save();
  } catch (error) {
    return next(new HttpError("Some error occred while saving cart", 500));
  }

  res.status(200).json({ message: "Product deleted" });
};

/**
 * This is for Quantity
 */
const increaseQuantity = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Input is invalid, please try again", 422));
  }

  const { userId } = req.userData;
  const { id, quantity, color, size } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  //also find the id and matches with products id to know if the product exist or user has manually add product id

  let productExist;
  try {
    productExist = await Product.findById(id);
  } catch (error) {
    return next(new HttpError("Some error occured while finding Product", 500));
  }

  if (!productExist) {
    return next(new HttpError("This product does not  exists", 500));
  }

  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some error Occured while finding Cart", 500));
  }

  if (!cart) {
    return next(new HttpError("Cart does not exist, please add products", 500));
  }

  let existingItemIndex;
  try {
    existingItemIndex = cart.products.findIndex(
      (item) =>
        item.id.equals(new mongoose.Types.ObjectId(id)) &&
        item.size == size &&
        item.color === color
    );
  } catch (error) {
    return next(
      new HttpError("Error occured while finding product in cart", 500)
    );
  }

  if (existingItemIndex !== -1) {
    console.log(cart);
    cart.products[existingItemIndex].quantity++;
  } else {
    return next(new HttpError("Product does not exist", 404));
  }
  try {
    await cart.save();
  } catch (error) {
    return next(new HttpError("Some error occred while saving cart", 500));
  }

  res.status(200).json({ message: "Product increased" });
};
const decreaseQuantity = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Input is invalid, please try again", 422));
  }

  const { userId } = req.userData;
  const { id, quantity, color, size } = req.body;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    return next(new HttpError("Some error occured while finding User", 500));
  }

  //also find the id and matches with products id to know if the product exist or user has manually add product id

  let productExist;
  try {
    productExist = await Product.findById(id);
  } catch (error) {
    return next(new HttpError("Some error occured while finding Product", 500));
  }

  if (!productExist) {
    return next(new HttpError("This product does not  exists", 500));
  }

  let cart;
  try {
    cart = await Cart.findOne({ userId });
  } catch (error) {
    return next(new HttpError("Some error Occured while finding Cart", 500));
  }

  if (!cart) {
    return next(new HttpError("Cart does not exist, please add products", 500));
  }

  let existingItemIndex;
  try {
    existingItemIndex = cart.products.findIndex(
      (item) =>
        item.id.equals(new mongoose.Types.ObjectId(id)) &&
        item.size == size &&
        item.color === color
    );
  } catch (error) {
    return next(
      new HttpError("Error occured while finding product in cart", 500)
    );
  }

  if (existingItemIndex !== -1) {
    if (cart.products[existingItemIndex].quantity > 1) {
      cart.products[existingItemIndex].quantity--;
    }
  } else {
    return next(new HttpError("Product does not exist", 404));
  }
  try {
    await cart.save();
  } catch (error) {
    return next(new HttpError("Some error occred while saving cart", 500));
  }

  res.status(200).json({ message: "Product decreased" });
};

exports.addToCart = addToCart;
exports.getCart = getCart;
exports.removeFromCart = removeFromCart;
exports.increaseQuantity = increaseQuantity;
exports.decreaseQuantity = decreaseQuantity;
