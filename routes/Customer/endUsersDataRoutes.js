const express = require("express");
const router = express.Router();
const endUsersDataController = require("../../controllers/Customer/endUsersDataController");
const customerAuth = require("../../middlewares/customerAuth");

router.use(customerAuth);

// Get end users data
router.get("/data", endUsersDataController.getEndUsersData);

module.exports = router;