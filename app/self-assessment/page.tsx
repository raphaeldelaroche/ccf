"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "@/lib/self-assessment/self-assessment-data";
import { getSectorData } from "@/lib/self-assessment/sector-data";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { Blob, BlobContent } from "@/components/blob/blob";
import { SelfAssessmentConfirmation } from "@/components/self-assessment/self-assessment-confirmation";
import { SelfAssessmentConfirmationNoData } from "@/components/self-assessment/self-assessment-confirmation-no-data";
import { SelfAssessmentIntro } from "@/components/self-assessment/self-assessment-intro";
import { SelfAssessmentProgressSteps } from "@/components/self-assessment/self-assessment-progress-steps";
import { SelfAssessmentQuestionCard } from "@/components/self-assessment/self-assessment-question-card";
import { SelfAssessmentEmailDialog } from "@/components/self-assessment/self-assessment-email-dialog";
import { SelfAssessmentInputRenderer } from "@/components/self-assessment/self-assessment-input-renderer";
import { SelfAssessmentPartnersSection } from "@/components/self-assessment/self-assessment-partners-section";
import { useSelfAssessmentForm } from "@/lib/self-assessment/use-self-assessment-form";
import { useSelfAssessmentSubmission } from "@/lib/self-assessment/use-self-assessment-submission";
import { Footer } from "@/components/layout/footer";

export default function SelfAssessmentPage() {
  const _router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    currentStep,
    setCurrentStep,
    answers,
    setAnswers,
    step,
    isLastStep,
    canProceed,
    handleBack,
  } = useSelfAssessmentForm(STEPS);

  const {
    showEmailDialog,
    setShowEmailDialog,
    submitted,
    isSubmitting,
    error,
    handleEmailSubmit,
  } = useSelfAssessmentSubmission();

  // Smooth scroll to align form top with header bottom when step changes
  useEffect(() => {
    if (currentStep > 0 && formRef.current) {
      const header = document.querySelector('header');
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const formTop = formRef.current.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: formTop - headerHeight,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  // Scroll to top when confirmation is shown
  useEffect(() => {
    if (submitted) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [submitted]);

  const handleNext = () => {
    if (!canProceed) return;

    if (isLastStep) {
      setShowEmailDialog(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleAutoNext = () => {
    // Don't auto-advance on last step (need to show dialog)
    if (isLastStep) {
      return;
    }
    // Direct navigation without checking canProceed since we just set the answer
    setCurrentStep((prev) => prev + 1);
  };

  // Get sector data to determine if warning should be shown
  const sectorId = answers["sector"];
  const sectorData = sectorId ? getSectorData(sectorId) : null;
  const showWarning = currentStep > 0 && sectorData && !sectorData.hasData;
  const warningMessage = showWarning ? sectorData.displayMessage : undefined;

  // Determine the correct next label for the last step
  const nextLabel = isLastStep && sectorData && !sectorData.hasData
    ? "Receive all information"
    : step.nextLabel;

  return (
    <>
      <PublicPageHeader />
      <main>
        <main className="flex-1">
          {submitted ? (
            (() => {
              // Get sector data to determine which confirmation to show
              const submittedSectorId = answers["sector"];
              const submittedSectorData = getSectorData(submittedSectorId);

              // If sector doesn't exist or has no data, show no-data confirmation
              if (!submittedSectorData?.hasData) {
                return submittedSectorData ? (
                  <SelfAssessmentConfirmationNoData sectorData={submittedSectorData} />
                ) : (
                  <SelfAssessmentConfirmation />
                );
              }

              // Otherwise show normal confirmation
              return <SelfAssessmentConfirmation />;
            })()
          ) : (
            <>
              <SelfAssessmentIntro
                stepNumber="01"
                eyebrow="Self-assessment"
                title="Evaluate your potential"
                emphasisText="your potential"
                subtitle="In just 3 questions, uncover what your company could contribute to addressing global climate change."
              />

              {/* Form */}
              <div ref={formRef}>
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
                  <BlobContent className="bg-white p-4">
                    <SelfAssessmentProgressSteps
                      totalSteps={STEPS.length}
                      currentStep={currentStep}
                    />

                    <SelfAssessmentQuestionCard
                      currentStep={currentStep}
                      totalSteps={STEPS.length}
                      title={step.title}
                      nextLabel={nextLabel}
                      canProceed={canProceed}
                      onNext={handleNext}
                      onBack={currentStep > 0 ? handleBack : undefined}
                      warningMessage={warningMessage}
                      isLastStep={isLastStep}
                    >
                      <SelfAssessmentInputRenderer
                        step={step}
                        answer={answers[step.id]}
                        onAnswerChange={(value) =>
                          setAnswers({ ...answers, [step.id]: value })
                        }
                        onAutoNext={handleAutoNext}
                      />
                    </SelfAssessmentQuestionCard>
                  </BlobContent>
                </Blob>
              </div>

              {/* Partners */}
              <SelfAssessmentPartnersSection />

              {/* Step 2 : Intro */}
              <SelfAssessmentIntro
                stepNumber="02"
                title="Discover your climate impact potential"
                subtitle="Fill the form below to discover your climate impact potential."
                style="disabled"
                emphasisText="impact potential"
              />
            </>
          )}

          <SelfAssessmentEmailDialog
            open={showEmailDialog}
            onOpenChange={setShowEmailDialog}
            onSubmit={(email) => handleEmailSubmit(email, answers)}
            hasData={sectorData?.hasData ?? true}
            isSubmitting={isSubmitting}
            error={error}
          />
        </main>
      </main>
      <Footer />
    </>
  );
}
