const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware"); // adjust path

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() and set req.user if token is valid", () => {
    req.headers.authorization = "Bearer validToken";
    const decodedToken = { userId: "123" };
    jwt.verify.mockReturnValue(decodedToken);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("validToken", process.env.JWT_SECRET);
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if authorization header is missing", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authorization token missing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token does not start with 'Bearer '", () => {
    req.headers.authorization = "Token invalidToken";

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authorization token missing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    req.headers.authorization = "Bearer invalidToken";
    jwt.verify.mockImplementation(() => { throw new Error("Invalid token"); });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
