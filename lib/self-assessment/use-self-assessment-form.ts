"use client";

import { useState } from "react";
import type { Step } from "./self-assessment-data";

/**
 * Custom hook for managing self-assessment form state and navigation
 * Handles multi-step form progression, answers storage, and validation
 */
export function useSelfAssessmentForm(steps: Step[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = Boolean(answers[step.id]);

  const handleNext = () => {
    if (!canProceed) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  return {
    currentStep,
    setCurrentStep,
    answers,
    setAnswers,
    step,
    isLastStep,
    canProceed,
    handleNext,
    handleBack,
  };
}
