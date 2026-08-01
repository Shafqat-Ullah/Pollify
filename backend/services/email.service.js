// EmailJS-based verification email delivery.
//
// Emails are sent through the EmailJS REST API (https://emailjs.com) instead of
// SMTP, which avoids IPv6 / port / credential issues on free hosting. The
// private key must stay server-side and is read from EMAILJS_PRIVATE_KEY.

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

// Set to true when EmailJS is unavailable. Auth flows then fall back to
// printing the OTP in the logs so they keep working until credentials are set.
let consoleFallbackActive = false;

const hasEmailJsConfig = () => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  return Boolean(
    serviceId &&
      templateId &&
      privateKey &&
      publicKey &&
      serviceId !== "your_service_id" &&
      templateId !== "your_template_id" &&
      privateKey !== "your_private_key" &&
      publicKey !== "your_public_key"
  );
};

// Returns { ok, emailed }: emailed is true only when a real message left via
// EmailJS. When EmailJS is unavailable, ok stays true so auth flows don't break
// and the OTP is surfaced in the server logs.
const sendMail = async (to, subject, params) => {
  // Test/CI mode: skip real delivery while still logging the OTP.
  if (process.env.EMAIL_DISABLE === "true") return { ok: true, emailed: false };

  if (!hasEmailJsConfig()) {
    if (!consoleFallbackActive) {
      console.error(
        "[EMAIL] EmailJS is not configured (missing EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / EMAILJS_PRIVATE_KEY). " +
          "Verification emails will NOT be sent; OTP codes are printed in the server logs instead."
      );
    }
    consoleFallbackActive = true;
    return { ok: true, emailed: false };
  }

  try {
    const response = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAILJS_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: to,
          subject,
          ...params,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API responded with ${response.status}: ${await response.text()}`);
    }

    console.log(`[EMAIL] Sent "${subject}" to ${to} via EmailJS.`);
    return { ok: true, emailed: true };
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}: ${error.message}`);
    return { ok: false, emailed: false };
  }
};

const logOtp = (to, otp) => {
  if (process.env.NODE_ENV !== "production" || consoleFallbackActive) {
    console.log(`[EMAIL] OTP for ${to}: ${otp} (valid 5 minutes)`);
  }
};

// The EmailJS template must define these variables:
//   {{to_email}}, {{to_name}}, {{subject}}, {{otp}}, {{expiry_minutes}}
export const sendRegistrationOtp = async (to, otp, name = "") => {
  const subject = "Verify Your Email Address — Pollify";
  const result = await sendMail(to, subject, {
    to_name: name || "there",
    otp,
    expiry_minutes: 5,
  });
  if (result.ok) logOtp(to, otp);
  return result;
};

export const sendForgotPasswordOtp = async (to, otp, name = "") => {
  const subject = "Reset Your Password — Pollify";
  const result = await sendMail(to, subject, {
    to_name: name || "there",
    otp,
    expiry_minutes: 5,
  });
  if (result.ok) logOtp(to, otp);
  return result;
};
