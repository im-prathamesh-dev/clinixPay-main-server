const mongoose = require("mongoose");

const endUserBillSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      // Remove required: true or make it false
      required: false,
      default: null
    },

    // Patient + Doctor
    patientName: { type: String, required: true },
    patientMobile: { type: String },
    doctorName: { 
      type: String, 
      required: false, // Make it optional
      default: "" 
    },

    // Medicines / Services
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
      }
    ],

    // Calculation
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Payment
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card", "ONLINE"], // Added "ONLINE"
      default: "Cash"
    },

    // Bill State
    status: {
      type: String,
      enum: ["DRAFT", "FINAL"],
      default: "DRAFT"
    },

    billDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EndUserBill", endUserBillSchema);