const request = require("supertest");
const express = require("express");

const purchaseRoutes = require("../routes/purchaseRoutes");
const purchaseController = require("../controllers/purchaseController");

jest.mock("../controllers/purchaseController");

// mock customerAuth
jest.mock("../middlewares/customerAuth", () =>
  jest.fn((req, res, next) => {
    req.user = {
      customerId: "cust123",
      storeName: "Test Store",
    };
    next();
  })
);

describe("Purchase Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", purchaseRoutes);
    jest.clearAllMocks();
  });

  // ===== CREATE PURCHASE =====
  it("POST /purchase should call createPurchase", async () => {
    purchaseController.createPurchase.mockImplementation((req, res) =>
      res.status(201).json({ success: true })
    );

    const res = await request(app)
      .post("/purchase")
      .send({
        supplier: { name: "ABC", gstin: "27AAAA" },
        items: [{ productName: "PCM", qty: 10 }],
      });

    expect(res.statusCode).toBe(201);
    expect(purchaseController.createPurchase).toHaveBeenCalled();
  });

  // ===== GET PURCHASES =====
  it("GET /purchase should call getPurchases", async () => {
    purchaseController.getPurchases.mockImplementation((req, res) =>
      res.json({ success: true })
    );

    const res = await request(app).get("/purchase");

    expect(res.statusCode).toBe(200);
    expect(purchaseController.getPurchases).toHaveBeenCalled();
  });

  // ===== GET SINGLE PURCHASE =====
  it("GET /purchase/:id should call getPurchaseById", async () => {
    purchaseController.getPurchaseById.mockImplementation((req, res) =>
      res.json({ success: true })
    );

    const res = await request(app).get("/purchase/123");

    expect(res.statusCode).toBe(200);
    expect(purchaseController.getPurchaseById).toHaveBeenCalled();
  });
});
