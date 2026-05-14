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
          <Heading style={h1}>Security Alert</Heading>
        </Section>
        <Section style={section}>
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            This is an automated notification to inform you that your <strong>{action}</strong> was recently updated.
          </Text>
          
          <Section style={detailsContainer}>
            <Text style={detailsTitle}>Event Details:</Text>
            <Text style={detailsText}>
              <strong>Time:</strong> {timestamp}<br />
              <strong>Device:</strong> {device}<br />
              <strong>Browser:</strong> {browser}
            </Text>
          </Section>

          <Text style={text}>
            If this was you, you can safely ignore this email. If you did not make this change, please contact support immediately to secure your account.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            NexPulse Infrastructure Suite • Secure Operations Center
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "580px",
};

const header = {
  padding: "20px 0",
};

const h1 = {
  color: "#b48c3c",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const section = {
  backgroundColor: "#111111",
  padding: "30px",
  borderRadius: "8px",
  border: "1px solid #222222",
};

const text = {
  color: "#cccccc",
  fontSize: "14px",
  lineHeight: "24px",
};

const detailsContainer = {
  backgroundColor: "#161616",
  padding: "20px",
  borderRadius: "4px",
  margin: "20px 0",
  borderLeft: "4px solid #b48c3c",
};

const detailsTitle = {
  color: "#b48c3c",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  marginBottom: "10px",
};

const detailsText = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "20px",
};

const hr = {
  borderColor: "#222222",
  margin: "20px 0",
};

const footer = {
  color: "#555555",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default SecurityAlertEmail;
