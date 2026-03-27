// ============================================================================
// Shared types for self-assessment flow
// ============================================================================

export interface Option {
  id: string;
  label: string;
}

export interface Step {
  id: string;
  title: string;
  nextLabel: string;
  inputType: "combobox" | "radio-buttons";
  options: Option[];
}

export interface SelfAssessmentResult {
  sector: string;
  score: number;
  alpha: number; // Reduce (%)
  beta: number; // Deploy (%)
  gamma: number; // Finance (%)
  contextMessage: string;
}

export interface Pillar {
  id: string;
  key: "alpha" | "beta" | "gamma";
  label: string;
  description: string;
  color: string;
}

export type SelfAssessmentStep = 1 | 2 | 3;
