"use client"

import { useMemo } from "react"
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import fieldSections, { type Field } from "@/lib/blob-fields"
import { evaluateShowIf } from "@/lib/new-editor/showif-evaluator"
import type { FormDataValue } from "@/types/editor"
import { computeCompatibility, type OptionState } from "@/lib/use-blob-compatibility"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"

// Mirror of BlobInspector's FIELD_TYPE_MAP
const FIELD_TYPE_MAP: Partial<Record<string, "text" | "textarea" | "select" | "checkbox" | "icon" | "multiselect">> = {
  text: "text",
  textarea: "textarea",
  dropdown: "select",
  checkbox: "checkbox",
  icon: "icon",
  image: "text",
  video: "text",
  multiselect: "multiselect",
}

interface ItemBlobInspectorProps {
  /** The individual item data (per-item overrides) */
  item: Record<string, FormDataValue>
  /** Shared block-level data (used for showIf context and compat) */
  sharedData: Record<string, FormDataValue>
  /** Which field keys are managed per-item (whitelist) */
  itemFields: string[]
  /** Called when a field value changes for this item */
  onUpdate: (field: string, value: FormDataValue) => void
}

/**
 * Renders the fields of a single iterator item using the exact same structure
 * as BlobInspector — same fieldSections order, same CollapsibleSection grouping,
 * same renderField logic (TableField for repeaters, InspectorField for everything else).
 *
 * showIf is evaluated against { ...sharedData, ...item } so that conditions that
 * depend on shared fields (e.g. markerType) work correctly even when the depending
 * field is per-item.
 */
export function ItemBlobInspector({ item, sharedData, itemFields, onUpdate }: ItemBlobInspectorProps) {
  const { user } = useUser()

  // Merged context for showIf evaluation and compat computation
  const mergedContext = useMemo(
    () => ({ ...sharedData, ...item }),
    [sharedData, item]
  )

  const compat = useMemo(
    () => computeCompatibility(mergedContext as Record<string, unknown>),
    [mergedContext]
  )

  function renderField(fieldKey: string, fieldDef: Field) {
    const rawValue = item[fieldKey]

    // ── Repeater → RepeaterInspector ──────────────────────────────────────
    if (fieldDef.type === "repeater") {
      return (
        <RepeaterInspector
          key={fieldKey}
          label={fieldDef.label}
          value={(rawValue as string) || "[]"}
          fields={fieldDef.fields}
          onChange={(v) => onUpdate(fieldKey, v)}
          parentKey={fieldKey}
        />
      )
    }

    // ── innerBlocks → info message ─────────────────────────────────────────
    if (fieldDef.type === "innerBlocks") {
      return (
        <div key={fieldKey} className="space-y-2">
          <p className="text-xs text-muted-foreground italic">
            Les blocs imbriqués de cet item sont gérés directement dans le canvas via les contrôles de survol.
          </p>
          <p className="text-xs text-muted-foreground">
            Nombre de blocs imbriqués : {Array.isArray(item.innerBlocks) ? item.innerBlocks.length : 0}
          </p>
        </div>
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
    if (!compatOptions && (fieldDef.type === "dropdown" || fieldDef.type === "multiselect")) {
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
        onChange={(v) => onUpdate(fieldKey, v)}
      />
    )
  }

  return (
    <div>
      {Object.entries(fieldSections).map(([sectionKey, section]) => {
          const visibleFields = Object.entries(section.fields).filter(([fieldKey, fieldDef]) => {
            // Only show fields that are managed per-item
            if (!itemFields.includes(fieldKey)) return false
            // Evaluate showIf in merged context
            if (!evaluateShowIf(fieldDef.showIf, mergedContext as unknown as Record<string, FormDataValue>)) return false
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
                  renderField(fieldKey, fieldDef)
                )}
              </div>
            </CollapsibleSection>
          )
        })}
    </div>
  )
}
