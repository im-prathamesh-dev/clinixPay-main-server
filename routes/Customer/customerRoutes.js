const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/Customer/customerController");
const auth = require("../../middlewares/authMiddleware");


router.get("/customer-details",auth, customerController.getCustomerDetails);
router.patch("/customer-update", auth, customerController.updateCustomer);



// notification routes
const getNotificationController = require("../../controllers/Customer/getNotificationController");

router.get("/notifications", auth, getNotificationController.getNotifications);
router.patch("/notifications/mark-read/:id", auth, getNotificationController.markRead);



module.exports = router;