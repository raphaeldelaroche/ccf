"use client"

import { useMemo, useState } from "react"
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import { BreakpointTabs } from "./BreakpointTabs"
import fieldSections, { type Field, type IconData } from "@/lib/blob-fields"
import { evaluateShowIf } from "@/lib/new-editor/showif-evaluator"
import { computeCompatibility, type OptionState } from "@/lib/use-blob-compatibility"
import type { FormDataValue } from "@/types/editor"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"
import {
  type Breakpoint,
  type ResponsiveProps,
  getBreakpointsWithOverrides
} from "@/lib/responsive-utils"
import type { ResponsiveBreakpointProps } from "@/lib/blob-compose"

// Maps blob-fields types to InspectorField types
const FIELD_TYPE_MAP: Partial<Record<string, "text" | "textarea" | "select" | "checkbox" | "icon" | "multiselect" | "file">> = {
  text: "text",
  textarea: "textarea",
  dropdown: "select",
  checkbox: "checkbox",
  icon: "icon",
  image: "file",  // File input
  video: "text",  // URL input
  multiselect: "multiselect",
}

interface BlobInspectorProps {
  data: Record<string, unknown>
  onUpdate: (updates: Record<string, unknown>) => void
  /** Fields to skip — used when BlobInspector is delegated from IteratorInspector for shared props */
  hiddenFields?: string[]
  /** External active breakpoint (when delegated from parent like IteratorInspector) */
  externalActiveBreakpoint?: Breakpoint
  /** Hide the BreakpointTabs (when delegated from parent that already shows them) */
  hideBreakpointTabs?: boolean
}

export function BlobInspector({
  data,
  onUpdate,
  hiddenFields = [],
  externalActiveBreakpoint,
  hideBreakpointTabs = false
}: BlobInspectorProps) {
  const { user } = useUser()
  const [internalActiveBreakpoint, setInternalActiveBreakpoint] = useState<Breakpoint>("base")
  const [copiedBreakpointValues, setCopiedBreakpointValues] = useState<ResponsiveBreakpointProps | null>(null)

  // Use external breakpoint if provided, otherwise use internal state
  const activeBreakpoint = externalActiveBreakpoint || internalActiveBreakpoint

  const responsiveData = useMemo(
    () => (data.responsive as ResponsiveProps) || {},
    [data.responsive]
  )
  const overrides = useMemo(() => getBreakpointsWithOverrides(responsiveData), [responsiveData])

  const compat = useMemo(
    () => computeCompatibility(data as Record<string, unknown>),
    [data]
  )

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  const handleResponsiveChange = (key: string, value: FormDataValue) => {
    // CRITICAL: Use data.responsive directly instead of responsiveData memo
    // to avoid stale closure when multiple fields update rapidly
    const currentResponsive = (data.responsive as ResponsiveProps) || {}

    // Deep copy: copy the top-level responsive object AND the current breakpoint object
    const newResponsive = { ...currentResponsive }

    // Create a defensive copy of the current breakpoint's data to prevent reference issues
    const currentBreakpointData = { ...(newResponsive[activeBreakpoint] || {}) }

    // If value is empty/undefined, remove it from the breakpoint
    if (value === "" || value === undefined || value === null) {
      delete currentBreakpointData[key as keyof typeof currentBreakpointData]

      // If breakpoint is now empty, remove it entirely (except base)
      if (Object.keys(currentBreakpointData).length === 0 && activeBreakpoint !== "base") {
        delete newResponsive[activeBreakpoint]
      } else {
        newResponsive[activeBreakpoint] = currentBreakpointData
      }
    } else {
      // Merge the new value into the copied breakpoint data
      newResponsive[activeBreakpoint] = {
        ...currentBreakpointData,
        [key]: value
      }
    }

    onUpdate({ responsive: newResponsive })
  }

  const handleResetBreakpoint = (breakpoint: Breakpoint) => {
    if (breakpoint === "base") return

    // Use data.responsive directly to avoid stale closure
    const currentResponsive = (data.responsive as ResponsiveProps) || {}
    const newResponsive = { ...currentResponsive }
    delete newResponsive[breakpoint]
    onUpdate({ responsive: newResponsive })
  }

  const handleCopyBreakpoint = (breakpoint: Breakpoint) => {
    // Use data.responsive directly to avoid stale closure
    const currentResponsive = (data.responsive as ResponsiveProps) || {}
    const breakpointData = currentResponsive[breakpoint] || {}
    setCopiedBreakpointValues(breakpointData)
  }

  const handlePasteBreakpoint = (breakpoint: Breakpoint) => {
    if (!copiedBreakpointValues) return

    // Use data.responsive directly to avoid stale closure
    const currentResponsive = (data.responsive as ResponsiveProps) || {}
    const newResponsive = { ...currentResponsive }
    newResponsive[breakpoint] = { ...copiedBreakpointValues }
    onUpdate({ responsive: newResponsive })
  }

  const handleResetField = (fieldKey: string) => {
    // Use data.responsive directly to avoid stale closure
    const currentResponsive = (data.responsive as ResponsiveProps) || {}
    const newResponsive = { ...currentResponsive }

    if (activeBreakpoint === "base") {
      // For base: remove the field to clear it
      if (!newResponsive.base) return // Nothing to reset

      const breakpointData = { ...newResponsive.base }
      delete breakpointData[fieldKey as keyof typeof breakpointData]

      if (Object.keys(breakpointData).length === 0) {
        delete newResponsive.base
      } else {
        newResponsive.base = breakpointData
      }
    } else {
      // For other breakpoints: remove the override to restore inheritance
      const breakpointData = { ...(newResponsive[activeBreakpoint] || {}) }
      delete breakpointData[fieldKey as keyof typeof breakpointData]

      if (Object.keys(breakpointData).length === 0) {
        delete newResponsive[activeBreakpoint]
      } else {
        newResponsive[activeBreakpoint] = breakpointData
      }
    }

    onUpdate({ responsive: newResponsive })
  }

  const handleResetNonResponsiveField = (fieldKey: string) => {
    // For non-responsive fields, determine the appropriate empty value based on type
    const fieldDef = Object.values(fieldSections)
      .flatMap(section => Object.entries(section.fields))
      .find(([key]) => key === fieldKey)?.[1]

    if (!fieldDef) return

    let emptyValue: FormDataValue
    if (fieldDef.type === "checkbox") {
      emptyValue = false
    } else if (fieldDef.type === "multiselect" || fieldDef.type === "repeater") {
      emptyValue = []
    } else if (fieldDef.type === "icon" || fieldDef.type === "image") {
      emptyValue = null
    } else {
      emptyValue = ""
    }

    onUpdate({ [fieldKey]: emptyValue })
  }

  function renderField(fieldKey: string, fieldDef: Field, onChange: (v: FormDataValue) => void) {
    // Check if field is responsive
    const isResponsive = "responsive" in fieldDef && fieldDef.responsive === true

    // For responsive fields on non-base tabs, or non-responsive fields on non-base tabs, handle appropriately
    if (activeBreakpoint !== "base") {
      if (!isResponsive) {
        // Non-responsive fields don't appear on non-base tabs
        return null
      }
    }

    // Get the value
    // For responsive fields: InspectorField will handle breakpoint resolution itself using responsiveValues prop
    // So we just pass a default value here
    // For non-responsive fields: get the value directly from data
    const rawValue = isResponsive
      ? (fieldDef.type === "checkbox" ? false : "")  // Default value, will be overridden by InspectorField
      : data[fieldKey]

    // ── Repeater → RepeaterInspector ──────────────────────────────────────
    if (fieldDef.type === "repeater") {
      return (
        <RepeaterInspector
          key={fieldKey}
          label={fieldDef.label}
          value={(rawValue as string) || "[]"}
          fields={fieldDef.fields}
          onChange={(v) => onChange(v)}
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
    if (!compatOptions && (fieldDef.type === "dropdown" || fieldDef.type === "multiselect")) {
      options = fieldDef.type === "dropdown" && fieldDef.emptyLabel
        ? { "": fieldDef.emptyLabel, ...fieldDef.options }
        : fieldDef.options
    }

    const value = rawValue !== undefined
      ? rawValue
      : fieldDef.type === "checkbox"
        ? false
        : fieldDef.type === "multiselect"
          ? []
          : fieldDef.type === "icon"
            ? null
            : ""

    return (
      <InspectorField
        key={fieldKey}
        label={fieldDef.label}
        value={value as string | boolean | string[] | IconData | null}
        type={inspectorType}
        options={options}
        compatOptions={compatOptions}
        iconOptions={fieldDef.type === "icon" ? fieldDef.options : undefined}
        disabled={disabled}
        disabledReason={disabledReason}
        onChange={onChange}
        currentBreakpoint={isResponsive && canSeeResponsive ? activeBreakpoint : undefined}
        responsiveValues={isResponsive && canSeeResponsive ? responsiveData : undefined}
        fieldKey={isResponsive && canSeeResponsive ? (fieldDef.compatKey || fieldKey) : undefined}
        onReset={
          isResponsive && canSeeResponsive
            ? () => handleResetField(fieldDef.compatKey || fieldKey)
            : !isResponsive && activeBreakpoint === "base"
            ? () => handleResetNonResponsiveField(fieldKey)
            : undefined
        }
      />
    )
  }

  // Only show BreakpointTabs for engineers and reviewers
  const canSeeResponsive = user.role === 'engineer' || user.role === 'reviewer'

  return (
    <div>
      {canSeeResponsive && !hideBreakpointTabs && (
        <BreakpointTabs
          activeTab={activeBreakpoint}
          onTabChange={setInternalActiveBreakpoint}
          overrides={overrides}
          onResetBreakpoint={handleResetBreakpoint}
          onCopyBreakpoint={handleCopyBreakpoint}
          onPasteBreakpoint={handlePasteBreakpoint}
          hasCopiedValues={copiedBreakpointValues !== null}
        />
      )}

      {Object.entries(fieldSections).map(([sectionKey, section]) => {
        const visibleFields = Object.entries(section.fields).filter(([fieldKey, fieldDef]) => {
          if (hiddenFields.includes(fieldKey)) return false
          if (!evaluateShowIf(fieldDef.showIf, data as unknown as Record<string, FormDataValue>)) return false

          // On non-base tabs, only show responsive fields
          const isResponsive = "responsive" in fieldDef && fieldDef.responsive === true
          if (canSeeResponsive && activeBreakpoint !== "base" && !isResponsive) {
            return false
          }

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
              {visibleFields.map(([fieldKey, fieldDef]) => {
                const isResponsive = "responsive" in fieldDef && fieldDef.responsive === true
                const onChange = isResponsive ? handleResponsiveChange : handleChange
                const responsiveKey = isResponsive && 'compatKey' in fieldDef && fieldDef.compatKey ? fieldDef.compatKey : fieldKey
                return renderField(fieldKey, fieldDef, (v: FormDataValue) => onChange(responsiveKey, v))
              })}
            </div>
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
