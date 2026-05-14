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

interface SecurityAlertEmailProps {
  userName: string;
  action: string;
  device: string;
  browser: string;
  timestamp: string;
}

export const SecurityAlertEmail = ({
  userName,
  action,
  device,
  browser,
  timestamp,
}: SecurityAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>NexPulse Security Alert: {action}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Nex<span style={{ color: "#b48c3c" }}>Pulse</span></Heading>
        </Section>
        <Section style={section}>
          <Heading style={h2}>Security Notification</Heading>
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            Our security engine has detected a critical account update: <strong>{action}</strong>.
          </Text>
          
          <Section style={detailsContainer}>
            <Text style={detailsTitle}>Event Metadata</Text>
            <Text style={detailsText}>
              <strong>Timestamp:</strong> {timestamp}<br />
              <strong>Identity:</strong> {device}<br />
              <strong>Interface:</strong> {browser}
            </Text>
          </Section>

          <Text style={text}>
            If you did not initiate this change, your account may be compromised. Please take immediate action to secure your credentials or contact the NexPulse Security Operations Center.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            NexPulse SOC • Infrastructure Security & Monitoring
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "580px",
};

const header = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const h2 = {
  color: "#a32d2d",
  fontSize: "18px",
  fontWeight: "800",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 30px",
};

const section = {
  backgroundColor: "#111111",
  padding: "40px",
  borderRadius: "8px",
  border: "1px solid #222222",
};

const text = {
  color: "#cccccc",
  fontSize: "14px",
  lineHeight: "24px",
};

const detailsContainer = {
  backgroundColor: "#000000",
  padding: "25px",
  borderRadius: "6px",
  margin: "25px 0",
  borderLeft: "4px solid #b48c3c",
};

const detailsTitle = {
  color: "#b48c3c",
  fontSize: "10px",
  fontWeight: "800",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  marginBottom: "10px",
};

const detailsText = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "20px",
};

const hr = {
  borderColor: "#222222",
  margin: "30px 0",
};

const footer = {
  color: "#444444",
  fontSize: "11px",
  textAlign: "center" as const,
};

export default SecurityAlertEmail;
