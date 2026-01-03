const {
  createPurchase,
  getPurchases,
  getPurchaseById,
} = require("../controllers/purchaseController");

const Purchase = require("../models/Purchase");
const Inventory = require("../models/Inventory");

jest.mock("../models/Purchase");
jest.mock("../models/Inventory");

describe("Purchase Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        customerId: "cust123",
        storeName: "Test Store",
      },
      body: {
        supplier: {
          name: "ABC Pharma",
          gstin: "27ABCDE1234F1Z5",
        },
        items: [
          {
            productName: "Paracetamol",
            batch: "B1",
            qty: 10,
            rate: 5,
          },
        ],
      },
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  /* ================= CREATE PURCHASE ================= */

  describe("createPurchase", () => {
    it("should create purchase & update inventory", async () => {
      Purchase.prototype.save = jest.fn().mockResolvedValue({ _id: "p1" });
      Inventory.findOneAndUpdate.mockResolvedValue({});

      await createPurchase(req, res);

      expect(Purchase.prototype.save).toHaveBeenCalled();
      expect(Inventory.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if supplier missing", async () => {
      req.body.supplier = null;

      await createPurchase(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 if user not logged in", async () => {
      req.user = null;

      await createPurchase(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should handle server error", async () => {
      Purchase.prototype.save = jest.fn().mockRejectedValue(new Error("DB error"));

      await createPurchase(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /* ================= GET PURCHASES ================= */

  describe("getPurchases", () => {
    it("should return purchase list", async () => {
      Purchase.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ _id: "p1" }]),
        }),
      });

      await getPurchases(req, res);

      expect(Purchase.find).toHaveBeenCalledWith({
        customerId: "cust123",
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        purchases: [{ _id: "p1" }],
      });
    });

    it("should handle error", async () => {
      Purchase.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });

      await getPurchases(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  /* ================= GET PURCHASE BY ID ================= */

  describe("getPurchaseById", () => {
    it("should return purchase by id", async () => {
      req.params.id = "p1";
      Purchase.findOne.mockResolvedValue({ _id: "p1" });

      await getPurchaseById(req, res);

      expect(Purchase.findOne).toHaveBeenCalledWith({
        _id: "p1",
        customerId: "cust123",
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        purchase: { _id: "p1" },
      });
    });

    it("should return 404 if not found", async () => {
      req.params.id = "p1";
      Purchase.findOne.mockResolvedValue(null);

      await getPurchaseById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should handle error", async () => {
      Purchase.findOne.mockRejectedValue(new Error("DB error"));

      await getPurchaseById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
