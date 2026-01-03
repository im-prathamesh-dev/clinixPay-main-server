// __tests__/adminPaymentsController.test.js
const request = require("supertest");
const express = require("express");
const paymentsRouter = require("../routes/Admin/Payments/paymentRoutes");
const Razorpay = require("razorpay");

// Mock Razorpay
jest.mock("razorpay");

const mockPayments = {
  items: [
    { id: "pay_1", amount: 50000 },
    { id: "pay_2", amount: 150000 },
  ]
};

// Mock Razorpay instance and payments.all
Razorpay.mockImplementation(() => ({
  payments: {
    all: jest.fn().mockResolvedValue(mockPayments)
  }
}));

// Mock auth middleware to just call next()
jest.mock("../middlewares/adminAuth", () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use("/api/admin", paymentsRouter);

describe("GET /api/admin/payments", () => {
  it("should fetch payments and return success response", async () => {
    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", "Bearer dummy-token");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(mockPayments.items.length);
    expect(res.body.amountinrupees).toBe(
      mockPayments.items.reduce((acc, p) => acc + p.amount, 0) / 100
    );
    expect(res.body.payments).toEqual(mockPayments.items);
  });

  it("should handle errors gracefully", async () => {
    // Mock Razorpay to throw an error
    Razorpay.mockImplementationOnce(() => ({
      payments: {
        all: jest.fn().mockRejectedValue(new Error("Razorpay Error"))
      }
    }));

    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", "Bearer dummy-token");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Failed to fetch payment history");
  });
});
