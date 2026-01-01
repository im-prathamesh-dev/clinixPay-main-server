const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const customerAuth = require("../middlewares/customerAuth");

// Protect routes - only authenticated stores/customers can create and view their purchases
router.use(customerAuth);

// Create purchase
router.post("/purchase", purchaseController.createPurchase);

// List purchases (recent) - returns only authenticated customer's purchases
router.get("/purchase", purchaseController.getPurchases);

// Get single purchase
router.get("/purchase/:id", purchaseController.getPurchaseById);

module.exports = router;
