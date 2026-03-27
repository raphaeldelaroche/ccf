"use client";

import { Blob } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "../blob/eyebrow";
import { resolveAppearances } from "@/config/blob-appearances";
import { ArrowLeft, Info } from "lucide-react";
import type { BlobConfig } from "@/lib/blob-compose";

interface SelfAssessmentQuestionCardProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  nextLabel: string;
  canProceed: boolean;
  onNext: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  warningMessage?: string;
  isLastStep?: boolean;
}

export function SelfAssessmentQuestionCard({
  currentStep,
  totalSteps,
  title,
  nextLabel,
  canProceed,
  onNext,
  onBack,
  children,
  warningMessage,
  isLastStep = false,
}: SelfAssessmentQuestionCardProps) {
  const appearanceConfig = resolveAppearances(["eyebrowAsBadge", "eyebrowBadgeOutline", "largePaddingBottom"]);

  const blobConfig: BlobConfig = {
    responsive: {
      base: {
        actions: "after",
        layout: "stack",
        size: "md",
        align: "left",
        paddingX: "none",
        paddingY: "lg",
        gapY: "xl",
      },
      md: {
        size: "2xl",
        gapY: "4xl",
        paddingY: "3xl",
      }
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto xl:py-8">
      <Blob {...blobConfig} className={appearanceConfig.blobClassName}>
        <Blob.Header className={appearanceConfig.headerClassName}>
          <Eyebrow>
            Question {currentStep + 1}/{totalSteps}
          </Eyebrow>
          <Title as="h2">{title}</Title>
        </Blob.Header>

        <Blob.Content key={currentStep} className={`${appearanceConfig.contentClassName} animate-in fade-in duration-300`}>{children}</Blob.Content>

        <Blob.Actions layout="stack" className={`w-full ${appearanceConfig.actionsClassName || ''}`}>
          {warningMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-lime-200 bg-lime-50 p-4 text-sm text-lime-900 dark:border-lime-900/30 dark:bg-lime-950/20 dark:text-lime-100">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{warningMessage}</p>
            </div>
          )}

          {isLastStep && canProceed && (
            <Button
              onClick={onNext}
              size="lg"
              className="w-full min-h-12"
            >
              {nextLabel}
            </Button>
          )}

          {onBack && (
            <Button
              variant="link"
              size="lg"
              onClick={onBack}
            >
              <ArrowLeft />
              Back
            </Button>
          )}
        </Blob.Actions>
      </Blob>
    </div>
  );
}
