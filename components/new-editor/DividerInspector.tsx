"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import type { FormDataValue } from "@/types/editor"

interface DividerInspectorProps {
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

const spacingOptions = {
  auto: "Auto",
  none: "Aucun (0)",
  xs: "XS",
  sm: "SM",
  md: "MD",
  lg: "LG",
  xl: "XL",
  "2xl": "2XL",
  "3xl": "3XL",
}

export function DividerInspector({ data, onUpdate }: DividerInspectorProps) {
  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  return (
    <div>
      <CollapsibleSection title="Options" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Orientation"
            value={(data.orientation as string) || "horizontal"}
            type="select"
            options={{ horizontal: "Horizontale", vertical: "Verticale" }}
            onChange={(v) => handleChange("orientation", v)}
          />
          <InspectorField
            label="Label (optionnel)"
            value={(data.label as string) || ""}
            type="text"
            onChange={(v) => handleChange("label", v)}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Espacement">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Avant"
            value={(data.spacingBefore as string) || "auto"}
            type="select"
            options={spacingOptions}
            onChange={(v) => handleChange("spacingBefore", v)}
          />
          <InspectorField
            label="Après"
            value={(data.spacingAfter as string) || "auto"}
            type="select"
            options={spacingOptions}
            onChange={(v) => handleChange("spacingAfter", v)}
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}
