"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import { buttonTooltipFields } from "@/lib/button-tooltip-fields"
import type { Field } from "@/lib/blob-fields"
import type { FormDataValue } from "@/types/editor"

// Maps blob-fields types to InspectorField types
const FIELD_TYPE_MAP: Partial<Record<string, "text" | "textarea" | "select" | "checkbox">> = {
  text: "text",
  textarea: "textarea",
  dropdown: "select",
  checkbox: "checkbox",
}

interface ButtonTooltipInspectorProps {
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

export function ButtonTooltipInspector({ data, onUpdate }: ButtonTooltipInspectorProps) {
  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  function renderField(fieldKey: string, fieldDef: Field, onChange: (v: FormDataValue) => void) {
    const rawValue = data[fieldKey]

    // ── Repeater → RepeaterInspector ──────────────────────────────────────
    if (fieldDef.type === "repeater") {
      return (
        <RepeaterInspector
          key={fieldKey}
          label={fieldDef.label}
          value={(rawValue as string) || "[]"}
          fields={fieldDef.fields}
          onChange={(v) => onChange(v)}
        />
      )
    }

    // ── Standard fields ────────────────────────────────────────────────────
    const inspectorType = FIELD_TYPE_MAP[fieldDef.type] ?? "text"

    let options: Record<string, string> | undefined
    if (fieldDef.type === "dropdown") {
      options = fieldDef.emptyLabel
        ? { "": fieldDef.emptyLabel, ...fieldDef.options }
        : fieldDef.options
    }

    const value = rawValue !== undefined ? rawValue : fieldDef.type === "checkbox" ? false : ""

    return (
      <InspectorField
        key={fieldKey}
        label={fieldDef.label}
        value={value as string | boolean}
        type={inspectorType}
        options={options}
        onChange={onChange}
      />
    )
  }

  return (
    <div>
      {Object.entries(buttonTooltipFields).map(([sectionKey, section]) => {
        const visibleFields = Object.entries(section.fields)

        if (visibleFields.length === 0) return null

        return (
          <CollapsibleSection
            key={sectionKey}
            title={section.label}
            defaultOpen={sectionKey === "tooltips"}
          >
            <div className="pt-3 space-y-3">
              {visibleFields.map(([fieldKey, fieldDef]) =>
                renderField(fieldKey, fieldDef, (v) => handleChange(fieldKey, v))
              )}
            </div>
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
