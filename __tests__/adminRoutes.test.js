const request = require("supertest");
const express = require("express");
const adminRoutes = require("../routes/adminRoutes");
const adminController = require("../controllers/Admin/adminAuthController");
const adminAuth = require("../middlewares/adminAuth");

jest.mock("../controllers/Admin/adminAuthController", () => ({
  loginAdmin: jest.fn((req, res) => res.json({ message: "mock login success" }))
}));

jest.mock("../middlewares/adminAuth", () =>
  jest.fn((req, res, next) => {
    req.admin = { adminId: "123", role: "admin" };
    next();
  })
);

const app = express();
app.use(express.json());
app.use("/admin", adminRoutes);

describe("Admin Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /admin/login calls loginAdmin", async () => {
    const res = await request(app)
      .post("/admin/login")
      .send({ email: "admin@test.com", password: "password123" });

    expect(adminController.loginAdmin).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "mock login success" });
  });

  it("GET /admin/dashboard calls adminAuth and returns dashboard", async () => {
    const res = await request(app).get("/admin/dashboard");

    expect(adminAuth).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: "Welcome to admin dashboard",
      admin: { adminId: "123", role: "admin" }
    });
  });
});
