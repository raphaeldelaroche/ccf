"use client";

import { useSearchParams } from "next/navigation";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { SelfAssessmentIntro } from "@/components/self-assessment/self-assessment-intro";
import { ScorecardRequestForm } from "@/components/self-assessment-report/scorecard-request-form";
import { Blob, BlobContent } from "@/components/blob/blob";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { FileChartPie } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { useState, useEffect, Suspense } from "react";

// IMPORTANT: Replace this with the actual form ID after creating the form in WordPress
// Run: http://climate-contribution-framework.local/create-scorecard-request-form.php
const FORM_ID = 6; // TODO: Update this with the actual form ID from Gravity Forms

function ScorecardRequestContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const entryId = searchParams.get("entry");

  const [initialValues, setInitialValues] = useState<{
    sector?: string;
    size?: string;
    geography?: string;
    email?: string;
  }>({});
  const [_isLoading, setIsLoading] = useState(false);

  // Fetch entry data if token or entry ID is provided
  useEffect(() => {
    if (token || entryId) {
      const url = token ? `/api/get-entry?token=${token}` : `/api/get-entry?id=${entryId}`;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (!data.error) {
            setInitialValues({
              sector: data.sector,
              size: data.size,
              geography: data.geography,
              email: data.email,
            });
          }
        } catch (err) {
          console.error('Failed to fetch entry:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [token, entryId]);

  return (
    <Blob
      responsive={{
        base: {
          layout: "stack",
          paddingX: "xs",
          paddingY: "none",
        },
        md: {
          paddingX: "container-2xl",
          paddingY: "none",
        },
      }}
      >
      <BlobBackground
        backgrounds={resolveBackgrounds([
          "solidGray",
          "plusCorners",
          "plusPattern",
          "lineBottom",
          "lineSide",
          "gradientfromtransparentToBlackToTransparent",
        ])}
      />
      <BlobContent className="bg-white">
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
              paddingY: "6xl",
              paddingX: "container-lg",
              gapY: "none",
            },
          }}
        >

        <BlobContent>
          <ScorecardRequestForm
            formId={FORM_ID}
            initialSector={initialValues.sector}
            initialSize={initialValues.size}
            initialGeography={initialValues.geography}
            initialEmail={initialValues.email}
          />
        </BlobContent>
      </Blob>
      </BlobContent>
    </Blob>
  );
}

export default function ScorecardRequestPage() {
  return (
    <>
      <PublicPageHeader />
      <SelfAssessmentIntro
        markerIcon={FileChartPie}
        stepNumber="03"
        eyebrow="Take action"
        title="Request your full scorecard"
        subtitle="A CCF expert will get back to you and guide you through your climate contribution journey."
        emphasisText="full scorecard"
        style="active"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <ScorecardRequestContent />
      </Suspense>

      <Blob
        responsive={{
          base: {
            layout: "stack",
            paddingX: "xs",
            paddingY: "none",
          },
          md: {
            paddingX: "container-2xl",
            paddingY: "6xl",
          },
        }}
        >
        <BlobBackground
          backgrounds={resolveBackgrounds([
            "plusCorners",
            "greenPhoto",
          ])}
        />
      </Blob>

      <Footer />
    </>
  );
}
