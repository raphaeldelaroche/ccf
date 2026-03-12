import { Button } from "@/components/ui/button";

interface ReportCTAProps {
  onAction: () => void;
}

export function ReportCTA({ onAction }: ReportCTAProps) {
  return (
    <section className="bg-muted py-16 sm:py-24 lg:py-48 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Discover your actual contribution
        </h2>
        <p className="text-base leading-relaxed">
          This benchmark reveals your potential. The CCF scorecard measures where you
          truly stand — and what your investors, your clients and your peers don‘t
          yet see in your climate actions.
        </p>
        <div className="pt-4">
          <Button
            size="lg"
            className="text-base h-14 px-8"
            onClick={onAction}
          >
            Request my full scorecard
          </Button>
        </div>
      </div>
    </section>
  );
}
