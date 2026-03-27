"use client";

import { PILLARS } from "@/lib/self-assessment/self-assessment-report-data";
import { getSectorData } from "@/lib/self-assessment/sector-data";
import { Info, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { SelfAssessmentIntro } from "@/components/self-assessment/self-assessment-intro";
import { ReportChartSection } from "@/components/self-assessment-report/report-chart-section";
import { ReportExplanation } from "@/components/self-assessment-report/report-explanation";
import { SectorNavigation } from "@/components/self-assessment-report/sector-navigation";
import { Blob, BlobContent } from "@/components/blob/blob";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { Marker } from "@/components/blob/marker";
import { Title } from "@/components/blob/title";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { createContext, useContext, useState, ReactNode, useEffect, Suspense } from "react";

// Context for highlighting dynamic data
const DynamicDataContext = createContext<{
  isHighlighted: boolean;
  toggleHighlight: () => void;
}>({
  isHighlighted: false,
  toggleHighlight: () => {},
});

export const useDynamicData = () => useContext(DynamicDataContext);

// Wrapper component for dynamic data
export function DynamicData({ children }: { children: ReactNode }) {
  const { isHighlighted } = useDynamicData();
  return (
    <span
      className={
        isHighlighted
          ? "bg-yellow-200 dark:bg-yellow-900/50 outline outline-2 outline-yellow-400 dark:outline-yellow-600 rounded px-1"
          : ""
      }
    >
      {children}
    </span>
  );
}

function SelfAssessmentReportContent() {
  const [isHighlighted, setIsHighlighted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ccf-highlight-dynamic');
      return saved === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHighlight = () => {
    setIsHighlighted(prev => {
      const newValue = !prev;
      localStorage.setItem('ccf-highlight-dynamic', String(newValue));
      return newValue;
    });
  };

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const entryId = searchParams.get("entry"); // Fallback for old links
  const sectorParam = searchParams.get("sector");

  const [sectorId, setSectorId] = useState<string | null>(sectorParam);
  const [_entryData, setEntryData] = useState<Record<string, unknown> | null>(null);

  // Fetch entry data if token or entry ID is provided
  useEffect(() => {
    if (token || entryId) {
      const url = token
        ? `/api/get-entry?token=${token}`
        : `/api/get-entry?id=${entryId}`;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setSectorId(data.sector);
            setEntryData(data);
          }
        } catch (err) {
          console.error('Failed to fetch entry:', err);
          setError('Failed to load report data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [token, entryId]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your report...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Report</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              href="/self-assessment"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              Take the self-assessment again
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Validation: check if sector parameter exists
  if (!sectorId) {
    return (
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Report Link</h1>
            <p className="text-muted-foreground mb-6">
              This report link is missing the required information. Please check your email for the correct link.
            </p>
            <Link
              href="/self-assessment"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              Take the self-assessment again
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Get sector data
  const sectorData = getSectorData(sectorId);

  // Validation: check if sector exists
  if (!sectorData) {
    return (
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sector Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The sector ”{sectorId}“ was not found in our database.
            </p>
            <Link
              href="/self-assessment"
              className="text-brand-600 hover:text-brand-700 underline"
            >
              Take the self-assessment again
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Validation: check if sector has data available
  if (!sectorData.hasData) {
    return (
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Report Not Yet Available</h1>
            <p className="text-muted-foreground mb-6">
              {sectorData.displayMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll reach out soon with personalized insights about your climate contribution potential.
            </p>
          </div>
        </div>
      </>
    );
  }

  // Build result object from sector data
  const result = {
    sector: sectorData.label,
    score: sectorData.sum,
    alpha: sectorData.alpha,
    beta: sectorData.beta,
    gamma: sectorData.gamma,
    contextMessage: sectorData.contextMessage,
  };

  return (
    <DynamicDataContext.Provider value={{ isHighlighted, toggleHighlight }}>
      <PublicPageHeader />

      {/* Floating Development Zone - Will be removed in production */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-3">
        <SectorNavigation currentSectorId={sectorId} />

        {/* Dynamic Data Highlighter Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleHighlight();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-yellow-400 rounded-lg shadow-lg hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors"
          title={isHighlighted ? "Hide dynamic data" : "Show dynamic data"}
        >
          {isHighlighted ? (
            <EyeOff className="size-5 text-yellow-600" />
          ) : (
            <Eye className="size-5 text-yellow-600" />
          )}
          <span className="text-sm font-medium">
            {isHighlighted ? "Hide" : "Show"} Dynamic
          </span>
        </button>
      </div>

      <div className="min-h-screen">
        <main className="flex-1">
          <SelfAssessmentIntro
            stepNumber="02"
            title="Your climate contribution potential"
            subtitle={<DynamicData>{result.contextMessage}</DynamicData>}
            eyebrow={<>Sector: <DynamicData>{result.sector}</DynamicData></>}
            emphasisText="climate contribution potential"
            style="active"
          />

          <Blob
            responsive={{
              base: {
                marker: "left",
                markerWidth: "default",
                layout: "stack",
                size: "md",
                align: "left",
                paddingX: "lg",
                paddingY: "lg",
              },
              md: {
                paddingX: "container-lg",
                paddingY: "xl",
              },
            }}
            className="overflow-hidden"
          >
            <BlobBackground backgrounds={resolveBackgrounds(["plusCorners", "lineSide", "lineBottom"])} />
            <Marker className="blob-size-xl" rounded variant={"ghost"}>
              <Info className="!size-10 text-lime-300" />
            </Marker>
            <Blob.Header>
              <Title>
                <div className="text-base">
                  This is your contributive potential, not your final scorecard. This
                score represents what your company could contribute at maximum — not
                what it does today. The full scorecard measures your actual performance.
                </div>
              </Title>
            </Blob.Header>
          </Blob>


          <Blob
            responsive={{
              base: {
                marker: "left",
                markerWidth: "default",
                layout: "stack",
                size: "md",
                align: "left",
                paddingX: "lg",
                paddingY: "lg",
              },
              md: {
                paddingX: "container-lg",
                paddingY: "xl",
              },
            }}
            className="overflow-hidden"
          >
            <BlobBackground backgrounds={resolveBackgrounds(["plusCorners", "lineSide", "lineBottom"])} />
            <Blob.Content>
              

            <ReportChartSection
              score={result.score}
              pillars={PILLARS}
              pillarValues={{
                alpha: result.alpha,
                beta: result.beta,
                gamma: result.gamma,
              }}
              highlightDynamic={isHighlighted}
            />

            </Blob.Content>
          </Blob>

        <Blob
        
          responsive={{
            base: {
              marker: "left",
              markerWidth: "default",
              layout: "stack",
              size: "md",
              align: "left",
              paddingX: "lg",
              paddingY: "lg",
            },
            md: {
              paddingX: "container-lg",
              paddingY: "xl",
            },
          }}
        >
          <BlobBackground backgrounds={resolveBackgrounds(["plusCorners", "lineSide", "lineBottom"])} />
          <BlobContent>
            <ReportExplanation
              sector={result.sector}
              beta={result.beta}
              contextMessage={result.contextMessage}
              highlightDynamic={isHighlighted}
            />
          </BlobContent>
        </Blob>


        {/* <NetZeroCTA /> */}

        <SelfAssessmentIntro
          stepNumber="03"
          title="Discover your actual contribution"
          emphasisText="actual contribution"
          subtitle="This self-assessment reveals your potential. The CCF scorecard measures where you truly stand — and what your investors, your clients and your peers don't yet see in your climate actions."
          style="active"
          buttonLabel="Request my full scorecard"
          buttonHref={token ? `/scorecard-request?token=${token}` : (entryId ? `/scorecard-request?entry=${entryId}` : "/scorecard-request")}
          buttonTheme="brand"
          appearance={["headerWidthTwoThirds", "actionsOffsetMarker"]}
          background={["lineSide", "plusCorners", "timelineVerticalLineX"]}
        />
        </main>
      </div>
      <Footer />
    </DynamicDataContext.Provider>
  );
}

export default function SelfAssessmentReportPage() {
  return (
    <Suspense fallback={
      <>
        <PublicPageHeader />
        <div className="flex items-center justify-center p-8 min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your report...</p>
          </div>
        </div>
      </>
    }>
      <SelfAssessmentReportContent />
    </Suspense>
  );
}
