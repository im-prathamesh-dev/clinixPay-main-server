const request = require("supertest");
const express = require("express");

/**
 * STEP 1: auth middleware mock
 * original authMiddleware token check करतो
 * test मध्ये तो bypass करतो
 */
jest.mock("../middlewares/authMiddleware", () => {
  return (req, res, next) => {
    req.user = { id: "testUser" };
    next();
  };
});

/**
 * STEP 2: customer controller mock
 */
jest.mock("../controllers/Customer/customerController", () => ({
  getCustomerDetails: jest.fn((req, res) =>
    res.status(200).json({ message: "Customer details fetched" })
  ),
  updateCustomer: jest.fn((req, res) =>
    res.status(200).json({ message: "Customer updated" })
  )
}));

/**
 * STEP 3: notification controller mock
 */
jest.mock("../controllers/Customer/getNotificationController", () => ({
  getNotifications: jest.fn((req, res) =>
    res.status(200).json({ message: "Notifications fetched" })
  ),
  markRead: jest.fn((req, res) =>
    res.status(200).json({ message: "Notification marked as read" })
  )
}));

/**
 * STEP 4: route import
 */
const customerRoutes = require("../routes/Customer/customerRoutes");

/**
 * STEP 5: express app setup
 */
const app = express();
app.use(express.json());
app.use("/api/customer", customerRoutes);

/**
 * STEP 6: test cases
 */
describe("Customer Routes", () => {

  it("GET /customer-details", async () => {
    const res = await request(app).get("/api/customer/customer-details");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Customer details fetched");
  });

  it("PATCH /customer-update", async () => {
    const res = await request(app).patch("/api/customer/customer-update");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Customer updated");
  });

  it("GET /notifications", async () => {
    const res = await request(app).get("/api/customer/notifications");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Notifications fetched");
  });

  it("PATCH /notifications/mark-read/:id", async () => {
    const res = await request(app).patch(
      "/api/customer/notifications/mark-read/123"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Notification marked as read");
  });

});
