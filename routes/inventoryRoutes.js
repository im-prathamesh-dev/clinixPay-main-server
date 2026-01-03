const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const customerAuth = require("../middlewares/customerAuth");

router.use(customerAuth);

// View stock
router.get("/inventory", inventoryController.getInventory);

// Edit stock manually
router.put("/inventory/:id", inventoryController.updateInventory);

// Delete stock item
router.delete("/inventory/:id", inventoryController.deleteInventory);

module.exports = router;
