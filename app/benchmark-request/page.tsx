"use client";

import { useRouter } from "next/navigation";
import { BenchmarkAside } from "@/components/benchmark/benchmark-aside";
import { BenchmarkMobileHeader } from "@/components/benchmark/benchmark-mobile-header";
import { ReportRequestHero } from "@/components/benchmark-report/report-request-hero";
import { ReportRequestForm } from "@/components/benchmark-report/report-request-form";

export default function BenchmarkRequestPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/benchmark-report");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log("Form submitted");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <BenchmarkAside currentStep={3} />
      <BenchmarkMobileHeader currentStep={3} />

      <main className="flex-1">
        <ReportRequestHero />
        <ReportRequestForm onBack={handleBack} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
