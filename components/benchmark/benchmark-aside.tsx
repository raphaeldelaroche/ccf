import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BenchmarkAsideProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  {
    number: 1,
    title: "Self-assessment",
    description: "Evaluate your contributive potential",
  },
  {
    number: 2,
    title: "Results",
    description: "Discover your climate profile",
  },
  {
    number: 3,
    title: "Take action",
    description: "Take action with the CCF",
  },
];

export function BenchmarkAside({ currentStep }: BenchmarkAsideProps) {
  return (
    <aside className="w-80 min-h-screen bg-muted/30 border-r border-border flex flex-col">
      <div className="sticky top-0 p-8 h-screen">
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-1">Climate Contribution Framework</h2>
          <p className="text-sm text-muted-foreground">CCF Benchmark</p>
        </div>

        <nav className="flex-1 space-y-8 flex flex-col justify-center">
          {STEPS.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isUpcoming = step.number > currentStep;

            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-5 top-12 w-0.5 h-8",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}

                {/* Step container */}
                <div className="flex gap-4 items-start">
                  {/* Number circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isCompleted && "bg-primary text-primary-foreground",
                      isUpcoming && "bg-background border-2 border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="pt-1">
                    <h3
                      className={cn(
                        "font-semibold mb-1 transition-colors",
                        isActive && "text-foreground",
                        isCompleted && "text-foreground",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm transition-colors",
                        isActive && "text-foreground/70",
                        isCompleted && "text-muted-foreground",
                        isUpcoming && "text-muted-foreground/60"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
