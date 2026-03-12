interface ReportExplanationProps {
  sector: string;
  beta: number;
}

export function ReportExplanation({ sector, beta }: ReportExplanationProps) {
  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed">
        <p>
          This score represents what your company could contribute at maximum to the
          global climate effort, given its sector. It is not an assessment of what
          you do today — it is the measure of what you could do.
        </p>
        <p>
          Most climate assessments are limited to your emissions. The CCF is the
          only framework that also integrates the solutions you develop and the
          climate finance you mobilise. For the {sector.toLowerCase()} sector, the
          Solutions pillar ({beta}%) reflects the industry's key role in deploying
          low-carbon mobility.
        </p>
        <p>
          This benchmark gives you your potential. The full scorecard measures your
          actual performance against that potential.
        </p>
      </div>
    </section>
  );
}
