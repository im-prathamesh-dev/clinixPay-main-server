// __tests__/agencyBillController.test.js
const mongoose = require("mongoose");
const AgencyBill = require("../models/AgencyBill");
const {
  createDraftAgencyBill,
  updateDraftAgencyBill,
  finalizeAgencyBill,
  getAgencyBillsByCustomer,
  getAgencyBillById,
} = require("../controllers/Customer/agencyBillingController");

// Mock the Mongoose model
jest.mock("../models/AgencyBill");

describe("AgencyBill Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createDraftAgencyBill", () => {
    it("should create a draft agency bill successfully", async () => {
      req.user = { customerId: "12345" };
      req.body = {
        agencyName: "Test Agency",
        agencyContact: "9999999999",
        subTotal: 100,
        grandTotal: 110,
        items: [],
      };

      const mockBill = { ...req.body, status: "DRAFT" };
      AgencyBill.create.mockResolvedValue(mockBill);

      await createDraftAgencyBill(req, res);

      expect(AgencyBill.create).toHaveBeenCalledWith({
        ...req.body,
        customerId: "12345",
        status: "DRAFT",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Draft agency bill created",
        bill: mockBill,
      });
    });

    it("should return 400 if customerId is missing", async () => {
      req.user = {};
      req.body = {};

      await createDraftAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "customerId is required to create an agency bill",
      });
    });

    it("should handle errors", async () => {
      req.user = { customerId: "12345" };
      req.body = { agencyName: "Test" };
      AgencyBill.create.mockRejectedValue(new Error("DB error"));

      await createDraftAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create draft agency bill",
      });
    });
  });

  describe("updateDraftAgencyBill", () => {
    it("should update a draft agency bill", async () => {
      const mockBill = {
        _id: "1",
        status: "DRAFT",
        save: jest.fn(),
      };
      req.params = { id: "1" };
      req.body = { agencyName: "Updated Name" };
      AgencyBill.findById.mockResolvedValue(mockBill);

      await updateDraftAgencyBill(req, res);

      expect(mockBill.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Draft agency bill updated",
        bill: mockBill,
      });
    });

    it("should return 404 if bill not found", async () => {
      req.params = { id: "1" };
      AgencyBill.findById.mockResolvedValue(null);

      await updateDraftAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Agency bill not found",
      });
    });

    it("should return 400 if bill is not draft", async () => {
      const mockBill = { status: "FINAL" };
      req.params = { id: "1" };
      AgencyBill.findById.mockResolvedValue(mockBill);

      await updateDraftAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Only draft bills can be updated",
      });
    });
  });

  describe("finalizeAgencyBill", () => {
    it("should finalize a draft bill", async () => {
      const mockBill = {
        status: "DRAFT",
        paymentMode: "CREDIT",
        creditTerms: 10,
        save: jest.fn(),
      };
      req.params = { id: "1" };
      AgencyBill.findById.mockResolvedValue(mockBill);

      await finalizeAgencyBill(req, res);

      expect(mockBill.status).toBe("FINAL");
      expect(mockBill.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Agency bill finalized",
        bill: mockBill,
      });
    });

    it("should return 404 if bill not found", async () => {
      req.params = { id: "1" };
      AgencyBill.findById.mockResolvedValue(null);

      await finalizeAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Agency bill not found",
      });
    });

    it("should return 400 if already finalized", async () => {
      const mockBill = { status: "FINAL" };
      req.params = { id: "1" };
      AgencyBill.findById.mockResolvedValue(mockBill);

      await finalizeAgencyBill(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Bill already finalized",
      });
    });
  });

  describe("getAgencyBillsByCustomer", () => {
    it("should fetch bills for a customer", async () => {
      const bills = [{ _id: "1" }, { _id: "2" }];
      req.params = { customerId: "12345" };
      AgencyBill.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(bills),
      });

      await getAgencyBillsByCustomer(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bills,
      });
    });
  });

  describe("getAgencyBillById", () => {
    it("should fetch a single bill", async () => {
      const bill = { _id: "1" };
      req.params = { id: "1" };
      AgencyBill.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(bill) });

      await getAgencyBillById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        bill,
      });
    });

    it("should return 404 if bill not found", async () => {
      req.params = { id: "1" };
      AgencyBill.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await getAgencyBillById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Agency bill not found",
      });
    });
  });
});
