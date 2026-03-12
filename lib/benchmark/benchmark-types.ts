// ============================================================================
// Shared types for benchmark flow
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

export interface BenchmarkResult {
  sector: string;
  score: number;
  alpha: number; // Reduce (%)
  beta: number; // Amplify (%)
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

export type BenchmarkStep = 1 | 2 | 3;
