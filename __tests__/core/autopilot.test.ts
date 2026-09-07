import { describe, it, expect } from "vitest";

export interface IncidentInput {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "REMEDIATED" | "DISMISSED";
  mode: "OBSERVE" | "RECOMMEND" | "AUTOPILOT";
  targetNode: string;
  impact: string;
  rootCause: string;
  confidence: number;
  recommendedFix: string;
}

export function evaluateIncidentConfidence(input: IncidentInput): { safeToAutoRemediate: boolean; actionPlan: string } {
  const isHighConfidence = input.confidence >= 80;
  const isAutoMode = input.mode === "AUTOPILOT";
  const safeToAutoRemediate = isHighConfidence && isAutoMode;

  return {
    safeToAutoRemediate,
    actionPlan: safeToAutoRemediate
      ? `Auto-Executing: ${input.recommendedFix}`
      : `Pending Approval: ${input.recommendedFix}`,
  };
}

describe("Autopilot Engine — Incident Correlation & Remediation Safety", () => {
  it("recommends human confirmation in RECOMMEND mode", () => {
    const incident: IncidentInput = {
      title: "API Latency Spike",
      severity: "HIGH",
      status: "OPEN",
      mode: "RECOMMEND",
      targetNode: "/api/products",
      impact: "18% requests affected",
      rootCause: "PostgreSQL query regression",
      confidence: 89,
      recommendedFix: "Rollback deployment #a83f21",
    };

    const evaluation = evaluateIncidentConfidence(incident);
    expect(evaluation.safeToAutoRemediate).toBe(false);
    expect(evaluation.actionPlan).toContain("Pending Approval");
  });

  it("enables autonomous execution in AUTOPILOT mode with high confidence", () => {
    const incident: IncidentInput = {
      title: "Redis Cache Overflow",
      severity: "MEDIUM",
      status: "OPEN",
      mode: "AUTOPILOT",
      targetNode: "redis://cache",
      impact: "5% memory limit warning",
      rootCause: "Unpurged stale keys",
      confidence: 95,
      recommendedFix: "Purge cache tag #products",
    };

    const evaluation = evaluateIncidentConfidence(incident);
    expect(evaluation.safeToAutoRemediate).toBe(true);
    expect(evaluation.actionPlan).toContain("Auto-Executing");
  });

  it("blocks autonomous execution if confidence score is below 80%", () => {
    const incident: IncidentInput = {
      title: "Unknown Latency Spike",
      severity: "HIGH",
      status: "OPEN",
      mode: "AUTOPILOT",
      targetNode: "/api/checkout",
      impact: "10% error rate",
      rootCause: "Potential third-party API timeout",
      confidence: 65,
      recommendedFix: "Restart service container",
    };

    const evaluation = evaluateIncidentConfidence(incident);
    expect(evaluation.safeToAutoRemediate).toBe(false);
    expect(evaluation.actionPlan).toContain("Pending Approval");
  });
});
