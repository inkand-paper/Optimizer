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
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export const VerificationEmail = ({
  userName,
  verificationUrl,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Activate your NexPulse account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Welcome to NexPulse</Heading>
        </Section>
        <Section style={content}>
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            Thank you for joining the Next.js Optimizer Suite. To get started and unlock your dashboard, please verify your email address by clicking the button below:
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={verificationUrl}>
              Verify Email Address
            </Link>
          </Section>
          <Text style={text}>
            If you did not create an account, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            &copy; {new Date().getFullYear()} NexPulse Team. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #e6ebf1",
};

const header = {
  backgroundColor: "#2563eb",
  padding: "32px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "32px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "48px",
  textAlign: "center" as const,
};
