import { cn } from "@/lib/utils";

interface BenchmarkProgressStepsProps {
  totalSteps: number;
  currentStep: number;
}

export function BenchmarkProgressSteps({ totalSteps, currentStep }: BenchmarkProgressStepsProps) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-3 flex-1 rounded-full transition-all duration-300",
            index <= currentStep ? "bg-foreground" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}
