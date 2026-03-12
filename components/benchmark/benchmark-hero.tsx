import { Badge } from "@/components/ui/badge";

interface BenchmarkHeroProps {
  currentStep?: number;
  totalSteps?: number;
}

export function BenchmarkHero({ currentStep, totalSteps }: BenchmarkHeroProps) {
  return (
    <section className="bg-background border-b border-border py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <Badge variant="secondary" className="text-sm font-medium">
          {currentStep && totalSteps
            ? `Question ${currentStep} of ${totalSteps}`
            : "CCF Benchmark"}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Discover your climate impact potential
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          In just 3 questions, uncover what your company could contribute to the global climate effort — beyond emissions, including the solutions you enable and the finance you mobilise.
        </p>
      </div>
    </section>
  );
}
