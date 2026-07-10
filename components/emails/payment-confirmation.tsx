import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentConfirmationEmailProps {
  userName: string;
  plan: string;
  email: string;
}

export const PaymentConfirmationEmail = ({
  userName,
  plan,
  email,
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your NexPulse {plan} plan is now active</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />
        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Payment confirmed, {userName}.
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            Your account <strong style={{ color: "#e5e5e5" }}>{email}</strong> has been upgraded to the{" "}
            <strong style={{ color: "#d4af37" }}>{plan} TIER</strong>. All features are now active.
          </Text>
        </Section>
        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
            What&apos;s unlocked
          </Text>
          {plan === "PRO" && (
            <>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 10 monitored sites</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 50 AI code audits per month</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Intelligence Bank access</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ AI diagnosis on audits</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ API keys & cache revalidation</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 5 Discord/Slack webhooks</Text>
            </>
          )}
          {plan === "BUSINESS" && (
            <>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Unlimited monitored sites</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Unlimited AI code audits</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Full Intelligence Bank</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 50 webhooks</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 365-day log retention</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ All limits unlocked</Text>
            </>
          )}
        </Section>
        <Text style={{ color: "#555", fontSize: "12px", marginTop: "32px" }}>
          Manage your subscription anytime from Dashboard → Profile → Manage Subscription.
          Questions? Reply to this email or join our Discord.
        </Text>
        <Hr style={{ borderColor: "#222", marginTop: "24px" }} />
        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center" }}>
          NexPulse · Infrastructure Intelligence Engine
        </Text>
      </Container>
    </Body>
  </Html>
);
