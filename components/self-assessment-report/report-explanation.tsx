interface ReportExplanationProps {
  sector: string;
  beta: number;
  contextMessage: string;
  highlightDynamic?: boolean;
}

// Simple inline wrapper for highlighting
function _DynamicHighlight({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  if (!highlight) return <>{children}</>;
  return (
    <span className="bg-yellow-200 dark:bg-yellow-900/50 outline outline-2 outline-yellow-400 dark:outline-yellow-600 rounded px-1">
      {children}
    </span>
  );
}

export function ReportExplanation({ sector: _sector, beta: _beta, contextMessage: _contextMessage, highlightDynamic: _highlightDynamic = false }: ReportExplanationProps) {
  return (
    <div className="space-y-6 text-base leading-relaxed">
      <p>
        This score represents what your company could contribute at maximum to the
        global climate effort, given its sector. It is not an assessment of what
        you do today — it is the measure of what you could do.
      </p>
      <p>
        Most corporate climate leadership assessments only evaluate inventory GHG emissions. The CCF is the only framework that also integrates the GHG reducing solutions you develop and the climate finance you mobilise. 
        {/* For the <DynamicHighlight highlight={highlightDynamic}>{sector.toLowerCase()}</DynamicHighlight> sector, the Solutions pillar (<DynamicHighlight highlight={highlightDynamic}>{beta}%</DynamicHighlight>) reflects this sector&apos;s unique contribution potential.{" "} */}
        {/* <DynamicHighlight highlight={highlightDynamic}>{contextMessage}</DynamicHighlight> */}
      </p>
      <p>
        This self-assessment gives you your potential. The full scorecard measures your
        actual performance against that potential.
      </p>
    </div>
  );
}
