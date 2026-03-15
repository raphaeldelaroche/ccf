/**
 * Migration helper: Extract non-responsive fields from responsive.xs to data root
 *
 * This migration is needed because older blocks stored ALL fields in responsive.xs,
 * but now we distinguish:
 * - Responsive fields (layout, size, marker position, etc.) → stored in responsive.{breakpoint}
 * - Non-responsive fields (title, markerType, figureType, etc.) → stored in data directly
 */

import type { BlockNode } from "@/lib/new-editor/block-types"
import type { ResponsiveBreakpointProps } from "@/lib/blob-compose"
import fieldSections from "@/lib/blob-fields"

/**
 * Legacy responsive type that includes the old 'xs' breakpoint.
 * Used only for migration purposes to access old data structures.
 */
type LegacyResponsiveProps = {
  xs?: ResponsiveBreakpointProps
  base?: ResponsiveBreakpointProps
  sm?: ResponsiveBreakpointProps
  md?: ResponsiveBreakpointProps
  lg?: ResponsiveBreakpointProps
  xl?: ResponsiveBreakpointProps
  "2xl"?: ResponsiveBreakpointProps
}

// List of all non-responsive field keys (fields WITHOUT responsive: true)
const NON_RESPONSIVE_FIELDS = new Set<string>()

// Build the set of non-responsive fields from blob-fields
Object.values(fieldSections).forEach((section) => {
  Object.entries(section.fields).forEach(([key, field]) => {
    if (!field.responsive) {
      NON_RESPONSIVE_FIELDS.add(key)
    }
  })
})

/**
 * Migrate a single block: extract non-responsive fields from responsive.xs to data root
 */
function migrateBlock(block: BlockNode): BlockNode {
  // Only migrate blob blocks
  if (block.blockType !== "blob" && block.blockType !== "blobIterator") {
    return block
  }

  const data = { ...block.data }
  const responsive = data.responsive as LegacyResponsiveProps | undefined

  if (!responsive?.xs) {
    // No responsive.xs to migrate from (already migrated or using new format)
    return block
  }

  let hasChanges = false
  const migratedXs = { ...responsive.xs }

  // Extract non-responsive fields from responsive.xs
  NON_RESPONSIVE_FIELDS.forEach((fieldKey) => {
    const key = fieldKey as keyof typeof migratedXs
    if (migratedXs[key] !== undefined) {
      // Move field from responsive.xs to data root
      data[fieldKey] = migratedXs[key]
      delete migratedXs[key]
      hasChanges = true
    }
  })

  if (!hasChanges) {
    // No migration needed
    return block
  }

  // Update responsive object (keeping xs for now, will be renamed to base in phase 2)
  const updatedResponsive = {
    ...responsive,
    xs: migratedXs,
  }

  // Recursively migrate innerBlocks
  const migratedInnerBlocks = block.innerBlocks?.map(migrateBlock)

  return {
    ...block,
    data: {
      ...data,
      responsive: updatedResponsive as unknown as typeof data.responsive,
    },
    innerBlocks: migratedInnerBlocks,
  }
}

/**
 * Migrate all blocks in the array
 */
export function migrateResponsiveFields(blocks: BlockNode[]): BlockNode[] {
  return blocks.map(migrateBlock)
}

/**
 * Check if a block needs migration
 */
export function needsMigration(block: BlockNode): boolean {
  if (block.blockType !== "blob" && block.blockType !== "blobIterator") {
    return false
  }

  const responsive = block.data.responsive as LegacyResponsiveProps | undefined
  if (!responsive?.base) {
    return false
  }

  // Check if any non-responsive field is present in responsive.base
  for (const fieldKey of NON_RESPONSIVE_FIELDS) {
    const key = fieldKey as keyof typeof responsive.base
    if (responsive.base[key] !== undefined) {
      return true
    }
  }

  // Check innerBlocks recursively
  if (block.innerBlocks) {
    return block.innerBlocks.some(needsMigration)
  }

  return false
}

/**
 * Phase 2 migration: Rename xs → base in responsive object
 * This migration is needed because the breakpoint was renamed from "xs" to "base"
 */
function migrateXsToBase(block: BlockNode): BlockNode {
  const responsive = block.data.responsive as LegacyResponsiveProps | undefined

  // Check if we have xs but not base (needs migration)
  if (responsive?.xs && !responsive.base) {
    const { xs, ...rest } = responsive
    const migratedInnerBlocks = block.innerBlocks?.map(migrateXsToBase)

    return {
      ...block,
      data: {
        ...block.data,
        responsive: {
          base: xs,
          ...rest
        } as unknown as typeof block.data.responsive
      },
      innerBlocks: migratedInnerBlocks
    }
  }

  // Recursively migrate innerBlocks even if this block doesn't need migration
  if (block.innerBlocks) {
    const migratedInnerBlocks = block.innerBlocks.map(migrateXsToBase)
    if (migratedInnerBlocks !== block.innerBlocks) {
      return { ...block, innerBlocks: migratedInnerBlocks }
    }
  }

  return block
}

/**
 * Migrate all blocks: xs → base
 */
export function migrateXsToBaseAll(blocks: BlockNode[]): BlockNode[] {
  return blocks.map(migrateXsToBase)
}
