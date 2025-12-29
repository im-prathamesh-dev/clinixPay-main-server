const mongoose = require("mongoose");

const endUserBillSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    // Patient + Doctor
    patientName: { type: String, required: true },
    patientMobile: { type: String },
    doctorName: { type: String, required: true },

    // Medicines / Services
    items: [
      {
        name: String,
        qty: Number,
        price: Number,
        total: Number
      }
    ],

    // Calculation
    subTotal: Number,
    discount: { type: Number, default: 0 },
    grandTotal: Number,

    // Payment
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card"]
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
