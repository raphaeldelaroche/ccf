"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { SelfAssessmentRadioOption } from "./self-assessment-radio-option";
import type { Step } from "@/lib/self-assessment/self-assessment-data";

interface SelfAssessmentSectorInlineSelectorProps {
  step: Step;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function SelfAssessmentSectorInlineSelector({
  step,
  selectedValue,
  onSelect,
}: SelfAssessmentSectorInlineSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sector options based on search query
  const filteredSectorOptions = useMemo(() => {
    if (!step.options) return [];
    if (!searchQuery) return step.options;

    return step.options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [step.options, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Input
        type="search"
        placeholder="Search for a sector..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-12 text-base px-4 rounded-lg"
      />

      {/* Sector list */}
      {filteredSectorOptions.length > 0 ? (
        <RadioGroup
          value={selectedValue || ""}
          onValueChange={onSelect}
          className="grid grid-cols-2 gap-3"
        >
          {filteredSectorOptions.map((option) => (
            <SelfAssessmentRadioOption
              key={option.id}
              option={option}
              isSelected={selectedValue === option.id}
            />
          ))}
        </RadioGroup>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          No sector found
        </p>
      )}
    </div>
  );
}
