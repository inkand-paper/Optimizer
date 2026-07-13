import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button } from "@react-email/components";
import * as React from "react";

interface StudentTrialExpiredEmailProps {
  userName: string;
  upgradeUrl: string;
}

export const StudentTrialExpiredEmail = ({ userName, upgradeUrl }: StudentTrialExpiredEmailProps) => (
  <Html>
    <Head />
    <Preview>Your NexPulse student trial has ended</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />
        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Trial ended, {userName}.
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            Your 30-day student PRO trial has ended. Your account has returned to the{" "}
            <strong style={{ color: "#d4af37" }}>FREE</strong> tier.
          </Text>
        </Section>

        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px", marginBottom: "24px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 10px" }}>
            On FREE you now have
          </Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· 1 monitored site</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· 3 AI code audits per month</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· No API keys or cache revalidation</Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0" }}>· No webhooks</Text>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={upgradeUrl}
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
            Upgrade to PRO
          </Button>
          <Text style={{ color: "#555", fontSize: "12px", marginTop: "12px" }}>
            Thanks for trying NexPulse. Hope it was useful.
          </Text>
        </Section>

        <Hr style={{ borderColor: "#222", marginTop: "32px" }} />
        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center" }}>
          NexPulse · nexpulse.team@gmail.com
        </Text>
      </Container>
    </Body>
  </Html>
);
