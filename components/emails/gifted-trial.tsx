import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button } from "@react-email/components";
import * as React from "react";

interface GiftedTrialEmailProps {
  userName: string;
  plan: string;
  permanent: boolean;
  expiresAt?: string;
  dashboardUrl: string;
}

export const GiftedTrialEmail = ({ userName, plan, permanent, expiresAt, dashboardUrl }: GiftedTrialEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been gifted {plan} access on NexPulse</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />

        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Hey {userName},
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            You have been gifted <strong style={{ color: "#d4af37" }}>{plan === 'BUSINESS' ? 'Agency' : plan} access</strong> on NexPulse —{" "}
            {permanent
              ? "with no expiry date. Enjoy."
              : `active until ${expiresAt}.`
            }
          </Text>
        </Section>

        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
            {plan === 'BUSINESS' ? 'Agency' : 'PRO'} includes
          </Text>
          {plan === 'PRO' && (
            <>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 10 monitored sites</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 50 AI code audits per month</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Full AI diagnosis and Intelligence Bank</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ API keys and cache revalidation</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 5 Discord/Slack webhooks</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 30-day log retention</Text>
            </>
          )}
          {plan === 'BUSINESS' && (
            <>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Unlimited monitored sites</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ Unlimited AI code audits</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 50 webhooks</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ 365-day log retention</Text>
              <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>✓ All limits unlocked</Text>
            </>
          )}
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: "#d4af37",
              color: "#0a0a0a",
              padding: "12px 32px",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go to Dashboard
          </Button>
        </Section>

        <Hr style={{ borderColor: "#222", marginTop: "32px" }} />
        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center" }}>
          NexPulse · nexpulse.team@gmail.com
        </Text>
      </Container>
    </Body>
  </Html>
);
