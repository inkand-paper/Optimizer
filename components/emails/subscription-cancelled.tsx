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

interface SubscriptionCancelledEmailProps {
  userName: string;
  plan: string;
  email: string;
  endsAt?: string;
}

export const SubscriptionCancelledEmail = ({
  userName,
  plan,
  email,
  endsAt,
}: SubscriptionCancelledEmailProps) => (
  <Html>
    <Head />
    <Preview>Your NexPulse {plan} subscription has been cancelled</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />
        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Subscription cancelled, {userName}.
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            Your <strong style={{ color: "#d4af37" }}>{plan} TIER</strong> subscription for{" "}
            <strong style={{ color: "#e5e5e5" }}>{email}</strong> has been cancelled.
            {endsAt
              ? ` You will retain access until ${endsAt}, after which your account will revert to the FREE tier.`
              : " Your account has been reverted to the FREE tier."}
          </Text>
        </Section>
        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
            What changes on FREE
          </Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· 1 monitored site</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· 3 AI code audits per month</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· No API keys or cache revalidation</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· No webhooks</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· 7-day log retention</Text>
        </Section>
        <Text style={{ color: "#555", fontSize: "12px", marginTop: "32px" }}>
          Changed your mind? Resubscribe anytime from Dashboard → Profile → Manage Subscription.
        </Text>
        <Hr style={{ borderColor: "#222", marginTop: "24px" }} />
        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center" }}>
          NexPulse · Infrastructure Intelligence Engine
        </Text>
      </Container>
    </Body>
  </Html>
);
