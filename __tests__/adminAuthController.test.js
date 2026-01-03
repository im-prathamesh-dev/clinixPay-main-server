// Import the controller correctly
const adminController = require("../controllers/Admin/adminAuthController");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the dependencies
jest.mock("../models/Admin");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Admin Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "admin@test.com",
        password: "password123"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  it("should login admin successfully and return token", async () => {
    // Mock Admin.findOne
    Admin.findOne.mockResolvedValueOnce({
      _id: "adminId123",
      email: "admin@test.com",
      password: "hashedPassword"
    });

    // Mock bcrypt.compare
    bcrypt.compare.mockResolvedValueOnce(true);

    // Mock jwt.sign
    jwt.sign.mockReturnValueOnce("mockToken");

    await adminController.loginAdmin(req, res);

    expect(Admin.findOne).toHaveBeenCalledWith({ email: "admin@test.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(jwt.sign).toHaveBeenCalledWith(
      { adminId: "adminId123", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: "mockToken"
    });
  });

  it("should return 401 if admin not found", async () => {
    Admin.findOne.mockResolvedValueOnce(null);

    await adminController.loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  it("should return 401 if password does not match", async () => {
    Admin.findOne.mockResolvedValueOnce({
      _id: "adminId123",
      email: "admin@test.com",
      password: "hashedPassword"
    });

    bcrypt.compare.mockResolvedValueOnce(false);

    await adminController.loginAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });
});
