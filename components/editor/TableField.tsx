"use client"

import { useState, useEffect, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef {
  /** Discriminator — absent means inline column (legacy compat) */
  kind?: "inline"
  /** Key in the row object */
  key: string
  /** Header label */
  label: string
  /** Cell type */
  type: "text" | "select" | "checkbox"
  /** placeholder for type="text" */
  placeholder?: string
  /** options for type="select" */
  options?: Record<string, string>
  /** Optional CSS width class e.g. "w-32" */
  width?: string
  /**
   * When provided, the cell is grayed-out and non-interactive when the row's
   * value for `col` is NOT one of `values`. The value is still stored.
   */
  enabledIf?: { col: string; values: string[] }
}

/**
 * A grouped set of fields displayed in an expandable panel below the row.
 */
export interface ColumnGroupDef {
  kind: "group"
  /** Unique key for the group (used for expand/collapse state) */
  key: string
  /** Label displayed on the group toggle button */
  label: string
  /** Fields rendered inside the group panel */
  fields: DetailField[]
}

/**
 * A single field definition for a group expand panel.
 * Supports text, select and checkbox types plus conditional visibility.
 */
export interface DetailField {
  key: string
  label: string
  type: "text" | "select" | "checkbox"
  options?: Record<string, string>
  placeholder?: string
  /**
   * When provided, the field is only rendered when the row's value for `col`
   * is one of `values`.
   */
  showIf?: { col: string; values: string[] }
}

export type ColumnEntry = ColumnDef | ColumnGroupDef

export type TableRow = Record<string, string>

interface TableFieldProps {
  /** Serialized JSON string of TableRow[] */
  value: string
  /** Column & group definitions */
  columns: ColumnEntry[]
  /** Default values for a new row */
  defaultRow: TableRow
  /** Trigger button label */
  label?: string
  /** Title shown in the popover header */
  title?: string
  /** CSS class for the popover content width (default: "w-[420px]") */
  popoverWidth?: string
  /** Empty state message */
  emptyMessage?: string
  onChange: (value: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseRows(json: string): TableRow[] {
  try {
    const parsed = JSON.parse(json || "[]")
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function isGroupDef(col: ColumnEntry): col is ColumnGroupDef {
  return (col as ColumnGroupDef).kind === "group"
}

function isColumnDef(col: ColumnEntry): col is ColumnDef {
  return !isGroupDef(col)
}

/** Check whether a DetailField should be visible given the current row values */
function shouldShowField(field: DetailField, row: TableRow): boolean {
  if (!field.showIf) return true
  const current = row[field.showIf.col] ?? ""
  return field.showIf.values.includes(current)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Render a single detail field inside a group panel */
function GroupField({
  field,
  value,
  onChange,
}: {
  field: DetailField
  value: string
  onChange: (val: string) => void
}) {
  if (field.type === "checkbox") {
    const isChecked = value === "true"
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`gf-${field.key}`}
          checked={isChecked}
          onCheckedChange={(checked) => onChange(checked === true ? "true" : "false")}
        />
        <Label htmlFor={`gf-${field.key}`} className="text-xs font-normal cursor-pointer">
          {field.label}
        </Label>
      </div>
    )
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="space-y-1">
        <Label className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground">
          {field.label}
        </Label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-7 rounded-md border border-input bg-background px-2 text-xs outline-none cursor-pointer"
        >
          {Object.entries(field.options).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
    )
  }

  // Default: text
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase font-semibold tracking-wide text-muted-foreground">
        {field.label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? `${field.label}…`}
        className="h-7 text-xs"
      />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TableField({
  value,
  columns,
  defaultRow,
  label = "Gérer les éléments",
  title = "Éléments",
  popoverWidth = "w-[420px]",
  emptyMessage,
  onChange,
}: TableFieldProps) {
  const [open, setOpen] = useState(false)

  // Local state — same pattern as InspectorField.localValue so the table
  // stays interactive even though handleUpdateProp doesn't re-render the inspector.
  const [rows, setRows] = useState<TableRow[]>(() => parseRows(value))

  // Track which group panel is expanded per row: rowIndex → groupKey | null
  const [expandedGroups, setExpandedGroups] = useState<Record<number, string | null>>({})

  // Sync from external changes (block selection change)
  useEffect(() => {
    const next = parseRows(value)
    if (JSON.stringify(next) !== JSON.stringify(rows)) {
      setRows(next)
      setExpandedGroups({})
    }
    // rows intentionally excluded: react only to external (block-selection) changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commit = useCallback(
    (next: TableRow[]) => {
      setRows(next)
      onChange(JSON.stringify(next))
    },
    [onChange]
  )

  const addRow = () => commit([...rows, { ...defaultRow }])

  const removeRow = (idx: number) => {
    // Clean up expanded groups state
    setExpandedGroups((prev) => {
      const next = { ...prev }
      delete next[idx]
      // Re-index entries above the removed index
      const reindexed: Record<number, string | null> = {}
      for (const [k, v] of Object.entries(next)) {
        const ki = Number(k)
        if (ki > idx) reindexed[ki - 1] = v
        else reindexed[ki] = v
      }
      return reindexed
    })
    commit(rows.filter((_, i) => i !== idx))
  }

  const updateRow = (idx: number, key: string, val: string) =>
    commit(rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r)))

  const toggleGroup = (rowIdx: number, groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [rowIdx]: prev[rowIdx] === groupKey ? null : groupKey,
    }))
  }

  // Split columns into inline vs groups
  const inlineColumns = columns.filter(isColumnDef)
  const groupColumns = columns.filter(isGroupDef)

  const empty = emptyMessage ?? `Aucun élément — cliquez sur « Ajouter »`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between text-xs h-8">
          <span>{label}</span>
          <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {rows.length}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent side="left" align="start" className={cn(popoverWidth, "p-0")}>
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b px-3 py-2 flex items-center justify-between sticky top-0 bg-popover z-10">
            <span className="text-xs font-semibold">{title}</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={addRow}>
              + Ajouter
            </Button>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <p className="px-3 py-5 text-xs text-center text-muted-foreground">{empty}</p>
          ) : (
            <div className="divide-y">
              {rows.map((row, idx) => {
                const openGroup = expandedGroups[idx] ?? null
                return (
                  <div key={idx} className="group/row">
                    {/* Row bar */}
                    <div className="flex items-center gap-1 px-2 py-1.5 hover:bg-muted/20">
                      <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0 cursor-grab" />

                      {/* Inline fields */}
                      {inlineColumns.map((col) => (
                        <div key={col.key} className={cn("min-w-0", col.width ?? "flex-1")}>
                          {col.type === "text" ? (
                            <Input
                              value={row[col.key] ?? ""}
                              onChange={(e) => updateRow(idx, col.key, e.target.value)}
                              placeholder={col.placeholder ?? `${col.label}…`}
                              className="h-6 text-xs border-0 shadow-none bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          ) : col.type === "select" ? (
                            <select
                              value={row[col.key] ?? ""}
                              onChange={(e) => updateRow(idx, col.key, e.target.value)}
                              className="w-full bg-transparent text-xs outline-none cursor-pointer h-6 px-1"
                            >
                              {Object.entries(col.options ?? {}).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center px-1">
                              <Checkbox
                                checked={row[col.key] === "true"}
                                onCheckedChange={(checked) =>
                                  updateRow(idx, col.key, checked === true ? "true" : "false")
                                }
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Group toggle buttons */}
                      {groupColumns.map((group) => (
                        <Button
                          key={group.key}
                          variant={openGroup === group.key ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-6 text-[10px] px-1.5 shrink-0 gap-0.5",
                            openGroup === group.key && "bg-muted"
                          )}
                          onClick={() => toggleGroup(idx, group.key)}
                        >
                          {openGroup === group.key ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          {group.label}
                        </Button>
                      ))}

                      {/* Delete button */}
                      <button
                        onClick={() => removeRow(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5"
                        aria-label="Supprimer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Expanded group panel */}
                    {openGroup && (() => {
                      const group = groupColumns.find((g) => g.key === openGroup)
                      if (!group) return null
                      const visibleFields = group.fields.filter((f) => shouldShowField(f, row))
                      if (visibleFields.length === 0) return null
                      return (
                        <div className="px-3 pb-3 pt-1 ml-4 border-muted bg-muted/10">
                          <div className="space-y-2.5">
                            {visibleFields.map((field) => (
                              <GroupField
                                key={field.key}
                                field={field}
                                value={row[field.key] ?? ""}
                                onChange={(val) => updateRow(idx, field.key, val)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-3 py-2 flex justify-end sticky bottom-0 bg-popover">
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
