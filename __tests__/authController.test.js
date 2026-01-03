// __tests__/authController.test.js
const { login, register } = require("../controllers/Admin/authController");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock external dependencies
jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ================= REGISTER =================
  describe("REGISTER", () => {
    it("→ should create a new user successfully", async () => {
      req.body = {
        fullName: { firstName: "Rahul", lastName: "Patil" },
        storeName: "ABC Medical",
        location: "Pune",
        contactNo: "9876543210",
        email: "test@mail.com",
        gstNo: "27ABCDE1234F1Z5",
        storeLicNo: "LIC123",
        clinixPayLicKey: "ABCDEFGHIJKL",
        password: "password123",
      };

      // Mock User.create
      User.create.mockResolvedValue({ _id: "123", ...req.body });

      await register(req, res);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User registered successfully",
          data: expect.objectContaining({ _id: "123" }),
        })
      );
    });

    it("→ should handle errors during registration", async () => {
      req.body = {};
      User.create.mockRejectedValue(new Error("DB Error"));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });

  // ================= LOGIN =================
  describe("LOGIN", () => {
    it("→ user not found", async () => {
      req.body = { email: "test@mail.com", password: "password123" };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("→ invalid password", async () => {
      req.body = { email: "test@mail.com", password: "wrongpass" };
      User.findOne.mockResolvedValue({ password: "hashedPassword" });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("→ success", async () => {
      req.body = { email: "test@mail.com", password: "password123" };
      User.findOne.mockResolvedValue({ _id: "123", password: "hashedPassword" });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      await login(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: "123" },
        expect.any(String),
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: "fake-jwt-token",
        })
      );
    });

    it("→ should handle server error", async () => {
      req.body = { email: "test@mail.com", password: "password123" };
      User.findOne.mockRejectedValue(new Error("DB Error"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });
});
