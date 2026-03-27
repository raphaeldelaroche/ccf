"use client";

import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { SECTOR_ICONS } from "@/lib/self-assessment/self-assessment-icons";
import type { Option } from "@/lib/self-assessment/self-assessment-data";

interface SelfAssessmentRadioOptionProps {
  option: Option;
  isSelected: boolean;
}

/**
 * Unified radio button option component for self-assessment questions
 * Displays an icon (if provided) above the label text
 */
export function SelfAssessmentRadioOption({
  option,
  isSelected,
}: SelfAssessmentRadioOptionProps) {
  const IconComponent = option.icon ? SECTOR_ICONS[option.icon] : null;

  return (
    <Label
      key={option.id}
      className={cn(
        "flex flex-col items-center justify-center text-center cursor-pointer rounded-lg border p-4 md:px-6 md:py-8 text-sm md:text-base font-medium transition-all duration-300 ease-out hover:border-lime-500 hover:bg-lime-50",
        IconComponent ? "gap-3" : "gap-0",
        isSelected
          ? "border-lime-500 bg-lime-100"
          : "border-border"
      )}
    >
      <RadioGroupItem
        value={option.id}
        id={option.id}
        className="sr-only"
        tabIndex={-1}
      />
      {IconComponent && <IconComponent className="size-6 text-lime-500 shrink-0" />}
      <span>{option.label}</span>
    </Label>
  );
}
