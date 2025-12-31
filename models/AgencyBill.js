// models/AgencyBill.js
const mongoose = require("mongoose");

const agencyBillSchema = new mongoose.Schema(
  {
    // 🏪 Which store (your customer) created this bill
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    // 🏢 Agency details (SNAPSHOT from frontend)
    agencyName: { type: String, required: true },
    agencyContact: { type: String, required: true },
    agencyEmail: { type: String },
    agencyGSTIN: { type: String },
    agencyAddress: { type: String },
    contactPerson: { type: String },
    creditTerms: { type: Number, default: 0 },

    // Medicines / Products
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        gst: { type: Number, default: 0 },
        total: { type: Number, required: true }
      }
    ],

    // Calculations
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Payment (Agency allows CREDIT)
    paymentMode: {
      type: String,
      enum: ["CASH", "UPI", "Card", "ONLINE", "CREDIT"],
      default: "CREDIT"
    },

    paidAmount: { type: Number, default: 0 },

    dueAmount: {
      type: Number,
      default: function () {
        return this.grandTotal;
      }
    },

    dueDate: { type: Date },

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

module.exports = mongoose.model("AgencyBill", agencyBillSchema);
