const express = require("express");
const router = express.Router();

const { registerStore } = require("../controllers/authController");
const { registerValidation } = require("../middlewares/registerValidation");
const validate = require("../middlewares/validationResultHandler");

router.post(
    "/register",
    registerValidation,
    validate,
    registerStore
);

module.exports = router;
