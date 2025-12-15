const Register = require("../models/Coustomer");
const asyncHandler = require("../middlewares/asyncHandler");

exports.registerStore = asyncHandler(async (req, res) => {

    const {
        fullName,
        storeName,
        location,
        contactNo,
        email,
        gstNo,
        storeLicNo,
        clinixPayLicKey
    } = req.body;

    const exists = await Register.findOne({ email });
    if (exists) {
        return res.status(400).json({
            success: false,
            message: "Email already registered"
        });
    }

    const data = await Register.create({
        fullName,
        storeName,
        location,
        contactNo,
        email,
        gstNo,
        storeLicNo,
        clinixPayLicKey
    });

    res.status(201).json({
        success: true,
        message: "Registration successful",
        data
    });
});
