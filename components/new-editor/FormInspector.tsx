"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import type { FormDataValue } from "@/types/editor"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"

interface FormInspectorProps {
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

/**
 * FormInspector
 * Inspector pour le bloc Form (configuration Gravity Forms)
 */
export function FormInspector({ data, onUpdate }: FormInspectorProps) {
  const { user } = useUser()

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  // Check permissions for each field type
  const _canEditNumber = canEditField(user.role, 'number')
  const _canEditText = canEditField(user.role, 'textarea')
  const _canEditToggle = canEditField(user.role, 'toggle')

  return (
    <div>
      <CollapsibleSection title="Configuration" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="ID du formulaire"
            value={String(data.formId || 1)}
            type="text"
            onChange={(v) => {
              // Convert string to number
              const numValue = typeof v === 'string' ? parseInt(v, 10) : 1
              handleChange("formId", isNaN(numValue) ? 1 : numValue)
            }}
          />

          <InspectorField
            label="Message de succès"
            value={(data.successMessage as string) || ""}
            type="textarea"
            onChange={(v) => handleChange("successMessage", v)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Debug">
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Mode debug"
            value={(data.debug as boolean) || false}
            type="checkbox"
            onChange={(v) => handleChange("debug", v)}
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}
