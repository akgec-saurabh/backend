const express = require("express");
const {
  processPayment,
  initiatePayment,
} = require("../controllers/payment-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/redirect-url/:merchantTransactionId", processPayment);

router.use(checkAuth);

router.post("/", initiatePayment);

// payment/redirect-url/7ff35195-202d-4dd6-9744-b5d24f717411

module.exports = router;
