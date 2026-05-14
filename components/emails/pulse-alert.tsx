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
    <Preview>⚡ Optimization Processed: {value}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Nex<span style={{ color: "#b48c3c" }}>Pulse</span></Heading>
        </Section>
        
        <Section style={section}>
          <Heading style={statusHeader}>
            Pulse Signal Processed
          </Heading>
          
          <Text style={text}>
            Operator {userName}, a remote cache invalidation signal has been successfully executed by the NexPulse Optimization Engine.
          </Text>

          <Section style={card}>
            <div style={gridRow}>
              <div style={col}>
                <Text style={label}>Signal Type</Text>
                <Text style={valueStyle}>{type.toUpperCase()} PURGE</Text>
              </div>
              <div style={col}>
                <Text style={label}>Execution Status</Text>
                <Text style={{ ...valueStyle, color: "#1d9e75" }}>SUCCESS</Text>
              </div>
            </div>
            
            <Hr style={innerHr} />
            
            <Text style={label}>Target Identifier</Text>
            <Text style={valueStyle}>{value}</Text>
            
            <Hr style={innerHr} />

            <div style={gridRow}>
              <div style={col}>
                <Text style={label}>Latency</Text>
                <Text style={valueStyle}>&lt; 50ms</Text>
              </div>
              <div style={col}>
                <Text style={label}>Timestamp</Text>
                <Text style={valueStyle}>{timestamp}</Text>
              </div>
            </div>
          </Section>

          <Text style={text}>
            The target application cache has been updated. Fresh, optimized content is now being delivered globally to your end users.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            NexPulse Infrastructure Command • Signal Intelligence
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

const section = {
  backgroundColor: "#111111",
  padding: "40px",
  borderRadius: "8px",
  border: "1px solid #222222",
};

const statusHeader = {
  color: "#1d9e75",
  fontSize: "18px",
  fontWeight: "800",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 30px",
};

const text = {
  color: "#aaaaaa",
  fontSize: "14px",
  lineHeight: "22px",
};

const card = {
  backgroundColor: "#000000",
  padding: "25px",
  borderRadius: "6px",
  border: "1px solid #222222",
  margin: "25px 0",
};

const gridRow = {
  display: "table",
  width: "100%",
};

const col = {
  display: "table-cell",
  width: "50%",
  padding: "0 10px",
};

const label = {
  color: "#555555",
  fontSize: "10px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 5px",
};

const valueStyle = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "0",
};

const innerHr = {
  borderColor: "#111111",
  margin: "15px 0",
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

export default PulseAlertEmail;
