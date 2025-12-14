const request = require("supertest");
const express = require("express");
const registerRoutes = require("../routes/registerRoutes");
const Register = require("../models/Register");

// Mock the Register model
jest.mock("../models/Register");

const app = express();
app.use(express.json());
app.use("/api/v1", registerRoutes);

// Error handler middleware for testing (must be after routes)
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

describe("Register Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/v1/register", () => {
        const validRequestBody = {
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
        };

        describe("Successful Registration", () => {
            it("should register a new store with valid data", async () => {
                const mockCreatedData = {
                    _id: "507f1f77bcf86cd799439011",
                    ...validRequestBody,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                Register.findOne.mockResolvedValue(null);
                Register.create.mockResolvedValue(mockCreatedData);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validRequestBody)
                    .expect(201);

                expect(res.body).toEqual({
                    success: true,
                    message: "Registration successful",
                    data: expect.objectContaining({
                        fullName: validRequestBody.fullName,
                        storeName: validRequestBody.storeName,
                        email: validRequestBody.email
                    })
                });
            });

            it("should register without middleName", async () => {
                const requestBodyWithoutMiddleName = {
                    ...validRequestBody,
                    fullName: {
                        firstName: "John",
                        lastName: "Smith"
                    }
                };

                const mockCreatedData = {
                    _id: "507f1f77bcf86cd799439011",
                    ...requestBodyWithoutMiddleName,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                Register.findOne.mockResolvedValue(null);
                Register.create.mockResolvedValue(mockCreatedData);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(requestBodyWithoutMiddleName)
                    .expect(201);

                expect(res.body.success).toBe(true);
            });
        });

        describe("Validation Errors", () => {
            it("should return 422 when firstName is missing", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    fullName: {
                        lastName: "Smith"
                    }
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors.some(err => 
                    err.path === "fullName.firstName" || 
                    err.msg === "First name is required"
                )).toBe(true);
            });

            it("should return 422 when lastName is missing", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    fullName: {
                        firstName: "John"
                    }
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when storeName is missing", async () => {
                const invalidBody = { ...validRequestBody };
                delete invalidBody.storeName;

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when email is not Gmail", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    email: "test@yahoo.com"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors.some(err => 
                    err.msg === "Only Gmail allowed"
                )).toBe(true);
            });

            it("should return 422 when email format is invalid", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    email: "invalid-email"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when contactNo is invalid (not 10 digits starting with 6-9)", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    contactNo: "1234567890"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when contactNo has less than 10 digits", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    contactNo: "987654321"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when GST number is invalid", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    gstNo: "INVALID123"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when storeLicNo is too short", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    storeLicNo: "ABC12"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when clinixPayLicKey is not exactly 12 digits", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    clinixPayLicKey: "12345678901"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when clinixPayLicKey contains non-digits", async () => {
                const invalidBody = {
                    ...validRequestBody,
                    clinixPayLicKey: "12345678901A"
                };

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });

            it("should return 422 when location is missing", async () => {
                const invalidBody = { ...validRequestBody };
                delete invalidBody.location;

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(invalidBody)
                    .expect(422);

                expect(res.body.success).toBe(false);
                expect(res.body.errors).toBeDefined();
            });
        });

        describe("Business Logic Errors", () => {
            it("should return 400 when email already exists", async () => {
                const existingUser = {
                    _id: "507f1f77bcf86cd799439011",
                    email: "test@gmail.com"
                };

                Register.findOne.mockResolvedValue(existingUser);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validRequestBody)
                    .expect(400);

                expect(res.body).toEqual({
                    success: false,
                    message: "Email already registered"
                });
                expect(Register.create).not.toHaveBeenCalled();
            });
        });

        describe("Database Errors", () => {
            it("should handle database errors gracefully", async () => {
                const dbError = new Error("Database connection error");
                Register.findOne.mockRejectedValue(dbError);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validRequestBody)
                    .expect(500);

                expect(res.body.success).toBe(false);
            });
        });

        describe("Valid Input Formats", () => {
            it("should accept valid Indian mobile number starting with 6", async () => {
                const validBody = {
                    ...validRequestBody,
                    contactNo: "6123456789"
                };

                const mockCreatedData = {
                    _id: "507f1f77bcf86cd799439011",
                    ...validBody,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                Register.findOne.mockResolvedValue(null);
                Register.create.mockResolvedValue(mockCreatedData);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validBody)
                    .expect(201);

                expect(res.body.success).toBe(true);
            });

            it("should accept valid Indian mobile number starting with 9", async () => {
                const validBody = {
                    ...validRequestBody,
                    contactNo: "9876543210"
                };

                const mockCreatedData = {
                    _id: "507f1f77bcf86cd799439011",
                    ...validBody,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                Register.findOne.mockResolvedValue(null);
                Register.create.mockResolvedValue(mockCreatedData);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validBody)
                    .expect(201);

                expect(res.body.success).toBe(true);
            });

            it("should accept valid GST number format", async () => {
                const validBody = {
                    ...validRequestBody,
                    gstNo: "27ABCDE1234F1Z5"
                };

                const mockCreatedData = {
                    _id: "507f1f77bcf86cd799439011",
                    ...validBody,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                Register.findOne.mockResolvedValue(null);
                Register.create.mockResolvedValue(mockCreatedData);

                const res = await request(app)
                    .post("/api/v1/register")
                    .send(validBody)
                    .expect(201);

                expect(res.body.success).toBe(true);
            });
        });
    });
});

