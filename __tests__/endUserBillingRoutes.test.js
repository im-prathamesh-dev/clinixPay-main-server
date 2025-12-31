const request = require("supertest");
const express = require("express");

const billingRoutes = require("../routes/Customer/endUserBilling");
const EndUserBill = require("../models/EndUserBill");

// 🔹 mock auth middleware (customerAuth)
jest.mock("../middlewares/customerAuth", () => {
  return (req, res, next) => {
    req.user = { customerId: "cust123" };
    next();
  };
});

// 🔹 mock model
jest.mock("../models/EndUserBill");

const app = express();
app.use(express.json());
app.use("/api", billingRoutes);

describe("End User Billing Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // CREATE DRAFT BILL
  // ============================
  it("POST /api/bill/draft → should create draft bill", async () => {
    const mockBill = {
      _id: "bill1",
      patientName: "Rahul",
      status: "DRAFT"
    };

    EndUserBill.create.mockResolvedValue(mockBill);

    const res = await request(app)
      .post("/api/bill/draft")
      .send({
        patientName: "Rahul",
        items: [{ name: "Tab", qty: 2, price: 10 }],
        discount: 0
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bill).toEqual(mockBill);
  });

  // ============================
  // UPDATE DRAFT BILL
  // ============================
  it("PUT /api/bill/draft/:id → should update draft bill", async () => {
    const mockUpdatedBill = {
      _id: "bill1",
      status: "DRAFT"
    };

    EndUserBill.findOneAndUpdate.mockResolvedValue(mockUpdatedBill);

    const res = await request(app)
      .put("/api/bill/draft/bill1")
      .send({
        items: [{ name: "Syrup", qty: 1, price: 50 }],
        discount: 10
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bill).toEqual(mockUpdatedBill);
  });

  // ============================
  // FINALIZE BILL
  // ============================
  it("PUT /api/bill/final/:id → should finalize bill", async () => {
    const mockFinalBill = {
      _id: "bill1",
      status: "FINAL"
    };

    EndUserBill.findByIdAndUpdate.mockResolvedValue(mockFinalBill);

    const res = await request(app).put("/api/bill/final/bill1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bill.status).toBe("FINAL");
  });

  // ============================
  // TODAY BILLS
  // ============================
  it("GET /api/bill/today → should return today's bills", async () => {
    EndUserBill.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ _id: "bill1" }])
    });

    const res = await request(app).get("/api/bill/today");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  // ============================
  // GET ALL BILLS
  // ============================
  it("GET /api/bill/allbills → should return all customer bills", async () => {
    EndUserBill.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ _id: "bill1" }])
    });

    const res = await request(app).get("/api/bill/allbills");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });
});
