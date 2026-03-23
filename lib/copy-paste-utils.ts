/**
 * COPY-PASTE UTILITIES
 *
 * Extraction et merge de champs par catégorie (style / content)
 * pour la feature "Copier le style" / "Copier le contenu".
 *
 * Utilise le `copyCategory` défini sur chaque champ dans blob-fields.ts.
 */

import fieldSections, { type Field, type FieldSection } from "./blob-fields"
import { resolveBlockSections } from "./block-definition"
import { IteratorBlockDefinition } from "./blob-iterator-definition"
import type { BlockType } from "./new-editor/block-types"

export type CopyCategory = "style" | "content"
export type CopyMode = "full" | "style" | "content"

// ─── Block type → field sections resolution ─────────────────────────────────

/**
 * Resolves the complete set of field sections for a given block type.
 * For blob: returns base fieldSections.
 * For blobIterator: merges base fieldSections with IteratorBlockDefinition.extraSections.
 * Other block types are not supported for style/content copy.
 */
export function getFieldSectionsForBlockType(
  blockType: BlockType
): Record<string, FieldSection> | null {
  switch (blockType) {
    case "blob":
      return fieldSections
    case "blobIterator":
      return resolveBlockSections(fieldSections, IteratorBlockDefinition)
    default:
      return null
  }
}

// ─── Field introspection ────────────────────────────────────────────────────

/**
 * Collects field keys matching a copyCategory from a set of field sections.
 * Also returns responsive field keys separately (needed for responsive data extraction).
 */
function collectFieldInfo(
  sections: Record<string, FieldSection>,
  category: CopyCategory
): { keys: Set<string>; responsiveKeys: Set<string>; repeaterKeys: Set<string> } {
  const keys = new Set<string>()
  const responsiveKeys = new Set<string>()
  const repeaterKeys = new Set<string>()

  for (const section of Object.values(sections)) {
    for (const [key, field] of Object.entries(section.fields)) {
      if (field.type === "repeater" && hasSubFieldsWithCategory(field, category)) {
        repeaterKeys.add(key)
      } else if (field.copyCategory === category) {
        keys.add(key)
        if (field.responsive) {
          responsiveKeys.add(key)
        }
      }
    }
  }

  return { keys, responsiveKeys, repeaterKeys }
}

/**
 * Checks if a repeater field has any sub-fields with the given copyCategory.
 */
function hasSubFieldsWithCategory(field: Field, category: CopyCategory): boolean {
  if (field.type !== "repeater") return false
  return Object.values(field.fields).some((f) => f.copyCategory === category)
}

/**
 * Returns sub-field keys of a repeater matching a copyCategory.
 */
function getRepeaterSubFieldKeys(
  sections: Record<string, FieldSection>,
  repeaterKey: string,
  category: CopyCategory
): string[] {
  for (const section of Object.values(sections)) {
    const field = section.fields[repeaterKey]
    if (field?.type === "repeater") {
      return Object.entries(field.fields)
        .filter(([, f]) => f.copyCategory === category)
        .map(([k]) => k)
    }
  }
  return []
}

// ─── JSON parsing ───────────────────────────────────────────────────────────

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function pick<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const result: Partial<T> = {}
  for (const key of keys) {
    if (key in obj) {
      (result as Record<string, unknown>)[key] = obj[key]
    }
  }
  return result
}

// ─── Extraction ─────────────────────────────────────────────────────────────

/**
 * Extracts fields from block data matching a copyCategory.
 *
 * Handles:
 * 1. Flat fields (data.fieldKey)
 * 2. Responsive overrides (data.responsive.{breakpoint}.{fieldKey})
 * 3. Repeater fields (filters sub-fields within each item by category)
 *
 * @param data - The block's data object
 * @param category - 'style' or 'content'
 * @param sections - Field sections to use (defaults to blob fieldSections)
 */
export function extractFieldsByCategory(
  data: Record<string, unknown>,
  category: CopyCategory,
  sections: Record<string, FieldSection> = fieldSections
): Record<string, unknown> {
  const { keys, responsiveKeys, repeaterKeys } = collectFieldInfo(sections, category)
  const result: Record<string, unknown> = {}

  // 1. Flat fields
  for (const key of keys) {
    if (key in data && data[key] !== undefined) {
      result[key] = data[key]
    }
  }

  // 2. Responsive overrides — only copy responsive keys for the given category
  if (responsiveKeys.size > 0 && data.responsive && typeof data.responsive === "object") {
    const responsiveData = data.responsive as Record<string, Record<string, unknown>>
    const responsiveResult: Record<string, Record<string, unknown>> = {}

    for (const [breakpoint, bpData] of Object.entries(responsiveData)) {
      if (!bpData || typeof bpData !== "object") continue
      const filtered: Record<string, unknown> = {}
      for (const key of responsiveKeys) {
        if (key in bpData && bpData[key] !== undefined) {
          filtered[key] = bpData[key]
        }
      }
      if (Object.keys(filtered).length > 0) {
        responsiveResult[breakpoint] = filtered
      }
    }

    if (Object.keys(responsiveResult).length > 0) {
      result.responsive = responsiveResult
    }
  }

  // 3. Repeater fields — extract sub-fields by category within each item
  for (const repeaterKey of repeaterKeys) {
    if (!(repeaterKey in data) || data[repeaterKey] === undefined) continue
    const subKeys = getRepeaterSubFieldKeys(sections, repeaterKey, category)
    if (subKeys.length === 0) continue

    const items = parseJsonField<Record<string, unknown>[]>(data[repeaterKey], [])
    const filteredItems = items.map((item) => pick(item, subKeys))
    result[repeaterKey] = JSON.stringify(filteredItems)
  }

  return result
}

// ─── Merge ──────────────────────────────────────────────────────────────────

/**
 * Merges copied fields into target block data.
 * Only overwrites fields present in copiedData (non-destructive merge).
 *
 * Handles:
 * 1. Flat fields: direct overwrite
 * 2. Responsive: deep merge per breakpoint (only copied keys are touched)
 * 3. Repeater fields: merge by index (target items get copied sub-fields applied)
 */
export function mergeFieldsIntoData(
  targetData: Record<string, unknown>,
  copiedData: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...targetData }

  for (const [key, value] of Object.entries(copiedData)) {
    if (key === "responsive") {
      result.responsive = deepMergeResponsive(
        (result.responsive as Record<string, Record<string, unknown>> | undefined) ?? {},
        value as Record<string, Record<string, unknown>>
      )
    } else if (isRepeaterJson(targetData[key]) && isRepeaterJson(value)) {
      // Merge repeater items by index
      result[key] = mergeRepeaterItems(
        targetData[key] as string,
        value as string
      )
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Deep merges responsive data per breakpoint.
 * Only overwrites the specific keys present in the source for each breakpoint.
 */
function deepMergeResponsive(
  target: Record<string, Record<string, unknown>>,
  source: Record<string, Record<string, unknown>>
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = { ...target }

  for (const [breakpoint, sourceData] of Object.entries(source)) {
    result[breakpoint] = {
      ...(result[breakpoint] ?? {}),
      ...sourceData,
    }
  }

  return result
}

/**
 * Checks if a value looks like a JSON-serialized repeater (array string).
 */
function isRepeaterJson(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("[")
}

/**
 * Merges repeater items by index.
 * For each item in the target, applies the copied sub-fields from the source at the same index.
 * If the target has more items than the source, excess items keep their original values.
 */
function mergeRepeaterItems(targetJson: string, sourceJson: string): string {
  const targetItems = parseJsonField<Record<string, unknown>[]>(targetJson, [])
  const sourceItems = parseJsonField<Record<string, unknown>[]>(sourceJson, [])

  const merged = targetItems.map((targetItem, index) => {
    if (index >= sourceItems.length) return targetItem
    return { ...targetItem, ...sourceItems[index] }
  })

  return JSON.stringify(merged)
}
