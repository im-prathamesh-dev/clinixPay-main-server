const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    productName: { type: String, required: true },
    hsn: { type: String },
    batch: { type: String },
    exp: { type: String },

    qty: { type: Number, default: 0 },      // current stock
    mrp: { type: Number, default: 0 },
    purchaseRate: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },

    supplierName: { type: String },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    lowStockAlert: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Unique product per store + batch
inventorySchema.index(
  { customerId: 1, productName: 1, batch: 1 },
  { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
