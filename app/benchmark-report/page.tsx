"use client";

import { BenchmarkAside } from "@/components/benchmark/benchmark-aside";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MOCK_RESULT, PILLARS } from "./benchmark-report-data";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { Info } from "lucide-react";

export default function BenchmarkReportPage() {
  const result = MOCK_RESULT;

  // Prepare chart data
  const chartData = [
    {
      name: "Reduce",
      value: result.alpha,
      fill: "#D8E7FA", // Light blue
    },
    {
      name: "Amplify",
      value: result.beta,
      fill: "#CFF8E3", // Light green
    },
    {
      name: "Finance",
      value: result.gamma,
      fill: "#FCF2C8", // Light yellow
    },
  ].filter((item) => item.value > 0);

  const chartConfig = {
    value: {
      label: "Percentage",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-h-screen">
      <BenchmarkAside currentStep={2} />

      <main className="flex-1">
        {/* Zone 1 - Header with Score */}
        <section className="bg-muted py-24 px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-sm font-medium text-muted-foreground">
              Sector: {result.sector}
            </p>
            <h1 className="text-3xl font-semibold">
              {`Your climate contribution potential`}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {result.contextMessage}
            </p>
          </div>
        </section>

        {/* Alert - Not a final scorecard */}
        <section className="px-8 pt-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="p-6">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-base">
                {`This is your contributive potential, not your final scorecard. This score represents what your company could contribute at maximum — not what it does today. The full scorecard measures your actual performance.`}
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Zone 2 - Donut Chart + Legend */}
        <section className="py-16 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Donut Chart */}
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
                    >
                      <Label
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
                                  {result.score}
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

              {/* Legend */}
              <div className="space-y-6">
                {PILLARS.map((pillar) => {
                  const value = result[pillar.key];
                  if (value === 0) return null; // Skip if 0%

                  return (
                    <div key={pillar.id} className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <div
                          className="w-4 h-4 rounded-sm shrink-0 mt-1"
                          style={{ backgroundColor: pillar.color }}
                        />
                        <h3 className="text-xl font-semibold">
                          {pillar.label} — {value} %
                        </h3>
                      </div>
                      <p className="text-muted-foreground ml-7">
                        {pillar.description}
                      </p>
                    </div>
                  );
                })}

              </div>
            </div>
            <div className="mt-8 pt-6 border-t">
              <p className="text-muted-foreground leading-relaxed">
                {`These weightings reflect the actual climate materiality of your sector. They are calculated by the CCF from sector-level data (carbon intensity, technological potential, financial capacity).`}
              </p>
            </div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* Zone 3 - What This Score Means */}
        <section className="py-16 px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed">
            <p>
              {`This score represents what your company could contribute at maximum to the global climate effort, given its sector. It is not an assessment of what you do today — it is the measure of what you could do.`}
            </p>
            <p>
              {`Most climate assessments are limited to your emissions. The CCF is the only framework that also integrates the solutions you develop and the climate finance you mobilise. For the ${result.sector.toLowerCase()} sector, the Solutions pillar (${result.beta}%) reflects the industry's key role in deploying low-carbon mobility.`}
            </p>
            <p>
              {`This benchmark gives you your potential. The full scorecard measures your actual performance against that potential.`}
            </p>
          </div>
        </section>

        {/* Zone 4 - CTA Section */}
        <section className="bg-muted py-36 px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">
              {`Discover your actual contribution`}
            </h2>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                {`This benchmark reveals your potential. The CCF scorecard measures where you truly stand — and what your investors, your clients and your peers don't yet see in your climate actions.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-base h-14 px-8">
                {`Request my full scorecard`}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
