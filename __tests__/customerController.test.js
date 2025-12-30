const customerController = require("../controllers//customerController");
const Customer = require("../models/Customer");

jest.mock("../models/Customer");

describe("Customer Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { customerId: "testUser" }, // ✅ corrected from id -> customerId
      body: {
        name: "Rahul",
        email: "rahul@test.com"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  /**
   * getCustomerDetails
   */
  it("should return customer details", async () => {
    Customer.findById.mockResolvedValueOnce({
      _id: "testUser",
      name: "Rahul"
    });

    await customerController.getCustomerDetails(req, res);

    expect(Customer.findById).toHaveBeenCalledWith("testUser");
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        customer: expect.objectContaining({
          name: "Rahul"
        })
      })
    );
  });

  it("should return error response if customer not found", async () => {
    Customer.findById.mockResolvedValueOnce(null);

    await customerController.getCustomerDetails(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String)
      })
    );
  });

  /**
   * updateCustomer
   */
  it("should update customer details", async () => {
    Customer.findByIdAndUpdate.mockResolvedValueOnce({
      name: "Rahul Updated"
    });

    await customerController.updateCustomer(req, res);

    expect(Customer.findByIdAndUpdate).toHaveBeenCalledWith(
      "testUser",
      req.body,
      expect.any(Object)
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        customer: expect.objectContaining({
          name: "Rahul Updated"
        })
      })
    );
  });

  it("should handle update error", async () => {
    Customer.findByIdAndUpdate.mockRejectedValueOnce(
      new Error("Update failed")
    );

    await customerController.updateCustomer(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Update failed"
      })
    );
  });
});
