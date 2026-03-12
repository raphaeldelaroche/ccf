// ============================================================================
// Shared constants for benchmark flow
// ============================================================================

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  CHART: 800,
} as const;

export const LAYOUT = {
  SIDEBAR_WIDTH: 320, // w-80
  MAX_CONTENT_WIDTH_SM: 768, // max-w-3xl
  MAX_CONTENT_WIDTH_LG: 896, // max-w-4xl
} as const;

export const PILLAR_COLORS = {
  ALPHA: "#D8E7FA", // Reduce
  BETA: "#CFF8E3", // Amplify
  GAMMA: "#FCF2C8", // Finance
} as const;
