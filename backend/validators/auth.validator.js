import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        errors.array().map((e) => ({ field: e.path, message: e.msg }))
      )
    );
  }
  next();
};

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 60 }).withMessage("Name must be 60 characters or less"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// send-otp accepts registration data only when creating a new account; the
// controller enforces that. All fields are validated if/when present.
export const sendOtpRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("type")
    .optional()
    .isIn(["registration", "forgot-password"])
    .withMessage("Invalid OTP type"),
  body("name").optional().trim().isLength({ max: 60 }).withMessage("Name must be 60 characters or less"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

export const verifyOtpRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("otp").matches(/^\d{6}$/).withMessage("OTP must be a 6-digit code"),
];

export const verifyResetOtpRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("otp").matches(/^\d{6}$/).withMessage("OTP must be a 6-digit code"),
];

export const resendOtpRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("type")
    .optional()
    .isIn(["registration", "forgot-password"])
    .withMessage("Invalid OTP type"),
];

export const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
];

export const resetPasswordRules = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];
