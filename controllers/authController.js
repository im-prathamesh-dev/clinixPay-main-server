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

    // 1️⃣ Check if user already exists
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 2️⃣ Validate license from License Server
    // const licenseRes = await axios.post(
    //   process.env.LICENSE_SERVER_VALIDATE_URL,
    //   { email, licenseKey: clinixPayLicKey }
    // );

    // if (!licenseRes.data.valid) {
    //   return res.status(400).json({
    //     message: "Invalid or expired license key"
    //   });
    // }

    // 3️⃣ Create customer
    await Customer.create({
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

    // 4️⃣ Activate license
    // await axios.post(
    //   process.env.LICENSE_SERVER_ACTIVATE_URL,
    //   { email, licenseKey: clinixPayLicKey }
    // );

    res.status(201).json({
      message: "Registration successful. Please login."
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({
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

    // 1️⃣ Find customer
    const customer = await Customer.findOne({ email }).select("+password");
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!customer.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    // 2️⃣ Check password
    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Check license status
    // const licenseRes = await axios.post(
    //   process.env.LICENSE_SERVER_STATUS_URL,
    //   {
    //     email,
    //     licenseKey: customer.clinixPayLicKey
    //   }
    // );

    // if (!licenseRes.data.active) {
    //   return res.status(403).json({
    //     message: "License expired or suspended"
    //   });
    // }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { customerId: customer._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};
