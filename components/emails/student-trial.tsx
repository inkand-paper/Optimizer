import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

interface StudentTrialEmailProps {
  userName: string;
  eduEmail: string;
  expiresAt: string;
}

export const StudentTrialEmail = ({ userName, eduEmail, expiresAt }: StudentTrialEmailProps) => (
  <Html>
    <Head />
    <Preview>Your NexPulse Student PRO trial is active — expires {expiresAt}</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />
        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Student trial activated, {userName}.
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            Your academic email <strong style={{ color: "#d4af37" }}>{eduEmail}</strong> has been verified.
            You now have full <strong style={{ color: "#d4af37" }}>PRO TIER</strong> access for 30 days, free of charge.
          </Text>
        </Section>
        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
            Your trial includes
          </Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 10 monitored sites</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 50 AI code audits per month</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Intelligence Bank</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ AI diagnosis & Pulse-AI assistant</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ API keys & cache revalidation</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 5 Discord/Slack webhooks</Text>
        </Section>
        <Section style={{ backgroundColor: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "16px", marginTop: "16px" }}>
          <Text style={{ color: "#4ade80", fontSize: "13px", margin: "0" }}>
            Trial expires: <strong>{expiresAt}</strong>
          </Text>
          <Text style={{ color: "#555", fontSize: "11px", margin: "8px 0 0" }}>
            After expiry, your account returns to FREE tier. Upgrade to PRO at any time to keep access.
          </Text>
        </Section>
        <Hr style={{ borderColor: "#222", marginTop: "32px" }} />
        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center" }}>
          NexPulse · Infrastructure Intelligence Engine
        </Text>
      </Container>
    </Body>
  </Html>
);
