const EndUserBill = require("../../models/EndUserBill");

// 🔹 CREATE DRAFT BILL (Editable)
exports.createDraftBill = async (req, res) => {
  

  console.log("📥 Received bill data:", req.body);

  try {
    console.log("Decoded user in controller:", req.user);
    const customerId = req.user?.customerId || null; // ✅ from JWT

    const {
      patientName,
      patientMobile,
      doctorName,
      items,
      discount,
      paymentMode
    } = req.body;

    if (!patientName || patientName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "patientName is required"
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required"
      });
    }

    // Calculate totals
    let subTotal = 0;
    items.forEach(i => {
      i.total = i.qty * i.price;
      subTotal += i.total;
    });

    const grandTotal = subTotal - (discount || 0);

    // Normalize payment mode
    let normalizedPaymentMode = "Cash";
    if (paymentMode) {
      const mode = paymentMode.toLowerCase();
      if (mode === "upi") normalizedPaymentMode = "UPI";
      else if (mode === "card") normalizedPaymentMode = "Card";
      else if (mode === "online") normalizedPaymentMode = "UPI";
    }

    const bill = await EndUserBill.create({
      customerId, // ✅ SAFE
      patientName: patientName.trim(),
      patientMobile: patientMobile || "",
      doctorName: doctorName?.trim() || "",
      items,
      subTotal,
      discount: discount || 0,
      grandTotal,
      paymentMode: normalizedPaymentMode,
      status: "DRAFT"
    });

    res.json({
      success: true,
      message: "Draft bill created successfully",
      bill
    });

  } catch (err) {
    console.error("❌ Error in createDraftBill:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// 🔹 UPDATE DRAFT BILL (EDIT WHILE BILLING)
exports.updateDraftBill = async (req, res) => {
  console.log('📥 Update bill data for ID:', req.params.id, req.body);
  
  try {
    const billId = req.params.id;
    const { items, discount, paymentMode } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one item is required" 
      });
    }

    // Calculate totals
    let subTotal = 0;
    items.forEach(i => {
      i.total = i.qty * i.price;
      subTotal += i.total;
    });

    const grandTotal = subTotal - (discount || 0);

    // Normalize payment mode
    let normalizedPaymentMode = "Cash";
    if (paymentMode) {
      const mode = paymentMode.toLowerCase();
      if (mode === 'cash') normalizedPaymentMode = 'Cash';
      else if (mode === 'upi') normalizedPaymentMode = 'UPI';
      else if (mode === 'card') normalizedPaymentMode = 'Card';
      else if (mode === 'online') normalizedPaymentMode = 'UPI';
    }

    // Find and update only if status is DRAFT
    const bill = await EndUserBill.findOneAndUpdate(
      { _id: billId, status: "DRAFT" },
      { 
        items, 
        subTotal, 
        discount: discount || 0, 
        grandTotal, 
        paymentMode: normalizedPaymentMode 
      },
      { new: true, runValidators: true } // Add runValidators
    );

    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: "Draft bill not found or already finalized" 
      });
    }

    res.json({ 
      success: true, 
      message: "Draft bill updated",
      bill 
    });
    
  } catch (err) {
    console.error('❌ Error in updateDraftBill:', err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
  }
};

// 🔹 FINAL SAVE BILL (LOCK BILL)
exports.finalizeBill = async (req, res) => {
  console.log('🔐 Finalizing bill ID:', req.params.id);
  
  try {
    const bill = await EndUserBill.findByIdAndUpdate(
      req.params.id,
      { status: "FINAL" },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ 
        success: false, 
        message: "Bill not found" 
      });
    }

    console.log('✅ Bill finalized:', bill._id);
    
    res.json({ 
      success: true, 
      message: "Bill finalized successfully",
      bill 
    });
    
  } catch (err) {
    console.error('❌ Error in finalizeBill:', err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
  }
};

// 🔹 TODAY BILLS
exports.todayBills = async (req, res) => {
  console.log('📅 Fetching today\'s bills');
  
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const bills = await EndUserBill.find({
      billDate: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(`✅ Found ${bills.length} bills for today`);
    
    res.json({
      success: true,
      count: bills.length,
      bills
    });
    
  } catch (err) {
    console.error('❌ Error in todayBills:', err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
  }
};