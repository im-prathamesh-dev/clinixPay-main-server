const Purchase = require("../models/Purchase");
const Inventory = require("../models/Inventory");

/**
 * CREATE PURCHASE + UPDATE INVENTORY
 */
exports.createPurchase = async (req, res) => {
  try {
    const { supplier, invoice, items, summary, gstBreakup } = req.body;

    // Basic validations
    if (!supplier || !supplier.name || !supplier.gstin) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and GSTIN are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    // Logged in customer/store
    const customerId = req.user?.customerId;
    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Create purchase document
    const purchase = new Purchase({
      customerId,
      storeName: req.user?.storeName,
      supplier,
      invoice,
      items,
      summary,
      gstBreakup,
      createdBy: customerId,
    });

    await purchase.save();

    /**
     * UPDATE INVENTORY FOR EACH ITEM
     */
    for (const item of items) {
      if (!item.productName || !item.batch) continue;

      await Inventory.findOneAndUpdate(
        {
          customerId,
          productName: item.productName,
          batch: item.batch,
        },
        {
          $inc: { qty: item.qty || 0 },
          $set: {
            hsn: item.hsn,
            exp: item.exp,
            mrp: item.mrp,
            purchaseRate: item.rate,
            gstPercent: item.gstPercent,
            supplierName: supplier.name,
            lastUpdatedBy: customerId,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Purchase saved and inventory updated successfully",
      purchase,
    });
  } catch (error) {
    console.error("createPurchase error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save purchase",
    });
  }
};

/**
 * GET PURCHASES (CUSTOMER WISE)
 */
exports.getPurchases = async (req, res) => {
  try {
    const customerId = req.user?.customerId;

    const purchases = await Purchase.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
    });
  }
};

/**
 * GET SINGLE PURCHASE
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.customerId;

    const purchase = await Purchase.findOne({
      _id: id,
      customerId,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
    });
  }
};
