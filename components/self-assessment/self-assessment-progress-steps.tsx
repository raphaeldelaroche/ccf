import { cn } from "@/lib/utils";

interface SelfAssessmentProgressStepsProps {
  totalSteps: number;
  currentStep: number;
}

export function SelfAssessmentProgressSteps({ totalSteps, currentStep }: SelfAssessmentProgressStepsProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div
            key={index}
            className="theme-lime relative flex-1 h-2 rounded-full bg-gray-200 overflow-hidden"
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500 ease-out",
                isCompleted && "bg-primary w-full",
                isCurrent && "bg-primary animate-progress",
                isUpcoming && "bg-transparent w-0"
              )}
              style={
                isCurrent
                  ? {
                      animation: "progress-fill 0.6s ease-out forwards",
                    }
                  : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
