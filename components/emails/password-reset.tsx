import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Identity Recovery: NexPulse Credentials</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Nex<span style={{ color: "#b48c3c" }}>Pulse</span></Heading>
        </Section>
        <Section style={section}>
          <Heading style={h2}>Identity Recovery</Heading>
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            We received a request to reset the administrative credentials for your NexPulse account. To proceed with the security update, please authorize the reset using the link below.
          </Text>
          
          <Section style={btnContainer}>
            <Link style={button} href={resetUrl}>
              Reset Credentials
            </Link>
          </Section>

          <Text style={text}>
            If you did not initiate this recovery process, your account remains secure. Please disregard this notification. The authorization link will expire in 1 hour.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            NexPulse • Infrastructure Command Center
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
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const h2 = {
  color: "#b48c3c",
  fontSize: "20px",
  fontWeight: "700",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "30px 0 20px",
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

const btnContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#b48c3c",
  borderRadius: "4px",
  color: "#000000",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 30px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const hr = {
  borderColor: "#222222",
  margin: "30px 0",
};

const footer = {
  color: "#555555",
  fontSize: "12px",
  textAlign: "center" as const,
};

export default PasswordResetEmail;
