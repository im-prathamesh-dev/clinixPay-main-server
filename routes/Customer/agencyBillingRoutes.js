// routes/agencyBill.routes.js
const express = require("express");
const router = express.Router();

const {
  createDraftAgencyBill,
  updateDraftAgencyBill,
  finalizeAgencyBill,
  getAgencyBillsByCustomer,
  getAgencyBillById,
} = require("../../controllers/Customer/agencyBillingController");
const customerAuth = require("../../middlewares/customerAuth");
router.use(customerAuth);
// Create draft
router.post("/draft", createDraftAgencyBill);

// Update draft
router.put("/draft/:id", updateDraftAgencyBill);

// Finalize bill
router.put("/final/:id", finalizeAgencyBill);

// Get all agency bills of a customer (store)
router.get("/customer/:customerId", getAgencyBillsByCustomer);

// Get single agency bill
router.get("/:id", getAgencyBillById);

module.exports = router;
