"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import type { FormDataValue } from "@/types/editor"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"

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
  const { user } = useUser()

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  // Check permissions for each field
  const canEditOrientation = canEditField(user.role, 'select')
  const canEditLabel = canEditField(user.role, 'text')
  const canEditSpacingBefore = canEditField(user.role, 'select')
  const canEditSpacingAfter = canEditField(user.role, 'select')

  // Determine if sections should be visible
  const hasVisibleOptionsFields = canEditOrientation || canEditLabel
  const hasVisibleSpacingFields = canEditSpacingBefore || canEditSpacingAfter

  return (
    <div>
      {hasVisibleOptionsFields && (
        <CollapsibleSection title="Options" defaultOpen={true}>
          <div className="pt-3 space-y-3">
            {canEditOrientation && (
              <InspectorField
                label="Orientation"
                value={(data.orientation as string) || "horizontal"}
                type="select"
                options={{ horizontal: "Horizontale", vertical: "Verticale" }}
                onChange={(v) => handleChange("orientation", v)}
              />
            )}
            {canEditLabel && (
              <InspectorField
                label="Label (optionnel)"
                value={(data.label as string) || ""}
                type="text"
                onChange={(v) => handleChange("label", v)}
              />
            )}
          </div>
        </CollapsibleSection>
      )}
      {hasVisibleSpacingFields && (
        <CollapsibleSection title="Espacement">
          <div className="pt-3 space-y-3">
            {canEditSpacingBefore && (
              <InspectorField
                label="Avant"
                value={(data.spacingBefore as string) || "auto"}
                type="select"
                options={spacingOptions}
                onChange={(v) => handleChange("spacingBefore", v)}
              />
            )}
            {canEditSpacingAfter && (
              <InspectorField
                label="Après"
                value={(data.spacingAfter as string) || "auto"}
                type="select"
                options={spacingOptions}
                onChange={(v) => handleChange("spacingAfter", v)}
              />
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
