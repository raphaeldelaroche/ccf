/**
 * Bridge between blob-fields.ts repeater field definitions and TableField's
 * column/group configuration.
 *
 * Converts a `RepeaterField.fields` record into the `ColumnEntry[]` format
 * expected by the refactored TableField, respecting `showIf` conditions and
 * generating sensible default row values.
 */

import type { Field, ShowIfCondition } from "@/lib/blob-fields"
import type { ColumnDef, ColumnGroupDef, DetailField, TableRow } from "@/components/editor/TableField"

// ─── Layout configuration ─────────────────────────────────────────────────────

export interface FieldGroupConfig {
  /** Unique key for the group (used for expand/collapse state) */
  key: string
  /** Label displayed on the group toggle button */
  label: string
  /** Keys of `RepeaterField.fields` that belong to this group */
  fields: string[]
}

export interface TableLayoutConfig {
  /** Field keys rendered directly in the row bar */
  inline: string[]
  /** Groups of fields rendered in expandable panels below the row */
  groups: FieldGroupConfig[]
}

// ─── Converter ────────────────────────────────────────────────────────────────

/**
 * Convert a single blob-fields `ShowIfCondition` into the `DetailField.showIf`
 * format used by TableField.
 *
 * Only simple single-field conditions are converted. Array conditions (AND
 * logic) are flattened to the first condition — the grouped UI relies on the
 * group context to further filter visibility.
 */
function convertShowIf(
  condition: ShowIfCondition | ShowIfCondition[] | undefined
): DetailField["showIf"] | undefined {
  if (!condition) return undefined

  const single = Array.isArray(condition) ? condition[0] : condition
  if (!single) return undefined

  const values = Array.isArray(single.value)
    ? single.value.map(String)
    : [String(single.value)]

  return { col: single.field, values }
}

/**
 * Map a blob-fields `Field` type to the simplified `DetailField.type` used in
 * TableField.  Unsupported types (image, video, icon, repeater, …) fall back
 * to "text" so they are at least editable as raw strings.
 */
function fieldTypeToDetailType(field: Field): "text" | "select" | "checkbox" {
  switch (field.type) {
    case "text":
    case "textarea":
      return "text"
    case "dropdown":
    case "multiselect":
      return "select"
    case "checkbox":
      return "checkbox"
    default:
      return "text"
  }
}

/**
 * Extract the options record from a field, if applicable.
 */
function extractOptions(field: Field): Record<string, string> | undefined {
  if (field.type === "dropdown" || field.type === "multiselect") {
    return field.options
  }
  return undefined
}

/**
 * Build a `DetailField` from a blob-fields `Field`.
 */
function toDetailField(key: string, field: Field): DetailField {
  return {
    key,
    label: field.label,
    type: fieldTypeToDetailType(field),
    options: extractOptions(field),
    showIf: convertShowIf(field.showIf),
  }
}

/**
 * Build a `ColumnDef` (inline column) from a blob-fields `Field`.
 */
function toColumnDef(key: string, field: Field): ColumnDef {
  return {
    key,
    label: field.label,
    type: fieldTypeToDetailType(field),
    options: extractOptions(field),
    placeholder: field.type === "text" ? `${field.label}…` : undefined,
  }
}

/**
 * Compute a sensible default value for a field (used in `defaultRow`).
 */
function defaultValueForField(field: Field): string {
  if (field.type === "dropdown") {
    const keys = Object.keys(field.options)
    return keys[0] ?? ""
  }
  if (field.type === "checkbox") {
    return "false"
  }
  return ""
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type ColumnEntry = ColumnDef | ColumnGroupDef

/**
 * Convert a `RepeaterField.fields` record + a layout config into the
 * `columns` and `defaultRow` expected by `<TableField>`.
 *
 * @param repeaterFields - `Record<string, Field>` from a blob-fields repeater
 * @param layout         - Describes which fields are inline vs grouped
 * @returns `{ columns, defaultRow }` ready to pass to `<TableField>`
 */
export function repeaterFieldToTableConfig(
  repeaterFields: Record<string, Field>,
  layout: TableLayoutConfig
): { columns: ColumnEntry[]; defaultRow: TableRow } {
  const columns: ColumnEntry[] = []

  // 1. Inline columns
  for (const key of layout.inline) {
    const field = repeaterFields[key]
    if (field) {
      columns.push(toColumnDef(key, field))
    }
  }

  // 2. Grouped columns
  for (const group of layout.groups) {
    const detailFields: DetailField[] = []
    for (const fieldKey of group.fields) {
      const field = repeaterFields[fieldKey]
      if (field) {
        detailFields.push(toDetailField(fieldKey, field))
      }
    }
    if (detailFields.length > 0) {
      columns.push({
        kind: "group",
        key: group.key,
        label: group.label,
        fields: detailFields,
      })
    }
  }

  // 3. Default row — include ALL fields (inline + grouped) with defaults
  const defaultRow: TableRow = {}
  for (const [key, field] of Object.entries(repeaterFields)) {
    defaultRow[key] = defaultValueForField(field)
  }

  return { columns, defaultRow }
}
