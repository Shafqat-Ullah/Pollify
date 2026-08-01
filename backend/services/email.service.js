import nodemailer from "nodemailer";
import dns from "node:dns";

// Render's network has no IPv6 route. Force IPv4-first DNS resolution so SMTP
// hosts (e.g. smtp.gmail.com) connect via their A records instead of failing
// with `connect ENETUNREACH <ipv6>:587`.
dns.setDefaultResultOrder("ipv4first");

let transporter = null;

// Set to true when SMTP is unavailable. Auth flows then fall back to printing
// the OTP in the logs so they keep working until credentials are configured.
let consoleFallbackActive = false;

const SMTP_TIMEOUTS = {
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
};

const hasSmtpConfig = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(
    user && pass && user !== "your_email@gmail.com" && pass !== "your_app_password"
  );
};

// Creates a transporter lazily and never caches a broken one. If the SMTP
// connection fails, transporter is reset to null so the next attempt retries
// instead of silently using a stale connection until the server is restarted.
const getTransporter = async () => {
  if (transporter) return transporter;

  if (hasSmtpConfig()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      family: 4,
      ...SMTP_TIMEOUTS,
    });
    try {
      await transporter.verify();
      console.log(`[EMAIL] Connected to SMTP: ${process.env.SMTP_HOST}`);
      return transporter;
    } catch (err) {
      console.error(`[EMAIL] SMTP connection failed: ${err.message}`);
      transporter = null;
      return null;
    }
  }

  if (!consoleFallbackActive) {
    console.error(
      "[EMAIL] SMTP credentials are not configured. Verification emails will NOT be sent; " +
        "OTP codes are printed in the server logs instead. Set SMTP_* env vars for real delivery."
    );
  }
  consoleFallbackActive = true;
  return null;
};

// Returns { ok, emailed }: emailed is true only when a real message left via SMTP.
// When SMTP is unavailable, ok stays true so auth flows don't break and the OTP is
// surfaced in the server logs.
const sendMail = async (to, subject, html) => {
  // Test/CI mode: skip real delivery while still logging the OTP.
  if (process.env.EMAIL_DISABLE === "true") return { ok: true, emailed: false };

  const transport = await getTransporter();
  if (!transport) {
    console.warn(`[EMAIL] No SMTP available for "${subject}" to ${to} — OTP delivered to console.`);
    return { ok: true, emailed: false };
  }
  try {
    // Gmail rejects messages whose From address doesn't match the authenticated
    // account, so always send from SMTP_USER when it's configured.
    const from = process.env.SMTP_USER
      ? `Pollify <${process.env.SMTP_USER}>`
      : process.env.EMAIL_FROM || "Pollify <no-reply@pollify.app>";
    const info = await transport.sendMail({ from, to, subject, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[EMAIL] Preview: ${previewUrl}`);
    return { ok: true, emailed: true };
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
    transporter = null;
    return { ok: false, emailed: false };
  }
};

const logOtp = (to, otp) => {
  if (process.env.NODE_ENV !== "production" || consoleFallbackActive) {
    console.log(`[EMAIL] OTP for ${to}: ${otp} (valid 5 minutes)`);
  }
};

// ---------------------------------------------------------------------------
// Responsive HTML email template
// ---------------------------------------------------------------------------

const buildOtpEmail = ({ header, greeting, body, otp, expiryMinutes, appName = "Pollify" }) => {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${header}</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; border-radius: 0 !important; }
        .content { padding: 32px 24px !important; }
        .otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
        .hero-title { font-size: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background-color:#09090b;border-radius:20px;border:1px solid #e4e4e7;box-shadow:0 12px 32px rgba(0,0,0,0.08);overflow:hidden;">
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:36px 0 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="vertical-align:middle;">
                      <img
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='64' y2='64' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23059669'/%3E%3Cstop offset='100' stop-color='%2310b981'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='16' fill='url(%23g)'/%3E%3Crect x='11' y='38' width='11' height='15' rx='3' fill='white' fill-opacity='0.6'/%3E%3Crect x='26.5' y='28' width='11' height='25' rx='3' fill='white' fill-opacity='0.85'/%3E%3Crect x='42' y='18' width='11' height='35' rx='3' fill='white'/%3E%3Ccircle cx='47.5' cy='14' r='2.5' fill='white' fill-opacity='0.9'/%3E%3C/svg%3E"
                        alt="${appName} logo"
                        width="48"
                        height="48"
                        style="display:block;width:48px;height:48px;border:0;"
                      />
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;">
                      <span style="font-size:22px;font-weight:800;color:#fafafa;letter-spacing:-0.02em;">${appName}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:20px 0 4px;">
                <span style="display:inline-block;padding:5px 14px;border-radius:999px;background-color:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);color:#34d399;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Email verification</span>
              </td>
            </tr>
            <tr>
              <td align="center" class="content" style="padding:8px 40px 0;">
                <h1 class="hero-title" style="margin:0;font-size:24px;font-weight:800;color:#fafafa;letter-spacing:-0.02em;">${header}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td align="center" class="content" style="padding:16px 40px 0;">
                <p style="margin:0;color:#a1a1aa;font-size:14px;line-height:1.7;">${greeting}</p>
                <p style="margin:12px 0 0;color:#a1a1aa;font-size:14px;line-height:1.7;">${body}</p>
              </td>
            </tr>

            <!-- OTP code -->
            <tr>
              <td align="center" style="padding:28px 40px 4px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:#18181b;border:1px solid #27272a;border-radius:16px;padding:28px 24px;">
                      <span class="otp-code" style="font-size:40px;font-weight:800;letter-spacing:8px;color:#34d399;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${otp}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Expiry -->
            <tr>
              <td align="center" style="padding:16px 40px 0;">
                <p style="margin:0;color:#71717a;font-size:13px;line-height:1.6;">
                  This code expires in <strong style="color:#d4d4d8;">${expiryMinutes} minutes</strong>. Enter it in the app to continue.
                </p>
              </td>
            </tr>

            <!-- Security warning -->
            <tr>
              <td align="center" style="padding:20px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="background-color:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:16px 20px;">
                      <p style="margin:0;color:#fbbf24;font-size:12px;line-height:1.6;">
                        <strong>Security notice:</strong> Never share this code with anyone. ${appName} will never ask you for your password or this code over email, phone, or chat.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:24px 40px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-top:1px solid #27272a;padding-top:20px;">
                      <p style="margin:0;color:#52525b;font-size:12px;line-height:1.7;">
                        You received this email because you signed up for ${appName}.<br />
                        &copy; ${year} ${appName} &middot; Made for the community
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendRegistrationOtp = async (to, otp, name = "") => {
  const header = "Verify Your Email Address";
  const greeting = name ? `Hello ${name},` : "Hello,";
  const body =
    "Thanks for joining the community. Please confirm your email address by entering the verification code below.";
  const html = buildOtpEmail({ header, greeting, body, otp, expiryMinutes: 5 });
  const result = await sendMail(to, "Verify Your Email Address — Pollify", html);
  if (result.ok) logOtp(to, otp);
  return result;
};

export const sendForgotPasswordOtp = async (to, otp, name = "") => {
  const header = "Reset Your Password";
  const greeting = name ? `Hello ${name},` : "Hello,";
  const body =
    "We received a request to reset your password. Use the code below to verify your identity and choose a new password.";
  const html = buildOtpEmail({ header, greeting, body, otp, expiryMinutes: 5 });
  const result = await sendMail(to, "Reset Your Password — Pollify", html);
  if (result.ok) logOtp(to, otp);
  return result;
};
