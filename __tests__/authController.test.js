const { register, login } = require("../controllers/authController");
const Customer = require("../models/Customer");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// ================= MOCKS =================
jest.mock("../models/Customer");
jest.mock("axios");
jest.mock("jsonwebtoken");

// ================= MOCK RESPONSE =================
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ================= REGISTER TESTS =================

test("REGISTER → success", async () => {
  const req = {
    body: {
      fullName: { firstName: "Rahul", lastName: "Patil" },
      storeName: "ABC Medical",
      location: "Pune",
      contactNo: "9876543210",
      email: "test@mail.com",
      gstNo: "27ABCDE1234F1Z5",
      storeLicNo: "LIC123",
      clinixPayLicKey: "ABCDEFGHIJKL",
      password: "password123"
    }
  };

  const res = mockResponse();

  Customer.findOne.mockResolvedValue(null);

  axios.post.mockResolvedValue({
    data: { valid: true }
  });

  Customer.create.mockResolvedValue({
    _id: "user123",
    fullName: req.body.fullName,
    email: req.body.email,
    storeName: req.body.storeName
  });

  await register(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      message: "Registration successful. Please login."
    })
  );
});

test("REGISTER → email already exists", async () => {
  const req = { body: { email: "test@mail.com" } };
  const res = mockResponse();

  Customer.findOne.mockResolvedValue({ email: "test@mail.com" });

  await register(req, res);

  expect(res.status).toHaveBeenCalledWith(409);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Email already registered"
  });
});

test("REGISTER → invalid license key", async () => {
  const req = {
    body: {
      email: "test@mail.com",
      clinixPayLicKey: "INVALIDKEY"
    }
  };
  const res = mockResponse();

  Customer.findOne.mockResolvedValue(null);

  axios.post.mockResolvedValue({
    data: { valid: false }
  });

  await register(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({
    message: "Invalid or expired license key"
  });
});

// ================= LOGIN TESTS =================

test("LOGIN → user not found", async () => {
  const req = {
    body: { email: "notfound@mail.com", password: "123" }
  };
  const res = mockResponse();

  Customer.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(null)
  });

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "User not found"
  });
});

test("LOGIN → invalid password", async () => {
  const req = {
    body: { email: "test@mail.com", password: "wrongpass" }
  };
  const res = mockResponse();

  Customer.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue({
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(false)
    })
  });

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: "Invalid credentials"
  });
});

test("LOGIN → success", async () => {
  const req = {
    body: { email: "test@mail.com", password: "password123" }
  };
  const res = mockResponse();

  const mockUser = {
    _id: "user123",
    email: "test@mail.com",
    isActive: true,
    fullName: { firstName: "Rahul" },
    storeName: "ABC Medical",
    comparePassword: jest.fn().mockResolvedValue(true)
  };

  Customer.findOne.mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser)
  });

  jwt.sign.mockReturnValue("mock-jwt-token");

  await login(req, res);

  expect(jwt.sign).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      token: "mock-jwt-token"
    })
  );
});
