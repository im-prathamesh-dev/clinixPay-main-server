const request = require("supertest");
const express = require("express");

const inventoryRoutes = require("../routes/inventoryRoutes");
const inventoryController = require("../controllers/inventoryController");
const customerAuth = require("../middlewares/customerAuth");

jest.mock("../controllers/inventoryController");
jest.mock("../middlewares/customerAuth", () =>
  jest.fn((req, res, next) => {
    req.user = { customerId: "cust123" };
    next();
  })
);

describe("Inventory Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", inventoryRoutes);
  });

  // ================= GET =================
  it("GET /inventory should call getInventory", async () => {
    inventoryController.getInventory.mockImplementation((req, res) =>
      res.json({ success: true })
    );

    const res = await request(app).get("/inventory");

    expect(res.statusCode).toBe(200);
    expect(inventoryController.getInventory).toHaveBeenCalled();
  });

  // ================= PUT =================
  it("PUT /inventory/:id should call updateInventory", async () => {
    inventoryController.updateInventory.mockImplementation((req, res) =>
      res.json({ success: true })
    );

    const res = await request(app)
      .put("/inventory/123")
      .send({ qty: 5 });

    expect(res.statusCode).toBe(200);
    expect(inventoryController.updateInventory).toHaveBeenCalled();
  });

  // ================= DELETE =================
  it("DELETE /inventory/:id should call deleteInventory", async () => {
    inventoryController.deleteInventory.mockImplementation((req, res) =>
      res.json({ success: true })
    );

    const res = await request(app).delete("/inventory/123");

    expect(res.statusCode).toBe(200);
    expect(inventoryController.deleteInventory).toHaveBeenCalled();
  });
});
