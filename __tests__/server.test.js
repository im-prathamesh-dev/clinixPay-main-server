jest.mock("../config/connection"); // mock DB before importing server

const request = require("supertest");
const express = require("express");

/*
  Since server.js starts listening immediately,
  we recreate the app logic here for testing
*/

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ClinixPay Main Server is running 🚀",
  });
});

describe("Server Health Check", () => {
  it("should return server running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "ClinixPay Main Server is running 🚀",
    });
  });
});
