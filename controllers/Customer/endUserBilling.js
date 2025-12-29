// design schema for enduser billing 
//create controller for enduser bill day to day paiteint billing opration perform 
// get stock from inventory then update stock , apply logic of discount and gst 
//docter name if freq use then user get that name suggestion on btn  tab to autocomplete 

// medicine check -> api fetch data from Inv magnt  - incre / decr in stock 
//carefully apply logic of gst and discount and store person can able to edit mrp price of product while biling 
// mode of payment UPI/CASH/card 
// bill print / whatsapp the bill 


const EndUserBill = require("../../models/EndUserBill");

// 🔹 CREATE DRAFT BILL (Editable)
exports.createDraftBill = async (req, res) => {
  try {
    const {
      customerId,
      patientName,
      patientMobile,
      doctorName,
      items,
      discount,
      paymentMode
    } = req.body;

    let subTotal = 0;
    items.forEach(i => {
      i.total = i.qty * i.price;
      subTotal += i.total;
    });

    const grandTotal = subTotal - (discount || 0);

    const bill = await EndUserBill.create({
      customerId,
      patientName,
      patientMobile,
      doctorName,
      items,
      subTotal,
      discount,
      grandTotal,
      paymentMode,
      status: "DRAFT"
    });

    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// 🔹 UPDATE DRAFT BILL (EDIT WHILE BILLING)
exports.updateDraftBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const { items, discount, paymentMode } = req.body;

    let subTotal = 0;
    items.forEach(i => {
      i.total = i.qty * i.price;
      subTotal += i.total;
    });

    const grandTotal = subTotal - (discount || 0);

    const bill = await EndUserBill.findOneAndUpdate(
      { _id: billId, status: "DRAFT" },
      { items, subTotal, discount, grandTotal, paymentMode },
      { new: true }
    );

    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// 🔹 FINAL SAVE BILL (LOCK BILL)
exports.finalizeBill = async (req, res) => {
  try {
    const bill = await EndUserBill.findByIdAndUpdate(
      req.params.id,
      { status: "FINAL" },
      { new: true }
    );

    res.json({ success: true, bill });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// 🔹 TODAY BILLS
exports.todayBills = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    const bills = await EndUserBill.find({
      billDate: { $gte: start, $lte: end }
    });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


