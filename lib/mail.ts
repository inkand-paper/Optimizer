import { resend } from "./resend";
import { PulseAlertEmail } from "@/components/emails/pulse-alert";
import { UptimeAlertEmail } from "@/components/emails/uptime-alert";
import { render } from "@react-email/components";
import React from "react";

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

    const data = await resend.emails.send({
      from: 'NexPulse Alerts <onboarding@resend.dev>',
      to: [email],
      subject: `⚡ NexPulse: Optimization Signal for ${value}`,
      html: html,
    });

    return { success: true, data };
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

    const data = await resend.emails.send({
      from: 'NexPulse Monitoring <onboarding@resend.dev>',
      to: [email],
      subject: `${status === 'UP' ? '✅' : '🚨'} NexPulse Alert: ${name} is ${status}`,
      html: html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to send uptime alert email:", error);
    return { success: false, error };
  }
}
