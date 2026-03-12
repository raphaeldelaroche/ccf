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
}

export function ReportChartSection({
  score,
  pillars,
  pillarValues,
}: ReportChartSectionProps) {
  const chartData = [
    { name: "Reduce", value: pillarValues.alpha, fill: "#D8E7FA" },
    { name: "Amplify", value: pillarValues.beta, fill: "#CFF8E3" },
    { name: "Finance", value: pillarValues.gamma, fill: "#FCF2C8" },
  ].filter((item) => item.value > 0);

  const chartConfig = {
    value: { label: "Percentage" },
  } satisfies ChartConfig;

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
                  innerRadius={80}
                  outerRadius={140}
                  strokeWidth={0}
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
                              y={viewBox.cy}
                              className="fill-foreground text-6xl font-bold"
                            >
                              {score}
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
              return (
                <div
                  key={pillar.id}
                  className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: "400ms",
                  }}
                >
                  <div className="flex items-baseline gap-3">
                    <div
                      className="w-4 h-4 rounded-sm shrink-0 mt-1"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <h3 className="text-xl font-semibold">
                      {pillar.label} — {value}%
                    </h3>
                  </div>
                  <p className="text-muted-foreground ml-7">{pillar.description}</p>
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
