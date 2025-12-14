require("dotenv").config(); 

const express = require("express");
const http = require("http");
const connectDB = require("./config/connection");
const registerRoutes = require("./Routes/registerRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- Middleware -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ClinixPay Main Server is running 🚀",
  });
});


app.use("/api/v1", registerRoutes);
/* -------------------- Start Server -------------------- */
const startServer = async () => {
  try {
    await connectDB(); 

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    /* ---------------- Graceful Shutdown ---------------- */
    const shutdown = async () => {
      console.log("🔴 Shutting down server...");
      await require("mongoose").connection.close();
      server.close(() => {
        console.log("✅ Server closed gracefully");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
