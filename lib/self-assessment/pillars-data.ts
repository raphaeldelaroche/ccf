/**
 * Centralized definition of the 3 pillars of the Climate Contribution Framework
 * Used across self-assessment confirmation and report components
 */

export interface Pillar {
  id: "alpha" | "beta" | "gamma";
  name: string;
  shortName: string;
  description: string;
  color: string;
  icon: string;
}

export const PILLARS: Pillar[] = [
  {
    id: "alpha",
    name: "Reduce",
    shortName: "A",
    description: "Carbon footprint reduction",
    color: "hsl(var(--chart-1))",
    icon: "TrendingDown",
  },
  {
    id: "beta",
    name: "Deploy",
    shortName: "B",
    description: "Climate solutions deployment",
    color: "hsl(var(--chart-2))",
    icon: "Zap",
  },
  {
    id: "gamma",
    name: "Finance",
    shortName: "C",
    description: "Climate finance contribution",
    color: "hsl(var(--chart-3))",
    icon: "DollarSign",
  },
];
