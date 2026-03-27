// ============================================================================
// Self Assessment Report — Mock data (for prototype only)
// ============================================================================

export interface SelfAssessmentResult {
  sector: string;
  score: number;
  alpha: number; // Réduire (%)
  beta: number; // Amplifier (%)
  gamma: number; // Financer (%)
  contextMessage: string;
}

// Mock data for Automotive sector (as per spec)
export const MOCK_RESULT: SelfAssessmentResult = {
  sector: "Automotive",
  score: 88,
  alpha: 59,
  beta: 24,
  gamma: 4,
  contextMessage:
    "The Automotive sector has one of the highest contributive potentials among the 100+ sub-sectors analysed by the CCF.",
};

// Pillar definitions
export const PILLARS = [
  {
    id: "alpha",
    key: "alpha" as const,
    label: "Reduce",
    description:
      "Reduction of direct and indirect emissions (Scopes 1-2-3), transition plans, climate governance.",
    color: "#D8E7FA",
  },
  {
    id: "beta",
    key: "beta" as const,
    label: "Deploy",
    description:
      "Green revenues, low-carbon solutions, avoided emissions through your products and services.",
    color: "#CFF8E3",
  },
  {
    id: "gamma",
    key: "gamma" as const,
    label: "Finance",
    description:
      "Carbon credits, climate philanthropy, climate Funds.",
    color: "#FCF2C8",
  },
] as const;
