const Inventory = require("../models/Inventory");
const {
  getInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

jest.mock("../models/Inventory");

describe("Inventory Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { customerId: "cust123" },
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ================= GET INVENTORY =================
  describe("getInventory", () => {
    it("should return inventory list", async () => {
      const mockInventory = [{ productName: "Paracetamol" }];

      Inventory.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockInventory),
      });

      await getInventory(req, res);

      expect(Inventory.find).toHaveBeenCalledWith({
        customerId: "cust123",
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        inventory: mockInventory,
      });
    });

    it("should handle error", async () => {
      Inventory.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await getInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch inventory",
      });
    });
  });

  // ================= UPDATE INVENTORY =================
  describe("updateInventory", () => {
    it("should update inventory item", async () => {
      req.params.id = "inv123";
      req.body = { qty: 10, mrp: 50 };

      Inventory.findOneAndUpdate.mockResolvedValue({
        _id: "inv123",
        qty: 10,
      });

      await updateInventory(req, res);

      expect(Inventory.findOneAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Inventory updated successfully",
        })
      );
    });

    it("should return 404 if item not found", async () => {
      req.params.id = "inv123";

      Inventory.findOneAndUpdate.mockResolvedValue(null);

      await updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Inventory item not found",
      });
    });

    it("should handle error", async () => {
      Inventory.findOneAndUpdate.mockRejectedValue(new Error("DB error"));

      await updateInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to update inventory",
      });
    });
  });

  // ================= DELETE INVENTORY =================
  describe("deleteInventory", () => {
    it("should delete inventory item", async () => {
      req.params.id = "inv123";

      Inventory.findOneAndDelete.mockResolvedValue({ _id: "inv123" });

      await deleteInventory(req, res);

      expect(Inventory.findOneAndDelete).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inventory item deleted",
      });
    });

    it("should return 404 if item not found", async () => {
      Inventory.findOneAndDelete.mockResolvedValue(null);

      await deleteInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Item not found",
      });
    });

    it("should handle error", async () => {
      Inventory.findOneAndDelete.mockRejectedValue(new Error("DB error"));

      await deleteInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete inventory item",
      });
    });
  });
});
