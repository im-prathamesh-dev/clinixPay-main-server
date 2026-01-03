const EndUserBill = require("../../models/EndUserBill");

/**
 * @desc    Get end-customer bills (Logged-in customer only)
 * @route   GET /api/v1/customer/end-users
 * @access  Private (Customer)
 */
exports.getEndUsersData = async (req, res) => {
  try {
    /* =============================
       AUTH CONTEXT
    ============================= */
    const customerId = req.user?.customerId; // from JWT
    // console.log("🔑 customerId:", customerId);

    /* =============================
       QUERY PARAMS
    ============================= */
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const search = req.query.search || "";

    /* =============================
       FILTER (CRITICAL SECURITY)
    ============================= */
    const filter = {
      customerId, // 🔐 only own data
    };

    // Search by bill no / customer name / mobile
    if (search) {
      filter.$or = [
        { billNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerMobile: { $regex: search, $options: "i" } },
      ];
    }

    /* =============================
       DATABASE CALLS
    ============================= */
    const [totalCount, bills] = await Promise.all([
      EndUserBill.countDocuments(filter),
      EndUserBill.find(filter)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    /* =============================
       RESPONSE
    ============================= */
    res.status(200).json({
      success: true,
      message: "Bills fetched successfully",
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      data: bills,
    });
  } catch (error) {
    console.error("❌ getEndUsersData error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
