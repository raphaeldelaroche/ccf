"use client";

import { RadioGroup } from "@/components/ui/radio-group";
import { SelfAssessmentRadioOption } from "./self-assessment-radio-option";
import { SelfAssessmentSectorInlineSelector } from "./self-assessment-sector-inline-selector";
import type { Step } from "@/lib/self-assessment/self-assessment-data";

interface SelfAssessmentInputRendererProps {
  step: Step;
  answer?: string;
  onAnswerChange: (value: string) => void;
  onAutoNext?: () => void;
}

/**
 * Renders the appropriate input type for a self-assessment question
 * Handles both combobox (sector selection) and radio buttons
 */
export function SelfAssessmentInputRenderer({
  step,
  answer,
  onAnswerChange,
  onAutoNext,
}: SelfAssessmentInputRendererProps) {
  const handleChange = (value: string) => {
    onAnswerChange(value);
    // Auto-advance after a short delay for all input types
    if (onAutoNext) {
      setTimeout(() => {
        onAutoNext();
      }, 300);
    }
  };

  if (step.inputType === "combobox") {
    return (
      <SelfAssessmentSectorInlineSelector
        step={step}
        selectedValue={answer}
        onSelect={handleChange}
      />
    );
  }

  if (step.inputType === "radio-buttons") {
    return (
      <RadioGroup
        value={answer || ""}
        onValueChange={handleChange}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {step.options.map((option) => (
          <SelfAssessmentRadioOption
            key={option.id}
            option={option}
            isSelected={answer === option.id}
          />
        ))}
      </RadioGroup>
    );
  }

  return null;
}
