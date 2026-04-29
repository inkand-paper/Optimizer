import { PulseAlertEmail } from "@/components/emails/pulse-alert";
import { UptimeAlertEmail } from "@/components/emails/uptime-alert";
import { VerificationEmail } from "@/components/emails/verification";
import { render } from "@react-email/components";
import React from "react";
import { sendEmail } from "./nodemailer";

/**
 * [HYBRID MAIL SYSTEM]
 * Defaults to Nodemailer (Gmail) for free production delivery.
 * Keeps React Email templates for premium design.
 */

export async function sendPulseAlert({
  email,
  userName,
  type,
  value
}: {
  email: string;
  userName: string;
  type: "tag" | "path";
  value: string;
}) {
  try {
    const html = await render(React.createElement(PulseAlertEmail, {
      userName,
      type,
      value,
      timestamp: new Date().toLocaleString()
    }));

    return await sendEmail({
      to: email,
      subject: `⚡ NexPulse: Optimization Signal for ${value}`,
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send pulse alert email:", error);
    return { success: false, error };
  }
}

export async function sendUptimeAlert({
  email,
  userName,
  name,
  url,
  status,
  message,
  latency
}: {
  email: string;
  userName: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN';
  message?: string;
  latency?: number;
}) {
  try {
    const html = await render(React.createElement(UptimeAlertEmail, {
      userName,
      name,
      url,
      status,
      message,
      latency,
      timestamp: new Date().toLocaleString()
    }));

    return await sendEmail({
      to: email,
      subject: `${status === 'UP' ? '✅' : '🚨'} NexPulse Alert: ${name} is ${status}`,
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send uptime alert email:", error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail({
  email,
  userName,
  token
}: {
  email: string;
  userName: string;
  token: string;
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;

    const html = await render(React.createElement(VerificationEmail, {
      userName,
      verificationUrl
    }));

    return await sendEmail({
      to: email,
      subject: "Activate your NexPulse account",
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    return { success: false, error };
  }
}
