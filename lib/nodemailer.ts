import nodemailer from "nodemailer";

/**
 * [FREE EMAIL ENGINE] - Nodemailer + Gmail
 * Allows sending production emails without a custom domain.
 * Uses Gmail App Passwords for security.
 */

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!user || !pass) {
    console.error("❌ GMAIL_USER or GMAIL_APP_PASSWORD not set in .env");
    return { success: false, error: "Configuration missing" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NexPulse Alerts" <${user}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully via Gmail:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("❌ Failed to send email via Gmail:", error);
    return { success: false, error };
  }
}
