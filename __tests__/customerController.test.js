// __tests__/customerController.test.js
const Customer = require("../models/Customer");
const jwt = require("jsonwebtoken");
const {
  getCustomerDetails,
  updateCustomer
} = require("../controllers/Customer/customerController");
const authMiddleware = require("../middlewares/authMiddleware");

jest.mock("../models/Customer");
jest.mock("jsonwebtoken");

describe("Customer Controller", () => {
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

  // =========================
  // getCustomerDetails
  // =========================
  describe("getCustomerDetails", () => {
    it("should fetch customer details successfully", async () => {
      req.user = { customerId: "12345" };
      const mockCustomer = {
        _id: "12345",
        fullName: { firstName: "Test", lastName: "User" },
      };

      Customer.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCustomer),
      });

      await getCustomerDetails(req, res);

      expect(Customer.findById).toHaveBeenCalledWith("12345");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        customer: mockCustomer,
        message: "Customer details fetched successfully",
      });
    });

    it("should return 404 if customer not found", async () => {
      req.user = { customerId: "12345" };

      Customer.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getCustomerDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Customer not found",
      });
    });

    it("should handle errors", async () => {
      req.user = { customerId: "12345" };

      Customer.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error("DB error")),
      });

      await getCustomerDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch customer details",
      });
    });
  });

  // =========================
  // updateCustomer
  // =========================
  describe("updateCustomer", () => {
    it("should update allowed customer fields successfully", async () => {
      req.user = { customerId: "12345" };
      req.body = {
        fullName: { firstName: "Updated", lastName: "Name" },
        storeName: "New Store",
        location: "New Location",
        contactNo: "9876543210",
        gstNo: "27ABCDE1234F1Z5",
        storeLicNo: "LIC12345",
        password: "secret123", // ignored
      };

      const mockUpdatedCustomer = {};
      Customer.findByIdAndUpdate.mockResolvedValue(mockUpdatedCustomer);

      await updateCustomer(req, res);

      expect(Customer.findByIdAndUpdate).toHaveBeenCalledWith(
        "12345",
        {
          fullName: { firstName: "Updated", lastName: "Name" },
          storeName: "New Store",
          location: "New Location",
          contactNo: "9876543210",
          gstNo: "27ABCDE1234F1Z5",
          storeLicNo: "LIC12345",
        },
        { new: true }
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        customer: mockUpdatedCustomer,
      });
    });
  });

  // =========================
  // authMiddleware  ✅ FIXED
  // =========================
  describe("authMiddleware", () => {
    it("should set req.user if token is valid", () => {
      const mockReq = {
        headers: { authorization: "Bearer validtoken" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      jwt.verify.mockReturnValue({ customerId: "12345" });

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({ customerId: "12345" });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 401 if no token provided", () => {
      const mockReq = { headers: {} };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      authMiddleware(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Authorization token missing",
      });
    });

    it("should return 401 if token is invalid", () => {
      const mockReq = {
        headers: { authorization: "Bearer invalidtoken" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      jwt.verify.mockImplementation(() => {
        throw new Error("invalid");
      });

      authMiddleware(mockReq, mockRes, next);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid token",
      });
    });
  });
});
