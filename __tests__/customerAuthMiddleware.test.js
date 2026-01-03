const jwt = require("jsonwebtoken");
const customerAuth = require("../middlewares/customerAuth");

jest.mock("jsonwebtoken");

describe("Customer Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 if token is missing", () => {
    customerAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No token provided",
    });
  });

  it("should return 401 if token is invalid", () => {
    req.headers.authorization = "Bearer invalidtoken";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    customerAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });

  it("should attach user and call next if token is valid", () => {
    req.headers.authorization = "Bearer validtoken";

    jwt.verify.mockReturnValue({
      customerId: "cust123",
    });

    customerAuth(req, res, next);

    expect(req.user).toEqual({ customerId: "cust123" });
    expect(next).toHaveBeenCalled();
  });
});
