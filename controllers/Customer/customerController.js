const Customer = require("../../models/Customer");

exports.getCustomerDetails = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.customerId).select("-password");
    // console.log(customer);
    

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      customer,
      message: "Customer details fetched successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer details"
    });
  }
};
exports.updateCustomer = async (req, res) => {
  const allowedFields = [
    "fullName",
    "storeName",
    "location",
    "contactNo",
    "gstNo",
    "storeLicNo"
  ];

  const updates = {};
  allowedFields.forEach(key => {
    if (req.body[key]) updates[key] = req.body[key];
  });

  const customer = await Customer.findByIdAndUpdate(
    req.user.customerId,
    updates,
    { new: true }
  );

  res.json({ success: true, customer });
};
