"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import { InspectorField } from "./InspectorField"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GripVertical, Plus, Copy, Trash2 } from "lucide-react"
import { evaluateShowIf } from "@/lib/new-editor/showif-evaluator"
import type { Field, IconData } from "@/lib/blob-fields"
import type { FormDataValue } from "@/types/editor"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/auth/UserContext"
import { canEditRepeaterField } from "@/lib/auth/field-permissions"

// Mirror of BlobInspector / ItemBlobInspector FIELD_TYPE_MAP (no compat, no sections)
const FIELD_TYPE_MAP: Partial<Record<string, "text" | "textarea" | "select" | "checkbox" | "icon">> = {
  text: "text",
  textarea: "textarea",
  dropdown: "select",
  checkbox: "checkbox",
  icon: "icon",
  image: "text",
  video: "text",
}

export type RepeaterRow = Record<string, string>

interface RepeaterInspectorProps {
  /** Label shown above the row triggers — same style as other InspectorField labels */
  label: string
  /** JSON string — array of row objects */
  value: string
  /**
   * Sub-field definitions from a blob-fields RepeaterField.fields.
   * Used for default row building and inline field rendering.
   * Pass `{}` when providing `renderContent` and `buildNewRow`.
   */
  fields: Record<string, Field>
  onChange: (value: string) => void
  /** Override the row label. Defaults to first non-empty text field, or "Élément N". */
  getLabel?: (row: RepeaterRow, index: number) => string
  /** Override how a new row is created. Defaults to building from `fields`. */
  buildNewRow?: () => RepeaterRow
  /**
   * Override the popover content for a row.
   * Receives the row, its index, and an `update(key, value)` callback.
   * Defaults to a flat list of InspectorField inputs.
   */
  renderContent?: (
    row: RepeaterRow,
    index: number,
    update: (key: string, value: string | boolean) => void
  ) => ReactNode
  /** Width class for the popover (default: "w-72") */
  popoverWidth?: string
  /** Text shown when there are no rows */
  emptyMessage?: string
  /** Parent field key for permission checking (e.g., "buttons") */
  parentKey?: string
}

function parseRows(json: string): RepeaterRow[] {
  try {
    const parsed = JSON.parse(json || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function buildDefaultRow(fields: Record<string, Field>): RepeaterRow {
  const row: RepeaterRow = {}
  for (const [key, field] of Object.entries(fields)) {
    if (field.type === "checkbox") row[key] = "false"
    else if (field.type === "icon") row[key] = "null"
    else if (field.type === "dropdown") row[key] = Object.keys(field.options)[0] ?? ""
    else row[key] = ""
  }
  return row
}

function defaultGetLabel(row: RepeaterRow, index: number, fields: Record<string, Field>): string {
  for (const [key, field] of Object.entries(fields)) {
    if (field.type === "text" || field.type === "textarea") {
      const val = row[key]?.trim()
      if (val) return val
    }
  }
  return `Élément ${index + 1}`
}

/**
 * Generic repeater field.
 *
 * Label + one trigger button per row + "Ajouter" button at the bottom.
 * All buttons share the same `variant="outline" size="sm"` style.
 * Label uses the exact same `<Label>` component and classes as InspectorField.
 *
 * Used by BlobInspector / ItemBlobInspector for any `type: "repeater"` field,
 * AND by IteratorInspector for the "Items" section — same code path, different
 * `renderContent` / `getLabel` / `buildNewRow`.
 */
export function RepeaterInspector({
  label,
  value,
  fields,
  onChange,
  getLabel,
  buildNewRow,
  renderContent,
  popoverWidth = "w-72",
  emptyMessage,
  parentKey,
}: RepeaterInspectorProps) {
  const { user } = useUser()
  const [rows, setRows] = useState<RepeaterRow[]>(() => parseRows(value))
  const [dragOver, setDragOver] = useState<number | null>(null)
  const dragIndex = useRef<number | null>(null)

  useEffect(() => {
    const next = parseRows(value)
    if (JSON.stringify(next) !== JSON.stringify(rows)) setRows(next)
    // rows intentionally excluded — react only to external (prop) changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commit = useCallback(
    (next: RepeaterRow[]) => { setRows(next); onChange(JSON.stringify(next)) },
    [onChange]
  )

  const addRow = () => commit([...rows, buildNewRow ? buildNewRow() : buildDefaultRow(fields)])
  const removeRow = (i: number) => commit(rows.filter((_, idx) => idx !== i))
  const duplicateRow = (i: number) => {
    const next = [...rows]
    // Deep clone + régénération récursive de tous les IDs (innerBlocks imbriqués inclus)
    const deepCloneWithNewIds = (obj: unknown): unknown => {
      if (Array.isArray(obj)) return obj.map(deepCloneWithNewIds)
      if (obj !== null && typeof obj === "object") {
        const cloned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          cloned[k] = deepCloneWithNewIds(v)
        }
        if (typeof cloned.id === "string") {
          cloned.id = `${cloned.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        }
        return cloned
      }
      return obj
    }
    next.splice(i + 1, 0, deepCloneWithNewIds(rows[i]) as RepeaterRow)
    commit(next)
  }
  const updateRow = (i: number, key: string, v: FormDataValue) => {
    // Serialize value based on type
    const serializedValue = Array.isArray(v)
      ? JSON.stringify(v)
      : typeof v === "object" && v !== null && 'iconObject' in v  // IconData check
      ? JSON.stringify(v)
      : typeof v === "object" && v !== null
      ? JSON.stringify(v)
      : String(v)

    commit(rows.map((r, idx) => (idx === i ? { ...r, [key]: serializedValue } : r)))
  }

  const handleDragStart = (i: number) => { dragIndex.current = i }
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIndex.current !== null && dragIndex.current !== i) setDragOver(i)
  }
  const handleDrop = (i: number) => {
    const from = dragIndex.current
    if (from === null || from === i) { setDragOver(null); return }
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(i, 0, moved)
    commit(next)
    dragIndex.current = null
    setDragOver(null)
  }
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null) }

  const resolveLabel = (row: RepeaterRow, i: number) =>
    getLabel ? getLabel(row, i) : defaultGetLabel(row, i, fields)

  return (
    <div className="space-y-1">
      {/* Label — exact same component & classes as InspectorField */}
      <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
        {label}
      </Label>

      {/* One trigger per row */}
      {rows.map((row, i) => (
        <Popover key={i}>
          <div
            className={cn(
              "flex items-center gap-1 rounded-md transition-colors",
              dragOver === i && "ring-2 ring-ring ring-offset-1"
            )}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab active:cursor-grabbing" />
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 min-w-0 justify-start font-normal text-sm">
                <span className="truncate">{resolveLabel(row, i)}</span>
              </Button>
            </PopoverTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => duplicateRow(i)}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeRow(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={8}
            collisionPadding={8}
            className={`${popoverWidth} p-0 flex flex-col max-h-[min(80vh,500px)]`}
            onInteractOutside={(e) => {
              const target = e.target as Element | null
              if (target?.closest('[data-slot="popover-content"]')) e.preventDefault()
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
              <span className="text-[11px] uppercase font-semibold tracking-wide">
                {resolveLabel(row, i)}
              </span>
              <Button onClick={() => removeRow(i)} variant="ghost" size="icon" className="h-6 w-6">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {renderContent ? (
                renderContent(row, i, (key, v) => updateRow(i, key, v))
              ) : (
                <div className="p-3 space-y-3">
                  {Object.entries(fields).map(([key, fieldDef]) => {
                    if (!evaluateShowIf(fieldDef.showIf, row)) return null
                    // Filter by role permissions for repeater fields
                    if (parentKey && !canEditRepeaterField(user.role, parentKey, key, fieldDef.type)) {
                      return null
                    }
                    const type = FIELD_TYPE_MAP[fieldDef.type] ?? "text"
                    const options = fieldDef.type === "dropdown" ? fieldDef.options : undefined
                    const iconOptions = fieldDef.type === "icon" ? fieldDef.options : undefined
                    const rawVal = row[key] ?? (fieldDef.type === "checkbox" ? "false" : fieldDef.type === "icon" ? "null" : "")

                    // Handle IconData deserialization
                    let value: string | boolean | string[] | IconData | null = rawVal
                    if (fieldDef.type === "icon" && typeof rawVal === "string" && rawVal && rawVal !== "null") {
                      try {
                        value = JSON.parse(rawVal) as IconData
                      } catch {
                        value = null
                      }
                    }

                    return (
                      <InspectorField
                        key={key}
                        label={fieldDef.label}
                        value={value}
                        type={type}
                        options={options}
                        iconOptions={iconOptions}
                        onChange={(v) => updateRow(i, key, v)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {rows.length === 0 && emptyMessage && (
        <p className="text-xs text-muted-foreground text-center py-2">{emptyMessage}</p>
      )}

      {/* Add button — same style as old "Ajouter un item" */}
      <Button onClick={addRow} variant="outline" size="sm" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter
      </Button>
    </div>
  )
}
