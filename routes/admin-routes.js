const express = require("express");

const {
  createProduct,
  getAllProducts,
  addProductDetails,
} = require("../controllers/admin-controller");

const router = express.Router();

router.get("/product", getAllProducts);

router.post("/product", createProduct);

router.post("/product/:pid", addProductDetails);

module.exports = router;
