const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
{
    fullName: {
        firstName: { type: String, required: true, trim: true },
        middleName: { type: String, trim: true },
        lastName: { type: String, required: true, trim: true }
    },

    storeName: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    contactNo: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    gstNo: {
        type: String,
        required: true
    },

    storeLicNo: {
        type: String,
        required: true
    },

    clinixPayLicKey: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Register", registerSchema);
