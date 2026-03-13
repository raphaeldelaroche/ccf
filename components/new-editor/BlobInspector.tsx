"use client"

import { useMemo } from "react"
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import fieldSections, { type Field } from "@/lib/blob-fields"
import { evaluateShowIf } from "@/lib/new-editor/showif-evaluator"
import { computeCompatibility, type OptionState } from "@/lib/use-blob-compatibility"
import type { FormDataValue } from "@/types/editor"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"

// Maps blob-fields types to InspectorField types
const FIELD_TYPE_MAP: Partial<Record<string, "text" | "textarea" | "select" | "checkbox" | "icon">> = {
  text: "text",
  textarea: "textarea",
  dropdown: "select",
  checkbox: "checkbox",
  icon: "icon",
  image: "text",  // URL input
  video: "text",  // URL input
}

interface BlobInspectorProps {
  data: Record<string, unknown>
  onUpdate: (updates: Record<string, unknown>) => void
  /** Fields to skip — used when BlobInspector is delegated from IteratorInspector for shared props */
  hiddenFields?: string[]
}

export function BlobInspector({ data, onUpdate, hiddenFields = [] }: BlobInspectorProps) {
  const { user } = useUser()
  const compat = useMemo(
    () => computeCompatibility(data as Record<string, unknown>),
    [data]
  )

  const handleChange = (key: string, value: string | boolean) => {
    onUpdate({ [key]: value })
  }

  function renderField(fieldKey: string, fieldDef: Field, onChange: (v: string | boolean) => void) {
    const rawValue = data[fieldKey]

    // ── Repeater → RepeaterInspector ──────────────────────────────────────
    if (fieldDef.type === "repeater") {
      return (
        <RepeaterInspector
          key={fieldKey}
          label={fieldDef.label}
          value={(rawValue as string) || "[]"}
          fields={fieldDef.fields}
          onChange={(v) => onChange(v as string)}
          parentKey={fieldKey}
        />
      )
    }

    // ── innerBlocks → info message ─────────────────────────────────────────
    if (fieldDef.type === "innerBlocks") {
      return (
        <p key={fieldKey} className="text-xs text-muted-foreground italic">
          Les blocs imbriqués sont gérés directement dans le canvas via les contrôles de survol.
        </p>
      )
    }

    // ── Compat-aware fields ────────────────────────────────────────────────
    let compatOptions: OptionState[] | undefined
    let disabled: boolean | undefined
    let disabledReason: string | undefined

    if (fieldDef.compatKey) {
      const compatResult = compat[fieldDef.compatKey]
      const labelMap = fieldDef.type === "dropdown" ? (fieldDef.options ?? {}) : {}
      compatOptions = compatResult.options.map((o) => ({
        ...o,
        label: labelMap[o.value] ?? o.value,
      }))
      disabled = compatResult.field.disabled
      disabledReason = compatResult.field.reason
      if (fieldDef.emptyLabel) {
        compatOptions = [{ value: "", label: fieldDef.emptyLabel, disabled: false }, ...compatOptions]
      }
    }

    // ── Standard fields ────────────────────────────────────────────────────
    const inspectorType = FIELD_TYPE_MAP[fieldDef.type] ?? "text"

    let options: Record<string, string> | undefined
    if (!compatOptions && fieldDef.type === "dropdown") {
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
        compatOptions={compatOptions}
        iconOptions={fieldDef.type === "icon" ? fieldDef.options : undefined}
        disabled={disabled}
        disabledReason={disabledReason}
        onChange={onChange}
      />
    )
  }

  return (
    <div>
      {Object.entries(fieldSections).map(([sectionKey, section]) => {
        const visibleFields = Object.entries(section.fields).filter(([fieldKey, fieldDef]) => {
          if (hiddenFields.includes(fieldKey)) return false
          if (!evaluateShowIf(fieldDef.showIf, data as unknown as Record<string, FormDataValue>)) return false

          // Special handling for repeater fields (like buttons)
          // Repeaters handle their own field-level permissions internally
          if (fieldDef.type === "repeater") {
            // For editors, only show repeaters that have editable fields
            if (user.role === 'editor') {
              // Check if at least one field in the repeater is editable
              const hasEditableFields = Object.keys(fieldDef.fields).some(subFieldKey => {
                const subFieldDef = fieldDef.fields[subFieldKey]
                return canEditField(user.role, subFieldDef.type) ||
                       (fieldKey === 'buttons' && ['label', 'internalHref', 'externalHref'].includes(subFieldKey))
              })
              return hasEditableFields
            }
            // Engineers and reviewers see all repeaters
            return true
          }

          // Filter by role permissions - hide fields that the user cannot edit
          return canEditField(user.role, fieldDef.type)
        })

        if (visibleFields.length === 0) return null

        return (
          <CollapsibleSection
            key={sectionKey}
            title={section.label}
            defaultOpen={sectionKey === "header"}
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
