const Customer = require("../models/Customer");
const jwt = require("jsonwebtoken");
const axios = require("axios");

/* =========================
   REGISTER
========================= */
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      storeName,
      location,
      contactNo,
      email,
      gstNo,
      storeLicNo,
      clinixPayLicKey,
      password
    } = req.body;

    console.log("REQ BODY:", req.body);

    // 1️⃣ Check if user already exists
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // 2️⃣ Validate license from License Server
    const licenseRes = await axios.post(
      process.env.LICENSE_SERVER_VALIDATE_URL,
      { email, licenseKey: clinixPayLicKey }
    );

    if (!licenseRes.data.valid) {
      return res.status(400).json({
        message: "Invalid or expired license key"
      });
    }

    // 3️⃣ Create customer
    const customer = await Customer.create({
      fullName,
      storeName,
      location,
      contactNo,
      email,
      gstNo,
      storeLicNo,
      clinixPayLicKey,
      password
    });

    
   return res.status(201).json({
      success: true,
      message: "Registration successful. Please login.",
      user: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        storeName: customer.storeName
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};
/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // how can we check user have internet connection?
    const internetCheck = await axios.get("https://www.google.com", { timeout: 5000 });
    if (!internetCheck) {
      return res.status(503).json({
        success: false,
        message: "No internet connection"
      });
    }

    // 1️⃣ Find customer
    const customer = await Customer.findOne({ email }).select("+password");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled"
      });
    }

    // 2️⃣ Check password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

     // 3️⃣ 🔐 LICENSE SERVER CHECK
    // const licenseRes = await axios.post(
    //   process.env.LICENSE_SERVER_LOGIN_CHECK_URL, // 👈 NEW ENV
    //   {
    //     email: customer.email,
    //     licenseKey: customer.clinixPayLicKey
    //   },
    //   {
    //     timeout: 5000 // avoid hanging login
    //   }
    // );

    // if (!licenseRes.data.allowed) {
    //   return res.status(403).json({
    //     success: false,
    //     message: licenseRes.data.message || "License invalid"
    //   });
    // }

      // 4️⃣ Generate JWT
    const token = jwt.sign(
      { customerId: customer._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        storeName: customer.storeName
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};