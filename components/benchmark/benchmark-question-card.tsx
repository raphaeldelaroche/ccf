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
    <div className="w-full max-w-3xl space-y-10">
      <div className="space-y-8">
        <div
          className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2"
          style={{ animationDuration: "500ms" }}
        >
          <Badge variant="outline" className="text-sm font-medium">
            Step {currentStep + 1} / {totalSteps}
          </Badge>
          <div className="text-2xl sm:text-3xl font-semibold leading-tight">
            {title}
          </div>
        </div>

        <div
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-3"
          style={{ animationDuration: "600ms", animationDelay: "100ms" }}
        >
          {children}
        </div>

        <div
          className="flex gap-3 pt-2 animate-in fade-in-0 slide-in-from-bottom-2"
          style={{ animationDuration: "500ms", animationDelay: "200ms" }}
        >
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
