import { Badge } from "@/components/ui/badge";

export function ReportRequestHero() {
  return (
    <section className="bg-background border-b border-border py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <Badge variant="secondary" className="text-sm font-medium">
          Step 3 of 3
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Request your full scorecard
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          A CCF expert will get back to you and guide you through your climate contribution journey.
        </p>
      </div>
    </section>
  );
}
