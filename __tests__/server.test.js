process.env.NODE_ENV = "test";

// 🔕 Mock DB connection so MongoDB never runs
jest.mock("../config/connection", () => jest.fn());

const request = require("supertest");
const express = require("express");

describe("Server Health Check", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // 👇 Health route
    app.get("/", (req, res) => {
      res.status(200).json({
        status: "success",
        message: "ClinixPay Main Server is running 🚀",
      });
    });
  });

  it("should return server running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "ClinixPay Main Server is running 🚀",
    });
  });
});
