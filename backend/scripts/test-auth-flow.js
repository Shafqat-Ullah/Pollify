// End-to-end test for the full auth flow:
// Register (send-otp) -> verify-otp (wrong attempts, resend, success) -> login ->
// me -> refresh -> logout -> unverified-login OTP -> forgot-password ->
// verify-reset-otp -> reset-password.
//
// Run: node scripts/test-auth-flow.js   (uses an in-memory MongoDB; emails are simulated)

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.EMAIL_DISABLE = "true";
process.env.JWT_ACCESS_SECRET = "test_access_secret_1234567890abcdef";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_1234567890abcdef";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.MONGO_URI = "";

const origLog = console.log;
let consoleOutput = [];
console.log = (...args) => {
  consoleOutput.push(args.join(" "));
};

let passed = 0;
let failed = 0;
const check = (name, cond, extra = "") => {
  if (cond) {
    passed += 1;
    origLog(`  PASS  ${name}`);
  } else {
    failed += 1;
    origLog(`  FAIL  ${name}  ${extra}`);
  }
};

const otpFor = (email) => {
  for (let i = consoleOutput.length - 1; i >= 0; i -= 1) {
    const m = consoleOutput[i].match(new RegExp(`OTP for ${email.replace(/[.]/g, "\\.")}: (\\d{6})`));
    if (m) return m[1];
  }
  return null;
};

let baseUrl;

const post = async (path, body, extraHeaders = {}) => {
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json, headers: res.headers };
};

const get = async (path, extraHeaders = {}) => {
  const res = await fetch(baseUrl + path, { headers: extraHeaders });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json, headers: res.headers };
};

const cookieFrom = (headers) => {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  return setCookie.split(";")[0];
};

const user1 = { email: "test1@example.com", username: "testuser1", name: "Test User One", password: "Password123" };
const user2 = { email: "test2@example.com", username: "testuser2", name: "Test User Two", password: "Password123" };

const run = async () => {
  origLog("Starting auth flow test...");

  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri("pollify_test");

  const { default: connectDB } = await import("../config/db.js");
  await connectDB();

  const { default: app } = await import("../app.js");
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  origLog(`Test server up: ${baseUrl}`);

  const Verification = mongoose.model("Verification");

  // ---- 1. Validation guards -------------------------------------------------
  origLog("\n[1] Validation");
  let r = await post("/api/auth/send-otp", { email: "not-an-email", type: "registration" });
  check("send-otp rejects invalid email (400)", r.status === 400, r.status);
  r = await post("/api/auth/verify-otp", { email: user1.email, otp: "12" });
  check("verify-otp rejects malformed OTP (400)", r.status === 400, r.status);
  r = await post("/api/auth/send-otp", { email: user1.email, type: "nonsense" });
  check("send-otp rejects invalid type (400)", r.status === 400, r.status);

  // ---- 2. Register (send-otp) ----------------------------------------------
  origLog("\n[2] Registration");
  consoleOutput = [];
  r = await post("/api/auth/send-otp", { ...user1, type: "registration" });
  check("register returns 200", r.status === 200, `${r.status} ${r.json?.message}`);
  check("register does NOT return a token", !r.json?.data?.accessToken);

  const otp1 = otpFor(user1.email);
  check("registration OTP is issued (captured from log)", Boolean(otp1), otp1);

  const userDoc1 = await mongoose.model("User").findOne({ email: user1.email });
  check("pending user is created at signup", Boolean(userDoc1));
  check("pending user starts unverified", userDoc1 && userDoc1.isVerified === false);

  r = await post("/api/auth/send-otp", { ...user1, type: "registration" });
  check("re-register same email returns 200 (refreshes OTP)", r.status === 200, r.status);
  const otp1b = otpFor(user1.email);
  check("a fresh OTP is issued on re-register", otp1b && otp1b !== otp1, otp1b);

  // ---- 3. Verify with wrong attempts (5 max) --------------------------------
  origLog("\n[3] OTP verification + attempt limit");
  let lastStatus = 0;
  for (let i = 1; i <= 5; i += 1) {
    r = await post("/api/auth/verify-otp", { email: user1.email, otp: "000000" });
    lastStatus = r.status;
  }
  check("5 wrong attempts -> 400 each", lastStatus === 400, lastStatus);
  r = await post("/api/auth/verify-otp", { email: user1.email, otp: "000000" });
  check("6th wrong attempt -> 429 (limit enforced)", r.status === 429, r.status);

  r = await post("/api/auth/verify-otp", { email: user1.email, otp: otp1b });
  check("exhausted OTP cannot be used anymore (400)", r.status === 400, r.status);

  // ---- 4. Resend + successful verification ---------------------------------
  origLog("\n[4] Resend + verify");
  r = await post("/api/auth/resend-otp", { email: user1.email, type: "registration" });
  check("resend-otp returns 200", r.status === 200, r.status);
  const otp1c = otpFor(user1.email);
  check("resend issues a new OTP", Boolean(otp1c), otp1c);

  r = await post("/api/auth/verify-otp", { ...user1, otp: otp1c });
  check("verify-otp with correct OTP -> 200", r.status === 200, `${r.status} ${r.json?.message}`);
  check("verify-otp does NOT log the user in", !r.json?.data?.accessToken);

  const verifiedUser = await mongoose.model("User").findOne({ email: user1.email }).select("+password");
  check("user is now verified", verifiedUser && verifiedUser.isVerified === true);
  check("password is stored hashed (bcrypt)", verifiedUser && verifiedUser.password.startsWith("$2"));
  const vCount = await Verification.countDocuments({ email: user1.email });
  check("OTP record deleted after successful verification", vCount === 0, vCount);

  // ---- 5. Login -> me -> refresh -> logout ---------------------------------
  origLog("\n[5] Login / session");
  r = await post("/api/auth/login", { email: user1.email, password: user1.password });
  check("login succeeds with correct credentials (200)", r.status === 200, `${r.status} ${r.json?.message}`);
  const accessToken = r.json?.data?.accessToken;
  check("login returns access token + user", Boolean(accessToken) && Boolean(r.json?.data?.user));
  const refreshCookie = cookieFrom(r.headers);
  check("login sets refresh cookie", Boolean(refreshCookie), refreshCookie);

  r = await get("/api/auth/me", { Authorization: `Bearer ${accessToken}` });
  check("GET /auth/me works with access token (200)", r.status === 200, r.status);
  check("me returns the user", r.json?.data?.user?.email === user1.email);

  r = await post("/api/auth/refresh", undefined, { Cookie: refreshCookie });
  check("refresh rotates tokens (200)", r.status === 200, r.status);
  const accessToken2 = r.json?.data?.accessToken;
  check("refresh returns a fresh access token", Boolean(accessToken2), accessToken2);

  r = await get("/api/auth/me", { Authorization: `Bearer ${accessToken2}` });
  check("new access token works (200)", r.status === 200, r.status);

  r = await post("/api/auth/login", { email: user1.email, password: "WrongPass999" });
  check("login rejects wrong password (401)", r.status === 401, r.status);

  r = await post("/api/auth/logout", undefined, { Cookie: refreshCookie });
  check("logout succeeds (200)", r.status === 200, r.status);
  r = await post("/api/auth/refresh", undefined, { Cookie: refreshCookie });
  check("refresh rejected after logout (401)", r.status === 401, r.status);

  r = await post("/api/auth/send-otp", { ...user1, type: "registration" });
  check("verified email cannot be re-registered (409)", r.status === 409, r.status);

  // ---- 6. Unverified login -> auto OTP -> verify -> login -------------------
  origLog("\n[6] Unverified user login flow");
  consoleOutput = [];
  r = await post("/api/auth/send-otp", { ...user2, type: "registration" });
  check("user2 registers (200)", r.status === 200, r.status);

  r = await post("/api/auth/login", { email: user2.email, password: user2.password });
  check("unverified login is blocked (403)", r.status === 403, r.status);
  const autoOtp = otpFor(user2.email);
  check("blocked login auto-sends a fresh OTP", Boolean(autoOtp), autoOtp);

  r = await post("/api/auth/verify-otp", { email: user2.email, otp: autoOtp });
  check("user2 verifies with auto-sent OTP (200)", r.status === 200, r.status);

  r = await post("/api/auth/login", { email: user2.email, password: user2.password });
  check("user2 can now log in (200)", r.status === 200, r.status);

  // ---- 7. Forgot password -> verify-reset-otp -> reset-password -------------
  origLog("\n[7] Password reset flow");
  consoleOutput = [];
  r = await post("/api/auth/forgot-password", { email: user1.email });
  check("forgot-password returns 200", r.status === 200, r.status);
  const resetOtp = otpFor(user1.email);
  check("reset OTP is sent", Boolean(resetOtp), resetOtp);

  for (let i = 1; i <= 5; i += 1) {
    r = await post("/api/auth/verify-reset-otp", { email: user1.email, otp: "999999" });
    lastStatus = r.status;
  }
  check("5 wrong reset OTPs -> 400 each", lastStatus === 400, lastStatus);
  r = await post("/api/auth/verify-reset-otp", { email: user1.email, otp: "999999" });
  check("6th wrong reset OTP -> 429", r.status === 429, r.status);

  r = await post("/api/auth/resend-otp", { email: user1.email, type: "forgot-password" });
  check("resend reset OTP (200)", r.status === 200, r.status);
  const resetOtp2 = otpFor(user1.email);
  r = await post("/api/auth/verify-reset-otp", { email: user1.email, otp: resetOtp2 });
  check("verify-reset-otp with correct OTP (200)", r.status === 200, `${r.status} ${r.json?.message}`);
  const resetToken = r.json?.data?.resetToken;
  check("reset token is returned", Boolean(resetToken) && resetToken.length >= 32, resetToken?.length);

  const newPassword = "NewPassword456";
  r = await post("/api/auth/reset-password", { token: resetToken, password: newPassword });
  check("reset-password succeeds (200)", r.status === 200, `${r.status} ${r.json?.message}`);

  r = await post("/api/auth/login", { email: user1.email, password: newPassword });
  check("login with NEW password succeeds (200)", r.status === 200, r.status);
  r = await post("/api/auth/login", { email: user1.email, password: user1.password });
  check("login with OLD password fails (401)", r.status === 401, r.status);

  r = await post("/api/auth/verify-reset-otp", { email: user1.email, otp: resetOtp2 });
  check("used reset OTP is gone (400)", r.status === 400, r.status);

  const totalVerifications = await Verification.countDocuments({});
  check("no OTP documents remain after all flows", totalVerifications === 0, totalVerifications);

  // ---- Summary --------------------------------------------------------------
  origLog(`\n${passed} passed, ${failed} failed`);
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((err) => {
  origLog("Test crashed:", err);
  process.exit(1);
});
