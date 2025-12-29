require("dotenv").config();

const express = require("express");
const connectDB = require("./config/connection");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/Customer/customerRoutes");
const notificationRoutes = require("./routes/Admin/notificationRoute")
const getNotificationRoutes = require("./routes/Customer/customerRoutes");
const cors = require("cors");
const adminAuth = require("./middlewares/adminAuth");
const adminAuthRoutes = require("./routes/Admin/adminAuthRoutes");
const paymentRoutes = require("./routes/Admin/Payments/paymentRoutes");
const billingRoutes=require("./controllers/Customer/endUserBilling");


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
app.use("/api/v1/admin", adminAuthRoutes,notificationRoutes);
app.use("/api/v1/customer", getNotificationRoutes);
app.use("/api/v1/admin", adminAuth,paymentRoutes);
app.use("/api/v1/customer", billingRoutes); 



/* Start Server */
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
