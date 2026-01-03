require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connection");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/Customer/customerRoutes");
const notificationRoutes = require("./routes/Admin/notificationRoute")
const getNotificationRoutes = require("./routes/Customer/customerRoutes");
const adminAuth = require("./middlewares/adminAuth");
const adminAuthRoutes = require("./routes/Admin/adminAuthRoutes");
const paymentRoutes = require("./routes/Admin/Payments/paymentRoutes");
const billingRoutes = require("./routes/Customer/endUserBilling");
const agencyBillRoutes = require("./routes/Customer/agencyBillingRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const dashboardRoutes = require("./routes/Customer/DashboardRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* Health Check */
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ClinixPay Main Server is running 🚀",
  });
});

/* Routes */
app.use("/api/v1", authRoutes);
app.use("/api/v1", customerRoutes);
//
app.use("/api/v1/admin", adminAuthRoutes,notificationRoutes);
app.use("/api/v1/customer", getNotificationRoutes);
app.use("/api/v1/admin", adminAuth,paymentRoutes);
//
app.use("/api/v1/customer", billingRoutes); 
app.use("/api/v1/customer/agency-bill", agencyBillRoutes);
app.use("/api/v1/customer/purchaseEntry", purchaseRoutes);
app.use("/api/v1/customer/inventory", inventoryRoutes);
app.use("/api/v1/customer/dashboard", dashboardRoutes);



/* Start Server */
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
