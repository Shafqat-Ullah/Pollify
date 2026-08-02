import "dotenv/config";
import { sendForgotPasswordOtp } from "./services/email.service.js";

process.env.NODE_ENV = "production";
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";
const res = await sendForgotPasswordOtp("someone@example.com", "123456", "Test");
console.log("Prod-without-SMTP result:", JSON.stringify(res));
process.exit(res.ok === false ? 0 : 1);
