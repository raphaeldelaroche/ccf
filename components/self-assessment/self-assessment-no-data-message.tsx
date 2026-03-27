import { SelfAssessmentIntro } from "./self-assessment-intro";
import type { SectorData } from "@/lib/self-assessment/sector-data";

interface SelfAssessmentNoDataMessageProps {
  sectorData: SectorData;
}

export function SelfAssessmentNoDataMessage({
  sectorData,
}: SelfAssessmentNoDataMessageProps) {
  // Determine the appropriate message based on sector type
  const getMessage = () => {
    switch (sectorData.messageType) {
      case "financial":
        return "Dedicated methodology will be developed shortly for financial institutions. We'll keep you informed as we develop tailored metrics for your sector's unique contribution to the climate transition.";
      case "public-sector":
        return "We're currently developing a dedicated methodology for public sector and non-profit organizations. Contact us to learn how you can leverage the corporate framework in the meantime.";
      case "no-data":
      default:
        return "Your sector's contribution potential is currently being analyzed. We're working to capture your industry's true climate impact across all three pillars. We'll reach out soon with personalized insights.";
    }
  };

  return (
    <SelfAssessmentIntro
      stepNumber="✓"
      title="Thank you for your interest!"
      subtitle={getMessage()}
      emphasisText="Thank you"
      style="active"
    />
  );
}
