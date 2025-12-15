const { registerStore } = require("../controllers/authController");
const Register = require("../models/Coustomer");

// Mock the Register model
jest.mock("../models/Register");

describe("registerStore Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                fullName: {
                    firstName: "John",
                    middleName: "Doe",
                    lastName: "Smith"
                },
                storeName: "Test Store",
                location: "Mumbai, Maharashtra",
                contactNo: "9876543210",
                email: "test@gmail.com",
                gstNo: "27ABCDE1234F1Z5",
                storeLicNo: "STORE123",
                clinixPayLicKey: "123456789012"
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("Successful Registration", () => {
        it("should register a new store successfully", async () => {
            const mockCreatedData = {
                _id: "507f1f77bcf86cd799439011",
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            Register.findOne.mockResolvedValue(null);
            Register.create.mockResolvedValue(mockCreatedData);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "test@gmail.com" });
            expect(Register.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Registration successful",
                data: mockCreatedData
            });
        });

        it("should handle registration without middleName", async () => {
            req.body.fullName.middleName = undefined;
            const mockCreatedData = {
                _id: "507f1f77bcf86cd799439011",
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            Register.findOne.mockResolvedValue(null);
            Register.create.mockResolvedValue(mockCreatedData);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "test@gmail.com" });
            expect(Register.create).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Registration successful",
                data: mockCreatedData
            });
        });
    });

    describe("Email Already Exists", () => {
        it("should return 400 error when email is already registered", async () => {
            const existingUser = {
                _id: "507f1f77bcf86cd799439011",
                email: "test@gmail.com"
            };

            Register.findOne.mockResolvedValue(existingUser);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "test@gmail.com" });
            expect(Register.create).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email already registered"
            });
        });
    });

    describe("Database Errors", () => {
        it("should handle database errors when finding existing email", async () => {
            const dbError = new Error("Database connection error");
            Register.findOne.mockRejectedValue(dbError);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "test@gmail.com" });
            expect(Register.create).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(dbError);
        });

        it("should handle database errors when creating new registration", async () => {
            const dbError = new Error("Database connection error");
            Register.findOne.mockResolvedValue(null);
            Register.create.mockRejectedValue(dbError);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "test@gmail.com" });
            expect(Register.create).toHaveBeenCalledWith(req.body);
            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe("Edge Cases", () => {
        it("should handle lowercase email correctly", async () => {
            req.body.email = "TEST@GMAIL.COM";
            const mockCreatedData = {
                _id: "507f1f77bcf86cd799439011",
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            Register.findOne.mockResolvedValue(null);
            Register.create.mockResolvedValue(mockCreatedData);

            await registerStore(req, res, next);

            expect(Register.findOne).toHaveBeenCalledWith({ email: "TEST@GMAIL.COM" });
        });

        it("should handle all required fields correctly", async () => {
            const mockCreatedData = {
                _id: "507f1f77bcf86cd799439011",
                ...req.body,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            Register.findOne.mockResolvedValue(null);
            Register.create.mockResolvedValue(mockCreatedData);

            await registerStore(req, res, next);

            expect(Register.create).toHaveBeenCalledWith({
                fullName: req.body.fullName,
                storeName: req.body.storeName,
                location: req.body.location,
                contactNo: req.body.contactNo,
                email: req.body.email,
                gstNo: req.body.gstNo,
                storeLicNo: req.body.storeLicNo,
                clinixPayLicKey: req.body.clinixPayLicKey
            });
        });
    });
});

