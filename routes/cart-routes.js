const express = require("express");
const checkAuth = require("../middleware/check-auth");
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCart,
  increaseQuantity,
  decreaseQuantity,
} = require("../controllers/cart-controller");
const { check } = require("express-validator");

const router = express.Router();

router.use(checkAuth);

router.get("/", getCart);

router.post(
  "/add",
  check("quantity").notEmpty(),
  check("size").notEmpty(),
  check("color").notEmpty(),
  addToCart
);

router.patch(
  "/add",
  check("size").notEmpty(),
  check("color").notEmpty(),
  removeFromCart
);

router.patch(
  "/quantity/increase",
  check("size").notEmpty(),
  check("color").notEmpty(),
  increaseQuantity
);
router.patch(
  "/quantity/decrease",
  check("size").notEmpty(),
  check("color").notEmpty(),
  decreaseQuantity
);

module.exports = router;
