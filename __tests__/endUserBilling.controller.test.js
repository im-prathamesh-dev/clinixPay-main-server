// __tests__/endUserBilling.controller.test.js
const EndUserBill = require("../models/EndUserBill");
const {
  createDraftBill,
  updateDraftBill,
  finalizeBill,
  todayBills,
  getAllBills
} = require("../controllers/Customer/endUserBilling");

jest.mock("../models/EndUserBill");

describe("End User Billing Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { customerId: "cust123" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  // =========================
  // CREATE DRAFT BILL
  // =========================
  describe("createDraftBill", () => {
    it("should create draft bill successfully", async () => {
      req.body = {
        patientName: "Rahul",
        items: [{ name: "Med1", qty: 2, price: 50 }],
        discount: 10,
        paymentMode: "upi"
      };

      EndUserBill.create.mockResolvedValue({ _id: "bill1" });

      await createDraftBill(req, res);

      expect(EndUserBill.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Draft bill created successfully"
        })
      );
    });

    it("should return 400 if patientName missing", async () => {
      req.body = { items: [{ name: "Med1", qty: 1, price: 10 }] };

      await createDraftBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "patientName is required"
      });
    });
  });

  // =========================
  // UPDATE DRAFT BILL
  // =========================
  describe("updateDraftBill", () => {
    it("should update draft bill successfully", async () => {
      req.params.id = "bill123";
      req.body = {
        items: [{ name: "Med1", qty: 1, price: 100 }],
        discount: 20,
        paymentMode: "card"
      };

      EndUserBill.findOneAndUpdate.mockResolvedValue({ _id: "bill123" });

      await updateDraftBill(req, res);

      expect(EndUserBill.findOneAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Draft bill updated"
        })
      );
    });

    it("should return 404 if draft bill not found", async () => {
      req.params.id = "bill123";
      req.body = { items: [{ name: "Med1", qty: 1, price: 10 }] };

      EndUserBill.findOneAndUpdate.mockResolvedValue(null);

      await updateDraftBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // =========================
  // FINALIZE BILL
  // =========================
  describe("finalizeBill", () => {
    it("should finalize bill successfully", async () => {
      req.params.id = "bill123";
      EndUserBill.findByIdAndUpdate.mockResolvedValue({ status: "FINAL" });

      await finalizeBill(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Bill finalized successfully"
        })
      );
    });

    it("should return 404 if bill not found", async () => {
      req.params.id = "bill123";
      EndUserBill.findByIdAndUpdate.mockResolvedValue(null);

      await finalizeBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // =========================
  // TODAY BILLS
  // =========================
  describe("todayBills", () => {
    it("should return today bills", async () => {
      EndUserBill.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: "bill1" }])
      });

      await todayBills(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1
        })
      );
    });
  });

  // =========================
  // GET ALL BILLS
  // =========================
  describe("getAllBills", () => {
    it("should fetch all bills for customer", async () => {
      EndUserBill.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: "bill1" }])
      });

      await getAllBills(req, res);

      expect(EndUserBill.find).toHaveBeenCalledWith({
        customerId: "cust123"
      });

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1
        })
      );
    });
  });
});
