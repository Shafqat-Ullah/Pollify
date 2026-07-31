import crypto from "crypto";

export const OTP_EXPIRY_MS = 5 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_TYPES = ["registration", "forgot-password"];

export const generateRandomToken = () => crypto.randomBytes(32).toString("hex");

// 6-digit numeric OTP, 000000-999999 (zero-padded).
export const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

// OTPs are stored hashed (never in plaintext).
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
