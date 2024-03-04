const express = require("express");
const { getOrdersById } = require("../controllers/order-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.use(checkAuth);

router.get("/", getOrdersById);

module.exports = router;
