import crypto from "crypto";

export const OTP_EXPIRY_MS = 5 * 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_TYPES = ["registration", "forgot-password"];

export const generateRandomToken = () => crypto.randomBytes(32).toString("hex");

// Alphabet excludes confusing characters (0/O, 1/I/l). 32 chars -> 32^6 combos.
const OTP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// 6-character alphanumeric OTP (letters + digits, uppercase only).
export const generateOtp = () =>
  Array.from(crypto.randomBytes(6))
    .map((byte) => OTP_ALPHABET[byte % OTP_ALPHABET.length])
    .join("");

// OTPs are stored hashed (never in plaintext).
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
