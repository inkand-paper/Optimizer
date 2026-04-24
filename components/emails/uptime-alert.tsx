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

interface UptimeAlertEmailProps {
  userName: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN';
  message?: string;
  latency?: number;
  timestamp: string;
}

export const UptimeAlertEmail = ({
  userName,
  name,
  url,
  status,
  message,
  latency,
  timestamp,
}: UptimeAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>🚩 NexPulse Alert: {name} is {status}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={{ ...heading, color: status === 'UP' ? '#22c55e' : '#ef4444' }}>
            {status === 'UP' ? '✅ System Recovered' : '🚨 System Down'}
          </Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Hello {userName},</Text>
          <Text style={paragraph}>
            Our monitoring engine has detected a status change for your web property: 
            <strong> {name}</strong>.
          </Text>
          <Section style={card}>
            <Text style={label}>Status</Text>
            <Text style={{ ...valueStyle, color: status === 'UP' ? '#22c55e' : '#ef4444' }}>
              {status}
            </Text>
            <Hr style={hr} />
            <Text style={label}>Target URL</Text>
            <Text style={valueStyle}>{url}</Text>
            <Hr style={hr} />
            {message && (
              <>
                <Text style={label}>Error Details</Text>
                <Text style={valueStyle}>{message}</Text>
                <Hr style={hr} />
              </>
            )}
            <Text style={label}>Latency</Text>
            <Text style={valueStyle}>{latency ? `${latency}ms` : 'N/A'}</Text>
            <Hr style={hr} />
            <Text style={label}>Time Detected</Text>
            <Text style={valueStyle}>{timestamp}</Text>
          </Section>
          <Text style={paragraph}>
            {status === 'DOWN' 
              ? "We will continue monitoring and notify you immediately once the system is back online."
              : "Everything is back to normal. No further action is required."}
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            NexPulse Uptime Monitoring: Real-time web intelligence.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default UptimeAlertEmail;

const main = {
  backgroundColor: "#000",
  color: "#fff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const header = {
  padding: "32px",
  textAlign: "center" as const,
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  letterSpacing: "-1px",
};

const content = {
  padding: "32px",
  backgroundColor: "#0a0a0a",
  borderRadius: "16px",
  border: "1px solid #222",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#d4d4d8",
};

const card = {
  padding: "24px",
  backgroundColor: "#111",
  borderRadius: "12px",
  border: "1px solid #333",
  margin: "24px 0",
};

const label = {
  fontSize: "12px",
  color: "#71717a",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 4px 0",
};

const valueStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#fff",
  margin: "0 0 16px 0",
};

const hr = {
  borderColor: "#222",
  margin: "20px 0",
};

const footer = {
  color: "#52525b",
  fontSize: "12px",
  lineHeight: "20px",
  marginTop: "12px",
};
