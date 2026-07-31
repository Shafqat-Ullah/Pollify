import express from "express";
import {
  register,
  verifyOtp,
  resendOtp,
  sendOtp,
  login,
  logout,
  refresh,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";
import {
  validate,
  registerRules,
  loginRules,
  sendOtpRules,
  verifyOtpRules,
  verifyResetOtpRules,
  resendOtpRules,
  forgotPasswordRules,
  resetPasswordRules,
} from "../validators/auth.validator.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/send-otp", otpLimiter, sendOtpRules, validate, sendOtp);
router.post("/verify-otp", otpLimiter, verifyOtpRules, validate, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtpRules, validate, resendOtp);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/forgot-password", otpLimiter, forgotPasswordRules, validate, forgotPassword);
router.post("/verify-reset-otp", otpLimiter, verifyResetOtpRules, validate, verifyResetOtp);
router.post("/reset-password", otpLimiter, resetPasswordRules, validate, resetPassword);
router.get("/me", protect, getMe);

// Backward-compatible aliases
router.post("/verify-email", otpLimiter, verifyOtpRules, validate, verifyOtp);
router.post("/verify-forgot-otp", otpLimiter, verifyResetOtpRules, validate, verifyResetOtp);

export default router;
