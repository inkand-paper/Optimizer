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
  status: 'UP' | 'DOWN';
  message?: string;
  latency?: number;
  timestamp: string;
}

export const UptimeAlertEmail = ({
  userName,
  name,
  status,
  message,
  latency,
  timestamp,
}: UptimeAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>{status === 'UP' ? '✅ RECOVERED' : '🚨 ALERT'}: {name} is {status}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Nex<span style={{ color: "#b48c3c" }}>Pulse</span></Heading>
        </Section>
        
        <Section style={section}>
          <Heading style={{ 
            ...statusHeader, 
            color: status === 'UP' ? "#1d9e75" : "#a32d2d" 
          }}>
            System Status: {status}
          </Heading>
          
          <Text style={text}>
            Operator {userName}, the monitoring engine has detected a status shift for property: <strong>{name}</strong>.
          </Text>

          <Section style={card}>
            <div style={gridRow}>
              <div style={col}>
                <Text style={label}>Identifier</Text>
                <Text style={value}>{name}</Text>
              </div>
              <div style={col}>
                <Text style={label}>Status</Text>
                <Text style={{ ...value, color: status === 'UP' ? "#1d9e75" : "#a32d2d" }}>{status}</Text>
              </div>
            </div>
            
            <Hr style={innerHr} />
            
            <Text style={label}>Incident Report</Text>
            <Text style={value}>{message || "System responding normally."}</Text>
            
            <Hr style={innerHr} />

            <div style={gridRow}>
              <div style={col}>
                <Text style={label}>Latency</Text>
                <Text style={value}>{latency ? `${latency}ms` : "—"}</Text>
              </div>
              <div style={col}>
                <Text style={label}>Time Detected</Text>
                <Text style={value}>{timestamp}</Text>
              </div>
            </div>
          </Section>

          <Text style={text}>
            {status === 'DOWN' 
              ? "Emergency protocols are active. We will continue monitoring and notify you the moment recovery is detected."
              : "Recovery successful. The infrastructure has returned to nominal operational parameters."}
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            NexPulse Infrastructure Command • Real-time Monitoring
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

const value = {
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

export default UptimeAlertEmail;
