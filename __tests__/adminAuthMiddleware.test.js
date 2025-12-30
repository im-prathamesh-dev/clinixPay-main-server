const adminAuth = require("../middlewares/adminAuth");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");

describe("Admin Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: "Bearer validToken"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() if token is valid and role is admin", () => {
    jwt.verify.mockReturnValueOnce({ adminId: "123", role: "admin" });

    adminAuth(req, res, next);

    expect(req.admin).toEqual({ adminId: "123", role: "admin" });
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token is missing", () => {
    req.headers.authorization = "";

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin token missing" });
  });

  it("should return 403 if role is not admin", () => {
    jwt.verify.mockReturnValueOnce({ adminId: "123", role: "customer" });

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
  });

  it("should return 401 if token is invalid", () => {
    jwt.verify.mockImplementationOnce(() => { throw new Error("Invalid"); });

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid admin token" });
  });
});
