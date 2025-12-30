process.env.NODE_ENV = "test";

const request = require("supertest");
const express = require("express");
const authRoutes = require("../routes/authRoutes");

// mock controller
jest.mock("../controllers/authController", () => ({
  register: jest.fn((req, res) =>
    res.status(201).json({ success: true, message: "Mock Register" })
  ),
  login: jest.fn((req, res) =>
    res.status(200).json({ success: true, message: "Mock Login" })
  ),
}));

const app = express();
app.use(express.json());
app.use(authRoutes);

describe("AUTH ROUTES", () => {
  test("POST /auth/register", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@mail.com" });

    expect(res.status).toBe(201);
  });

  test("POST /auth/login", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@mail.com", password: "123" });

    expect(res.status).toBe(200);
  });
});
