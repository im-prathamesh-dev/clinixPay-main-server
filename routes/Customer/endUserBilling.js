const express = require("express");
const router = express.Router();

const billingCtrl = require("../../controllers/Customer/endUserBilling");
const customerAuth = require("../../middlewares/customerAuth");

// Apply customer authentication middleware to all billing routes
router.use(customerAuth);

// Billing Routes
router.post("/bill/draft", billingCtrl.createDraftBill);
router.put("/bill/draft/:id", billingCtrl.updateDraftBill);
router.put("/bill/final/:id", billingCtrl.finalizeBill);
router.get("/bill/today", billingCtrl.todayBills);

module.exports = router;
