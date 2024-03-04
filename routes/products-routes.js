const express = require("express");
// const {
//   getAllProducts,
//   getProductById,
// } = require("../controllers/admin-controller");
const {
  getAllFilter,
  getAllProducts,
  getProductById,
} = require("../controllers/products-controller");

const router = express.Router();

router.get("/", getAllProducts);

router.get("/allfilter", getAllFilter);

router.get("/:pid", getProductById);

//auth user will be allowed below like for cart adding but i need to add something more so that one user cannot edit other user cart

module.exports = router;
