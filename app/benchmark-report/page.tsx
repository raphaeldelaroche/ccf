"use client";

import { useState } from "react";
import { BenchmarkAside } from "@/components/benchmark/benchmark-aside";
import { BenchmarkMobileHeader } from "@/components/benchmark/benchmark-mobile-header";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MOCK_RESULT, PILLARS } from "@/lib/benchmark/benchmark-report-data";
import { Info } from "lucide-react";
import { ReportHeader } from "@/components/benchmark-report/report-header";
import { ReportChartSection } from "@/components/benchmark-report/report-chart-section";
import { ReportExplanation } from "@/components/benchmark-report/report-explanation";
import { ReportCTA } from "@/components/benchmark-report/report-cta";
import { ReportRequestForm } from "@/components/benchmark-report/report-request-form";

type Step = 2 | 3;

export default function BenchmarkReportPage() {
  const result = MOCK_RESULT;
  const [step, setStep] = useState<Step>(2);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <BenchmarkAside currentStep={step} />
      <BenchmarkMobileHeader currentStep={step} />

      <main className="flex-1">
        {step === 2 && (
          <>
            <ReportHeader
              sector={result.sector}
              title="Your climate contribution potential"
              description={result.contextMessage}
            />

            <section className="px-4 sm:px-6 lg:px-8 pt-8">
              <div className="max-w-4xl mx-auto">
                <Alert className="p-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-base">
                    This is your contributive potential, not your final scorecard. This
                    score represents what your company could contribute at maximum — not
                    what it does today. The full scorecard measures your actual performance.
                  </AlertDescription>
                </Alert>
              </div>
            </section>

            <ReportChartSection
              score={result.score}
              pillars={PILLARS}
              pillarValues={{
                alpha: result.alpha,
                beta: result.beta,
                gamma: result.gamma,
              }}
            />

            <Separator className="max-w-5xl mx-auto" />

            <ReportExplanation sector={result.sector} beta={result.beta} />

            <ReportCTA onAction={() => setStep(3)} />
          </>
        )}

        {step === 3 && (
          <ReportRequestForm
            onBack={() => setStep(2)}
            onSubmit={(e) => e.preventDefault()}
          />
        )}
      </main>
    </div>
  );
}
