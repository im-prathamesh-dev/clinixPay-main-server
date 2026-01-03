const Inventory = require("../models/Inventory");

/**
 * GET INVENTORY (STOCK LIST)
 */
exports.getInventory = async (req, res) => {
  try {
    const customerId = req.user?.customerId;

    const inventory = await Inventory.find({ customerId }).sort({
      productName: 1,
      exp: 1,
    });

    res.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("getInventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

/**
 * UPDATE INVENTORY (MANUAL EDIT BY CUSTOMER)
 */
exports.updateInventory = async (req, res) => {
  try {
    const customerId = req.user?.customerId;
    const { id } = req.params;
    const { qty, mrp, exp, lowStockAlert } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      {
        _id: id,
        customerId,
      },
      {
        $set: {
          ...(qty !== undefined && { qty }),
          ...(mrp !== undefined && { mrp }),
          ...(exp !== undefined && { exp }),
          ...(lowStockAlert !== undefined && { lowStockAlert }),
          lastUpdatedBy: customerId,
        },
      },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("updateInventory error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory",
    });
  }
};

/**
 * DELETE INVENTORY ITEM (OPTIONAL)
 */
exports.deleteInventory = async (req, res) => {
  try {
    const customerId = req.user?.customerId;
    const { id } = req.params;

    const deleted = await Inventory.findOneAndDelete({
      _id: id,
      customerId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Inventory item deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
};
