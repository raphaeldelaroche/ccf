"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label as RechartsLabel, Pie, PieChart } from "recharts";

interface Pillar {
  id: string;
  key: "alpha" | "beta" | "gamma";
  label: string;
  description: string;
  color: string;
}

interface ReportChartSectionProps {
  score: number;
  pillars: readonly Pillar[];
  pillarValues: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  highlightDynamic?: boolean;
}

// Simple inline wrapper for highlighting
function DynamicHighlight({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  if (!highlight) return <>{children}</>;
  return (
    <span className="bg-yellow-200 dark:bg-yellow-900/50 outline outline-2 outline-yellow-400 dark:outline-yellow-600 rounded px-1">
      {children}
    </span>
  );
}

export function ReportChartSection({
  score,
  pillars,
  pillarValues,
  highlightDynamic = false,
}: ReportChartSectionProps) {
  const totalScore = pillarValues.alpha + pillarValues.beta + pillarValues.gamma;
  const remainingScore = 100 - totalScore;

  const chartData = [
    { name: "Reduce", value: pillarValues.alpha, fill: "#ecfccb", stroke: "#d9f99d" },
    { name: "Deploy", value: pillarValues.beta, fill: "#cffafe", stroke: "#a5f3fc" },
    { name: "Finance", value: pillarValues.gamma, fill: "#fae8ff", stroke: "#f5d0fe" },
    ...(remainingScore > 0
      ? [{ name: "Empty", value: remainingScore, fill: "#FFFFFF", stroke: "transparent" }]
      : []),
  ].filter((item) => item.value > 0);

  const colorMap: Record<string, { bg: string; border: string; letter: string }> = {
    alpha: { bg: "#ecfccb", border: "#d9f99d", letter: "A" },
    beta: { bg: "#cffafe", border: "#a5f3fc", letter: "B" },
    gamma: { bg: "#fae8ff", border: "#f5d0fe", letter: "C" },
  };

  const chartConfig = {
    value: { label: "Percentage" },
  } satisfies ChartConfig;

  return (
    <section className="">
      <div className="">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <ChartContainer
              config={chartConfig}
              className="aspect-square w-full max-w-[400px]"
            >
              <PieChart width={400} height={400}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={95}
                  outerRadius={140}
                  strokeWidth={1}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  <RechartsLabel
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 30}
                              className="fill-muted-foreground text-xs uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-maison-mono)" }}
                            >
                              POTENTIAL
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 15}
                              className={highlightDynamic ? "fill-yellow-600 text-6xl font-bold" : "fill-foreground text-6xl font-bold"}
                              style={{ fontFamily: "var(--font-maison-mono)" }}
                            >
                              {score}
                            </tspan>
                            <tspan
                              className="fill-foreground text-3xl font-bold"
                              style={{ fontFamily: "var(--font-maison-mono)" }}
                            >
                              %
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="space-y-6">
            {pillars.map((pillar, index) => {
              const value = pillarValues[pillar.key];
              if (value === 0) return null;
              const colors = colorMap[pillar.key];
              return (
                <div
                  key={pillar.id}
                  className="space-y-0 animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "400ms",
                  }}
                >
                  <div className="flex items-baseline gap-x-4">
                    <div
                      className="size-10 rounded-sm shrink-0 flex items-center justify-center text-base border text-foreground"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      {colors.letter}
                    </div>
                    <h3 className="text-xl font-normal">
                      {pillar.label} — <DynamicHighlight highlight={highlightDynamic}>{value}%</DynamicHighlight>
                    </h3>
                  </div>
                  <p className="text-muted-foreground ml-14">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-muted-foreground leading-relaxed">
            These weightings reflect the actual climate materiality of your sector.
            They are calculated by the CCF from sector-level data (carbon intensity,
            technological potential, financial capacity).
          </p>
        </div>
      </div>
    </section>
  );
}
