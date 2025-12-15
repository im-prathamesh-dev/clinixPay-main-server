require("dotenv").config();

const express = require("express");
const connectDB = require("./config/connection");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
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

/* Start Server */
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
