const express = require("express");

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductDetails,
} = require("../controllers/admin-controller");

const router = express.Router();

router.get("/products", getAllProducts);

router.get("/product/:pid", getProductById);

router.post("/product", createProduct);

router.patch("/product/:pid", updateProductDetails);

module.exports = router;
