import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Row, Column,
} from "@react-email/components";
import * as React from "react";

interface MonitorSummary {
  name: string;
  url: string;
  uptimePct: number | null;
  avgLatency: number | null;
  incidents: number;
  status: string;
}

interface AuditSummary {
  repoName: string;
  score: number;
  grade: string;
  language: string;
  createdAt: string;
}

interface WeeklyDigestEmailProps {
  userName: string;
  weekStart: string;
  weekEnd: string;
  monitors: MonitorSummary[];
  audits: AuditSummary[];
  totalIncidents: number;
  dashboardUrl: string;
}

const gradeColor = (grade: string) => {
  if (grade === 'A') return '#1D9E75';
  if (grade === 'B') return '#d4af37';
  if (grade === 'C') return '#BA7517';
  return '#E05C2A';
};

const uptimeColor = (pct: number | null) => {
  if (pct === null) return '#555';
  if (pct >= 99) return '#1D9E75';
  if (pct >= 95) return '#BA7517';
  return '#E05C2A';
};

export const WeeklyDigestEmail = ({
  userName,
  weekStart,
  weekEnd,
  monitors,
  audits,
  totalIncidents,
  dashboardUrl,
}: WeeklyDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>NexPulse weekly summary — {weekStart} to {weekEnd}</Preview>
    <Body style={{ backgroundColor: "#0a0a0a", fontFamily: "monospace" }}>
      <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <Heading style={{ color: "#d4af37", fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>
          ⚡ NexPulse
        </Heading>
        <Text style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 24px" }}>
          Weekly Digest
        </Text>
        <Hr style={{ borderColor: "#222", margin: "0 0 24px" }} />

        {/* Greeting */}
        <Text style={{ color: "#e5e5e5", fontSize: "15px", margin: "0 0 4px" }}>
          Hey {userName},
        </Text>
        <Text style={{ color: "#999", fontSize: "13px", lineHeight: "1.6", margin: "0 0 28px" }}>
          Here is your infrastructure summary for {weekStart} to {weekEnd}.
        </Text>

        {/* Overall health pill */}
        <Section style={{
          background: totalIncidents === 0 ? "rgba(29,158,117,0.08)" : "rgba(186,117,23,0.08)",
          border: `0.5px solid ${totalIncidents === 0 ? "rgba(29,158,117,0.2)" : "rgba(186,117,23,0.2)"}`,
          borderLeft: `3px solid ${totalIncidents === 0 ? "#1D9E75" : "#BA7517"}`,
          borderRadius: "8px",
          padding: "14px 18px",
          marginBottom: "28px",
        }}>
          <Text style={{ color: totalIncidents === 0 ? "#1D9E75" : "#BA7517", fontSize: "14px", fontWeight: "500", margin: 0 }}>
            {totalIncidents === 0
              ? "All systems ran without incidents this week."
              : `${totalIncidents} incident${totalIncidents !== 1 ? 's' : ''} detected across your monitored sites.`
            }
          </Text>
        </Section>

        {/* Monitors section */}
        {monitors.length > 0 && (
          <Section style={{ marginBottom: "28px" }}>
            <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
              Uptime Monitoring
            </Text>
            {monitors.map((m, i) => (
              <Row key={i} style={{ borderBottom: "0.5px solid #1a1a1a", padding: "10px 0", marginBottom: "4px" }}>
                <Column style={{ width: "60%" }}>
                  <Text style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: "500", margin: "0 0 2px" }}>
                    {m.name}
                  </Text>
                  <Text style={{ color: "#444", fontSize: "11px", margin: 0 }}>
                    {m.incidents > 0 ? `${m.incidents} incident${m.incidents !== 1 ? 's' : ''}` : 'No incidents'}
                    {m.avgLatency ? ` · ${m.avgLatency}ms avg` : ''}
                  </Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={{
                    color: uptimeColor(m.uptimePct),
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                  }}>
                    {m.uptimePct !== null ? `${m.uptimePct}%` : '—'}
                  </Text>
                  <Text style={{ color: "#444", fontSize: "10px", textTransform: "uppercase", margin: 0 }}>
                    uptime
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {/* Code audits section */}
        {audits.length > 0 && (
          <Section style={{ marginBottom: "28px" }}>
            <Text style={{ color: "#d4af37", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 12px" }}>
              Code Audits This Week
            </Text>
            {audits.map((a, i) => (
              <Row key={i} style={{ borderBottom: "0.5px solid #1a1a1a", padding: "10px 0", marginBottom: "4px" }}>
                <Column style={{ width: "70%" }}>
                  <Text style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: "500", margin: "0 0 2px" }}>
                    {a.repoName || "Code Snippet"}
                  </Text>
                  <Text style={{ color: "#444", fontSize: "11px", margin: 0 }}>
                    {a.language} · {new Date(a.createdAt).toLocaleDateString()}
                  </Text>
                </Column>
                <Column style={{ width: "30%", textAlign: "right" }}>
                  <Text style={{
                    color: gradeColor(a.grade),
                    fontSize: "22px",
                    fontWeight: "700",
                    margin: "0 0 2px",
                    letterSpacing: "-0.02em",
                  }}>
                    {a.grade}
                  </Text>
                  <Text style={{ color: "#444", fontSize: "10px", margin: 0 }}>
                    score: {a.score}
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
        )}

        {monitors.length === 0 && audits.length === 0 && (
          <Section style={{ padding: "24px 0", textAlign: "center", marginBottom: "28px" }}>
            <Text style={{ color: "#555", fontSize: "13px" }}>
              No activity this week. Add monitors or run a code audit from your dashboard.
            </Text>
          </Section>
        )}

        {/* CTA */}
        <Section style={{ textAlign: "center", marginBottom: "28px" }}>
          <a
            href={dashboardUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#d4af37",
              color: "#0a0a0a",
              padding: "12px 32px",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            Open Dashboard
          </a>
        </Section>

        <Hr style={{ borderColor: "#1a1a1a", margin: "0 0 16px" }} />

        <Text style={{ color: "#333", fontSize: "11px", textAlign: "center", margin: 0 }}>
          NexPulse · You are receiving this because weekly digest is enabled in your profile.{" "}
          <a href={`${dashboardUrl}/profile`} style={{ color: "#444" }}>Unsubscribe</a>
        </Text>
      </Container>
    </Body>
  </Html>
);
