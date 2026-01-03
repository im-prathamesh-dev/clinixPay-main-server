const EndUserBill = require("../../models/EndUserBill");
const mongoose = require("mongoose");

exports.last7DaysCollection = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.customerId);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const data = await EndUserBill.aggregate([
  {
    $match: {
      customerId,
      status: "FINAL",
      billDate: { $gte: last7Days, $lte: today }
    }
  },
  {
    $group: {
      _id: { $dayOfWeek: "$billDate" }, // 1–7
      totalAmount: { $sum: "$grandTotal" },
      totalBills: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      dayNumber: "$_id",
      totalAmount: 1,
      totalBills: 1,
      dayName: {
        $arrayElemAt: [
          ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
          { $subtract: ["$_id", 1] }
        ]
      }
    }
  },
  { $sort: { dayNumber: 1 } }
]);


    res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("❌ DASHBOARD ERROR =>", err);

    res.status(500).json({
      success: false,
      message: "Dashboard graph error"
    });
  }
};
