const express = require("express");
const router = express.Router();

const {
  last7DaysCollection
} = require("../../controllers/Customer/DashboardController");

const customerAuth=require("../../middlewares/customerAuth")
router.use(customerAuth);

router.get("/last-7-days", last7DaysCollection);

module.exports = router;
