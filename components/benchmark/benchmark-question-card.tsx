"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BenchmarkQuestionCardProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  nextLabel: string;
  canProceed: boolean;
  onNext: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export function BenchmarkQuestionCard({
  currentStep,
  totalSteps,
  title,
  nextLabel,
  canProceed,
  onNext,
  onBack,
  children,
}: BenchmarkQuestionCardProps) {
  return (
    <div className="w-full max-w-3xl space-y-12">
      <div className="space-y-10">
        <div>
          <Badge variant="outline" className="mb-3">
            Step {currentStep + 1} / {totalSteps}
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
            {title}
          </h1>
        </div>

        <div className="space-y-4">{children}</div>

        <div className="flex gap-4 pt-4">
          {onBack && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 text-base px-8"
              onClick={onBack}
            >
              Back
            </Button>
          )}
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="flex-1 h-12 text-base"
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
