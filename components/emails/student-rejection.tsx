import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface StudentRejectionEmailProps {
  userName: string;
  rejectionReason: string;
  rejectionNote?: string;
}

export const StudentRejectionEmail = ({
  userName,
  rejectionReason,
  rejectionNote,
}: StudentRejectionEmailProps) => (
  <Html>
    <Head />
    <Preview>NexPulse student trial application update</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          ⚡ NexPulse
        </Heading>
        <Hr style={{ borderColor: "#222" }} />

        <Section style={{ padding: "24px 0" }}>
          <Text style={{ color: "#e5e5e5", fontSize: "16px", marginBottom: "8px" }}>
            Hi {userName},
          </Text>
          <Text style={{ color: "#999", fontSize: "14px", lineHeight: "1.6" }}>
            We reviewed your student trial application but were unable to approve it this time.
          </Text>
        </Section>

        <Section style={{ backgroundColor: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
          <Text style={{ color: "#f87171", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 10px" }}>
            Reason
          </Text>
          <Text style={{ color: "#e5e5e5", fontSize: "14px", margin: "0", lineHeight: "1.6" }}>
            {rejectionReason}
          </Text>
          {rejectionNote && (
            <Text style={{ color: "#aaa", fontSize: "13px", margin: "12px 0 0", lineHeight: "1.6", borderTop: "1px solid #2a1a1a", paddingTop: "12px" }}>
              {rejectionNote}
            </Text>
          )}
        </Section>

        <Section style={{ backgroundColor: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
          <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 10px" }}>
            What to do next
          </Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "4px 0", lineHeight: "1.6" }}>
            You can reapply from <strong style={{ color: "#e5e5e5" }}>Dashboard → Profile → Student Access</strong> after correcting the issue above.
          </Text>
          <Text style={{ color: "#aaa", fontSize: "13px", margin: "12px 0 0", lineHeight: "1.6" }}>
            If you believe this decision is incorrect or need help, reply to this email directly and we will take another look.
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
