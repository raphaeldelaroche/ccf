// ─── Block Alignment ──────────────────────────────────────────────────────────
// Shared alignment system for custom BlockNote blocks (inspired by Gutenberg).
// Values: "default" (content-width), "wide" (wider), "full" (edge-to-edge).

export const BLOCK_ALIGNMENTS = ["default", "wide", "full"] as const

export type BlockAlignment = (typeof BLOCK_ALIGNMENTS)[number]

/**
 * Reusable propSchema fragment — import this into any custom block's propSchema
 * to opt into alignment support.
 *
 * The `default` value is the initial alignment when a block is inserted.
 * Individual blocks can override it by spreading:
 *   `{ ...blockAlignmentProp, default: "wide" }`
 */
export const blockAlignmentProp = {
  default: "default" as const,
  values: BLOCK_ALIGNMENTS as unknown as string[],
}

/**
 * CSS classes for each alignment value.
 * Reuses the same approach as BlockBlobSection's CONTAINER_CLASSES.
 */
const ALIGNMENT_CLASSES: Record<BlockAlignment, string> = {
  default: "max-w-4xl mx-auto",
  wide: "max-w-7xl mx-auto",
  full: "w-full",
}

export function getAlignmentClass(alignment: BlockAlignment): string {
  return ALIGNMENT_CLASSES[alignment] ?? ALIGNMENT_CLASSES.default
}

/**
 * Labels for the alignment options (used in toolbar & inspector).
 */
export const ALIGNMENT_LABELS: Record<BlockAlignment, string> = {
  default: "Par défaut",
  wide: "Large",
  full: "Pleine largeur",
}

// ─── Forced defaults (non-configurable) ──────────────────────────────────────
// Some block types may lock alignment to a specific value. When a block type
// appears in this map, the alignment controls are disabled and show a tooltip.

export const blockAlignmentLocked: Record<string, BlockAlignment> = {
  // Example: "myBlock": "full",
}

/**
 * Check if a block type has a locked (non-configurable) alignment.
 */
export function isAlignmentLocked(blockType: string): boolean {
  return blockType in blockAlignmentLocked
}
