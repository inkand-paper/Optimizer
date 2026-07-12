import { PulseAlertEmail } from "@/components/emails/pulse-alert";
import { UptimeAlertEmail } from "@/components/emails/uptime-alert";
import { VerificationEmail } from "@/components/emails/verification";
import { SecurityAlertEmail } from "@/components/emails/security-alert";
import { PasswordResetEmail } from "@/components/emails/password-reset";
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
  status,
  message,
  latency
}: {
  email: string;
  userName: string;
  name: string;
  status: 'UP' | 'DOWN';
  message?: string;
  latency?: number;
}) {
  try {
    const html = await render(React.createElement(UptimeAlertEmail, {
      userName,
      name,
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

export async function sendSecurityAlert({
  email,
  userName,
  action,
  device,
  browser,
}: {
  email: string;
  userName: string;
  action: string;
  device: string;
  browser: string;
}) {
  try {
    const html = await render(React.createElement(SecurityAlertEmail, {
      userName,
      action,
      device,
      browser,
      timestamp: new Date().toLocaleString()
    }));

    return await sendEmail({
      to: email,
      subject: `🛡️ NexPulse Security Alert: ${action}`,
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send security alert email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail({
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
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const html = await render(React.createElement(PasswordResetEmail, {
      userName,
      resetUrl
    }));

    return await sendEmail({
      to: email,
      subject: "NexPulse — Identity Recovery",
      html: html,
    });
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmationEmail({
  email,
  userName,
  plan,
}: {
  email: string;
  userName: string;
  plan: string;
}) {
  try {
    const { PaymentConfirmationEmail } = await import('@/components/emails/payment-confirmation');
    const html = await render(React.createElement(PaymentConfirmationEmail, { userName, plan, email }));
    return await sendEmail({
      to: email,
      subject: `⚡ NexPulse: ${plan} plan activated`,
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendSubscriptionCancelledEmail({
  email,
  userName,
  plan,
  endsAt,
}: {
  email: string;
  userName: string;
  plan: string;
  endsAt?: string;
}) {
  try {
    const { SubscriptionCancelledEmail } = await import('@/components/emails/subscription-cancelled');
    const html = await render(React.createElement(SubscriptionCancelledEmail, { userName, plan, email, endsAt }));
    return await sendEmail({
      to: email,
      subject: `NexPulse: Your ${plan} subscription has been cancelled`,
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send subscription cancelled email:', error);
    return { success: false, error };
  }
}

export async function sendStudentTrialEmail({
  email,
  userName,
  eduEmail,
  expiresAt,
}: {
  email: string;
  userName: string;
  eduEmail: string;
  expiresAt: string;
}) {
  try {
    const { StudentTrialEmail } = await import('@/components/emails/student-trial');
    const html = await render(React.createElement(StudentTrialEmail, { userName, eduEmail, expiresAt }));
    return await sendEmail({
      to: email,
      subject: '⚡ NexPulse: Your student PRO trial is active',
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send student trial email:', error);
    return { success: false, error };
  }
}

export async function sendStudentRejectionEmail({
  email,
  userName,
  rejectionReason,
  rejectionNote,
}: {
  email: string;
  userName: string;
  rejectionReason: string;
  rejectionNote?: string;
}) {
  try {
    const { StudentRejectionEmail } = await import('@/components/emails/student-rejection');
    const html = await render(React.createElement(StudentRejectionEmail, { userName, rejectionReason, rejectionNote }));
    return await sendEmail({
      to: email,
      subject: 'NexPulse: Update on your student trial application',
      html,
    });
  } catch (error) {
    console.error('❌ Failed to send student rejection email:', error);
    return { success: false, error };
  }
}
