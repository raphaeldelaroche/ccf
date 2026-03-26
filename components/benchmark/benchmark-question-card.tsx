"use client";

import { Blob } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "../blob/eyebrow";
import { resolveAppearances } from "@/config/blob-appearances";
import { ArrowLeft } from "lucide-react";
import type { BlobConfig } from "@/lib/blob-compose";

interface BenchmarkQuestionCardProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  nextLabel: string;
  canProceed: boolean;
  onNext: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export function BenchmarkQuestionCard({
  currentStep,
  totalSteps,
  title,
  nextLabel,
  canProceed,
  onNext,
  onBack,
  children,
}: BenchmarkQuestionCardProps) {
  const appearanceConfig = resolveAppearances(["eyebrowAsBadge", "eyebrowBadgeOutline"]);

  const blobConfig: BlobConfig = {
    responsive: {
      base: {
        actions: "after",
        layout: "stack",
        size: "lg",
        align: "center",
        paddingX: "none",
        paddingY: "xl",
        gapY: "10xl",
      },
      md: {
        size: "2xl",
      }
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Blob {...blobConfig} className={appearanceConfig.blobClassName}>
        <Blob.Header className={appearanceConfig.headerClassName}>
          <Eyebrow>
            Step {currentStep + 1}/{totalSteps}
          </Eyebrow>
          <Title as="h2">{title}</Title>
        </Blob.Header>

        <Blob.Content className={appearanceConfig.contentClassName}>{children}</Blob.Content>

        <Blob.Actions layout="stack" className={`w-full ${appearanceConfig.actionsClassName || ''}`}>
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="w-full"
          >
            {nextLabel}
          </Button>
          
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
