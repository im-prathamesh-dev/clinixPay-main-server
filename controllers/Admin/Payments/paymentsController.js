// here i want create an controller for admin where he can take look on all payment is done by 
// customer for License purchase but my lic server in springboot so here we have to apply some logic to get that data here and using rest api show that data in table format in admin payment and transaction section we have to display this data 

// File: controllers/Admin/paymentsController.js
// const axios = require("axios");
// exports.getAllPayments = async (req, res) => {
//   try {
//     // Replace with your actual License server API endpoint
//     const response = await axios.get("https://license-server.example.com/api/payments", {
//       headers: {
//         Authorization: `Bearer ${req.headers.authorization}`,
//       },
//     });

//     res.json({
//         success: true,
//         message: "Payments fetched successfully",
//         data: response.data
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const Razorpay = require("razorpay");

/**
 * GET /api/admin/payments
 * Query params:
 *  - count (default 20)
 *  - skip (default 0)
 */
exports.getAllPayments = async (req, res) => {
  try {
    // 🔐 Optional: role check (recommended)
    // if (req.user?.role !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Access denied"
    //   });
    // }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const count = Number(req.query.count) || 20;
    const skip = Number(req.query.skip) || 0;

    const payments = await razorpay.payments.all({
      count,
      skip
    });

    return res.status(200).json({
      success: true,
      total: payments.items.length,
      payments: payments.items,
      amountinrupees: payments.items.reduce((acc, payment) => acc + payment.amount, 0) / 100

    });

  } catch (error) {
    console.error("Razorpay Fetch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history"
    });
  }
};
