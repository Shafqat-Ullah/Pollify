import User from "../models/User.js";
import Verification from "../models/Verification.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
} from "../utils/generateTokens.js";
import {
  generateOtp,
  generateRandomToken,
  hashToken,
  OTP_EXPIRY_MS,
  MAX_OTP_ATTEMPTS,
  OTP_TYPES,
} from "../services/auth.service.js";
import { sendRegistrationOtp, sendForgotPasswordOtp } from "../services/email.service.js";

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const findValidOtp = (email, type) =>
  Verification.findOne({ email, type, expiresAt: { $gt: Date.now() } });

// Increments the attempt counter and enforces the per-OTP attempt limit.
// Exceeding the limit invalidates the code immediately.
const consumeAttempt = async (record) => {
  record.attempts += 1;
  if (record.attempts > MAX_OTP_ATTEMPTS) {
    await record.deleteOne();
    throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
  }
  await record.save();
};

// Creates a hashed OTP record and sends the email. The record is removed if
// email delivery fails so no unusable code is left behind.
const issueOtp = async ({ email, type, name = "" }) => {
  await Verification.deleteMany({ email, type });

  const otp = generateOtp();
  const record = await Verification.create({
    email,
    otp: hashToken(otp),
    type,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  const sent =
    type === "registration"
      ? await sendRegistrationOtp(email, otp, name)
      : await sendForgotPasswordOtp(email, otp, name);

  if (!sent) {
    await record.deleteOne();
    throw new ApiError(502, "We couldn't send the verification email. Please try again.");
  }

  return record;
};

// ---------------------------------------------------------------------------
// Shared OTP sending logic
// ---------------------------------------------------------------------------

const sendRegistrationOtpCore = async (req, res) => {
  const { name, username, password } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!email) throw new ApiError(400, "Email is required.");

  const existing = await User.findOne({ email });

  if (existing && existing.isVerified) {
    throw new ApiError(409, "This email is already registered.");
  }

  if (existing) {
    // Unverified account: update only the fields that were provided.
    if (name) existing.name = name;
    if (username) {
      const cleanUsername = username.toLowerCase();
      const taken = await User.findOne({ username: cleanUsername, email: { $ne: email } });
      if (taken) throw new ApiError(409, "This username is already taken.");
      existing.username = cleanUsername;
    }
    if (password) existing.password = password;
    await existing.save({ validateBeforeSave: false });
  } else {
    if (!name || !username || !password) {
      throw new ApiError(400, "Name, username and password are required to register.");
    }
    const cleanUsername = username.toLowerCase();
    const taken = await User.findOne({ username: cleanUsername });
    if (taken) throw new ApiError(409, "This username is already taken.");
    await User.create({ name, username: cleanUsername, email, password });
  }

  await issueOtp({ email, type: "registration", name: existing ? existing.name : name });

  res.status(200).json({
    success: true,
    message: "A verification code has been sent to your email.",
  });
};

const sendResetOtpCore = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) throw new ApiError(400, "Email is required.");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email.");

  await issueOtp({ email, type: "forgot-password", name: user.name });

  res.status(200).json({
    success: true,
    message: "A password reset code has been sent to your email.",
  });
};

// ---------------------------------------------------------------------------
// POST /api/auth/send-otp
// ---------------------------------------------------------------------------
export const sendOtp = asyncHandler(async (req, res) => {
  const type = req.body.type || "registration";
  if (!OTP_TYPES.includes(type)) throw new ApiError(400, "Invalid OTP type.");
  if (type === "registration") return sendRegistrationOtpCore(req, res);
  return sendResetOtpCore(req, res);
});

// POST /api/auth/register (legacy alias of send-otp registration)
export const register = asyncHandler(async (req, res) => sendRegistrationOtpCore(req, res));

// POST /api/auth/resend-otp
export const resendOtp = asyncHandler(async (req, res) => {
  const type = req.body.type || "registration";
  if (!OTP_TYPES.includes(type)) throw new ApiError(400, "Invalid OTP type.");
  if (type === "registration") return sendRegistrationOtpCore(req, res);
  return sendResetOtpCore(req, res);
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// ---------------------------------------------------------------------------
export const verifyOtp = asyncHandler(async (req, res) => {
  const { otp, name, username, password } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required.");

  const record = await findValidOtp(email, "registration");
  if (!record) {
    throw new ApiError(400, "Your verification code has expired. Please request a new one.");
  }

  await consumeAttempt(record);

  if (hashToken(otp) !== record.otp) {
    throw new ApiError(400, "Incorrect verification code.");
  }

  let user = await User.findOne({ email });
  if (!user) {
    // Legacy flow: some accounts were only created at verification time.
    if (!name || !username || !password) {
      throw new ApiError(400, "Account details are required to complete registration.");
    }
    user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password,
      isVerified: true,
    });
  } else {
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  // Never store the OTP after a successful verification.
  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now log in.",
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !user.password || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (user.isBanned) throw new ApiError(403, "This account has been banned.");

  if (!user.isVerified) {
    let sent = false;
    try {
      await issueOtp({ email: user.email, type: "registration", name: user.name });
      sent = true;
    } catch (err) {
      console.error("[AUTH] Failed to send verification OTP on login:", err.message);
    }
    throw new ApiError(
      403,
      sent
        ? "Please verify your email first. A new verification code has been sent to your email."
        : "Please verify your email first. Request a new verification code."
    );
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    data: { user: user.toSafeObject(), accessToken },
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await User.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError(401, "No refresh token provided.");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new ApiError(401, "Refresh token not recognized.");
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshTokens = user.refreshTokens
    .filter((t) => t !== refreshToken)
    .concat(newRefreshToken)
    .slice(-5);
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, newRefreshToken);

  res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
export const forgotPassword = asyncHandler(async (req, res) => sendResetOtpCore(req, res));

// ---------------------------------------------------------------------------
// POST /api/auth/verify-reset-otp
// ---------------------------------------------------------------------------
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required.");

  const record = await findValidOtp(email, "forgot-password");
  if (!record) {
    throw new ApiError(400, "Your code has expired. Please request a new one.");
  }

  await consumeAttempt(record);

  if (hashToken(otp) !== record.otp) {
    throw new ApiError(400, "Incorrect verification code.");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email.");

  const resetToken = generateRandomToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = Date.now() + OTP_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  await record.deleteOne();

  res.status(200).json({
    success: true,
    message: "Code verified. You can now reset your password.",
    data: { resetToken },
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) throw new ApiError(400, "Reset token is invalid or has expired.");

  // password is hashed by the User schema pre-save hook (bcrypt).
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successfully." });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
});
