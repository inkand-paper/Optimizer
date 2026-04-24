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

interface PulseAlertEmailProps {
  userName: string;
  type: "tag" | "path";
  value: string;
  timestamp: string;
}

export const PulseAlertEmail = ({
  userName,
  type,
  value,
  timestamp,
}: PulseAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>⚡ NexPulse: Optimization Alert for {value}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={heading}>NexPulse</Heading>
        </Section>
        <Section style={content}>
          <Text style={paragraph}>Hello {userName},</Text>
          <Text style={paragraph}>
            A remote optimization signal was successfully processed by the 
            <strong> NexPulse Engine</strong>.
          </Text>
          <Section style={card}>
            <Text style={label}>Event Type</Text>
            <Text style={valueStyle}>{type.toUpperCase()} Optimization</Text>
            <Hr style={hr} />
            <Text style={label}>Target {type === 'tag' ? 'Tag' : 'Path'}</Text>
            <Text style={valueStyle}>{value}</Text>
            <Hr style={hr} />
            <Text style={label}>Processed At</Text>
            <Text style={valueStyle}>{timestamp}</Text>
          </Section>
          <Text style={paragraph}>
            The target application cache has been updated and fresh content is now being served to your end users.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated security and performance alert from your NexPulse Optimizer Suite.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PulseAlertEmail;

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
  color: "#3b82f6",
  fontSize: "32px",
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
