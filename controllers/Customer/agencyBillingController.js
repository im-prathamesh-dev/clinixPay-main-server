// controllers/agencyBill.controller.js
const AgencyBill = require("../../models/AgencyBill");

/**
 * CREATE DRAFT AGENCY BILL
 * POST /api/agency-bill/draft
 */
exports.createDraftAgencyBill = async (req, res) => {
  console.log("📥 Received bill data:", req.body);
  
  try {
     console.log("Decoded user in controller:", req.user);
    const customerId = req.user?.customerId || req.body?.customerId || null; // try JWT then body

    if (!customerId) {
      console.warn("No customerId in req.user or req.body - rejecting request");
      return res.status(400).json({
        success: false,
        message: "customerId is required to create an agency bill",
      });
    }

    const billData = {
      ...req.body,
      customerId,
      status: "DRAFT",
    };

    console.log("Creating agency bill with:", billData);

    const bill = await AgencyBill.create(billData);

    res.status(201).json({
      success: true,
      message: "Draft agency bill created",
      bill,
    });
  } catch (error) {
    console.error("Create draft error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create draft agency bill",
    });
  }
};

/**
 * UPDATE DRAFT AGENCY BILL
 * PUT /api/agency-bill/draft/:id
 */
exports.updateDraftAgencyBill = async (req, res) => {
  try {
    const bill = await AgencyBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Agency bill not found",
      });
    }

    if (bill.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft bills can be updated",
      });
    }

    Object.assign(bill, req.body);
    await bill.save();

    res.json({
      success: true,
      message: "Draft agency bill updated",
      bill,
    });
  } catch (error) {
    console.error("Update draft error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update draft agency bill",
    });
  }
};

/**
 * FINALIZE AGENCY BILL
 * PUT /api/agency-bill/final/:id
 */
exports.finalizeAgencyBill = async (req, res) => {
  try {
    const bill = await AgencyBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Agency bill not found",
      });
    }

    if (bill.status === "FINAL") {
      return res.status(400).json({
        success: false,
        message: "Bill already finalized",
      });
    }

    // Calculate due date if credit
    if (bill.paymentMode === "CREDIT" && bill.creditTerms > 0) {
      bill.dueDate = new Date(
        Date.now() + bill.creditTerms * 24 * 60 * 60 * 1000
      );
    }

    bill.status = "FINAL";
    await bill.save();

    res.json({
      success: true,
      message: "Agency bill finalized",
      bill,
    });
  } catch (error) {
    console.error("Finalize bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to finalize agency bill",
    });
  }
};

/**
 * GET ALL AGENCY BILLS OF A CUSTOMER (STORE)
 * GET /api/agency-bill/customer/:customerId
 */
exports.getAgencyBillsByCustomer = async (req, res) => {
  try {
    const bills = await AgencyBill.find({
      customerId: req.params.customerId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("Fetch bills error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agency bills",
    });
  }
};

/**
 * GET SINGLE AGENCY BILL
 * GET /api/agency-bill/:id
 */
exports.getAgencyBillById = async (req, res) => {
  try {
    const bill = await AgencyBill.findById(req.params.id)
      .populate("customerId");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Agency bill not found",
      });
    }

    res.json({
      success: true,
      bill,
    });
  } catch (error) {
    console.error("Fetch bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch agency bill",
    });
  }
};
