const express = require("express");
const router = express.Router();
const { getAllPayments } = require("../../../controllers/Admin/Payments/paymentsController");
const auth = require("../../../middlewares/adminAuth");

// Admin only
router.get("/payments", auth, getAllPayments);

module.exports = router;
