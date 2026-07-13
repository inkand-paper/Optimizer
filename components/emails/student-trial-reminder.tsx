import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button } from "@react-email/components";
import * as React from "react";

interface StudentTrialReminderEmailProps {
  userName: string;
  expiresAt: string;
  daysLeft: number;
  upgradeUrl: string;
}

export const StudentTrialReminderEmail = ({ userName, expiresAt, daysLeft, upgradeUrl }: StudentTrialReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>{`⏳ Your NexPulse student trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — keep your PRO access`}</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />
        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Trial expiring soon, {userName}.
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            Your student PRO trial ends in{" "}
            <strong style={{ color: "#d4af37" }}>{daysLeft} day{daysLeft === 1 ? '' : 's'}</strong>{" "}
            on <strong style={{ color: "#d4af37" }}>{expiresAt}</strong>.
            After that your account will return to the FREE tier.
          </Text>
        </Section>

        <Section style={{ backgroundColor: "#1a1200", border: "1px solid #3a2a00", borderRadius: "8px", padding: "20px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
            What you will lose on FREE
          </Text>
          <Text style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>✗ Drops from 10 monitors → 1 monitor</Text>
          <Text style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>✗ Drops from 50 AI audits → 3 per month</Text>
          <Text style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>✗ No Intelligence Bank access</Text>
          <Text style={{ color: "#888", fontSize: "13px", margin: "4px 0" }}>✗ No webhooks or API keys</Text>
        </Section>

        <Section style={{ textAlign: "center", marginTop: "28px" }}>
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
            Upgrade to PRO — Keep Access
          </Button>
          <Text style={{ color: "#444", fontSize: "11px", marginTop: "12px" }}>
            Or visit Dashboard → Profile → Manage Subscription
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
