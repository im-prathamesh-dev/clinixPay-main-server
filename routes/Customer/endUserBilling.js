const express = require("express");
const router = express.Router();

const billingCtrl = require("../../controllers/Customer/endUserBilling");

// Billing Routes
router.post("/bill/draft", billingCtrl.createDraftBill);
router.put("/bill/draft/:id", billingCtrl.updateDraftBill);
router.put("/bill/final/:id", billingCtrl.finalizeBill);
router.get("/bill/today", billingCtrl.todayBills);

module.exports = router;
