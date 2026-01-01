const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    hsn: { type: String },
    productName: { type: String, required: true },
    mfg: { type: String },
    unit: { type: String },
    qty: { type: Number, default: 1 },
    sch: { type: String },
    batch: { type: String },
    exp: { type: String },
    mrp: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    disc: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    calculations: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    // Which store/customer created this purchase (multi-store support)
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    // Snapshot of store info to avoid extra joins later
    storeName: { type: String },
    supplier: {
      name: { type: String, required: true },
      address: { type: String },
      contact: { type: String },
      stateCode: { type: String },
      gstin: { type: String },
      pan: { type: String },
      dlNo: { type: String },
    },
    invoice: {
      type: { type: String },
      creditInvNo: { type: String },
      date: { type: Date },
      dueDate: { type: Date },
      salesman: { type: String },
    },
    items: [purchaseItemSchema],
    summary: {
      gross: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      lessAmount: { type: Number, default: 0 },
      addAmount: { type: Number, default: 0 },
      totalGST: { type: Number, default: 0 },
      net: { type: Number, default: 0 },
      amountInWords: { type: String },
    },
    gstBreakup: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
