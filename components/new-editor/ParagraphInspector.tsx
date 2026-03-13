"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { getAppearanceOptions } from "@/config/blob-appearances"
import type { FormDataValue } from "@/types/editor"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"

interface ParagraphInspectorProps {
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

export function ParagraphInspector({ data, onUpdate }: ParagraphInspectorProps) {
  const { user } = useUser()

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  // Check permissions for each field
  const canEditAppearance = canEditField(user.role, 'select')

  return (
    <div>
      <CollapsibleSection title="Contenu" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Texte"
            value={(data.text as string) || ""}
            type="textarea"
            onChange={(v) => handleChange("text", v)}
          />
        </div>
      </CollapsibleSection>
      {canEditAppearance && (
        <CollapsibleSection title="Style">
          <div className="pt-3 space-y-3">
            <InspectorField
              label="Apparence"
              value={(data.appearance as string) || ""}
              type="select"
              options={{ "": "Aucune", ...getAppearanceOptions() }}
              onChange={(v) => handleChange("appearance", v)}
            />
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
