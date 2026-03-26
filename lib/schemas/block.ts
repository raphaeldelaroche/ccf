/**
 * Zod schemas pour les blocs BlobUI
 * Basés sur block.schema.json comme source de vérité
 */

import { z } from "zod"
import {
  LAYOUTS,
  DIRECTIONS,
  MARKERS,
  ACTIONS,
  ALIGNS,
  FIGURE_WIDTHS,
  SIZES,
} from "@/lib/blob-compatibility"

/* ── Types de base ── */

// Known Blob block types — plus native BlockNote types (paragraph, heading, …) stored verbatim
export const BlockTypeSchema = z.string().min(1)

export const BlockMetaSchema = z
  .object({
    collapsed: z.boolean().optional(),
    locked: z.boolean().optional(),
    visible: z.boolean().optional(),
  })
  .optional()

export const ButtonSchema = z.object({
  label: z.string().optional(),
  href: z.string().optional(),
  variant: z.string().optional(),
  size: z.string().optional(),
  icon: z.string().optional(),
  iconPosition: z.string().optional(),
})

export const BlockDataSchema = z
  .object({
    // En-tête
    title: z.string().optional(),
    subtitle: z.string().optional(),
    eyebrow: z.string().optional(),
    eyebrowTheme: z.string().optional(),

    // Layout
    layout: z.enum(LAYOUTS).optional(),
    direction: z.enum(DIRECTIONS).optional(),
    align: z.enum(ALIGNS).optional(),
    size: z.enum(SIZES).optional(),

    // Marker
    marker: z.enum(MARKERS).optional(),
    markerType: z.enum(["text", "icon", "number"]).optional(),
    markerContent: z.string().optional(),
    markerStyle: z.string().optional(),
    markerSize: z.string().optional(),
    markerWidth: z.string().optional(),
    markerTheme: z.string().optional(),
    markerShape: z.string().optional(),

    // Actions
    actions: z.enum(ACTIONS).optional(),
    buttons: z.array(ButtonSchema).optional(),
    buttonsPosition: z.string().optional(),

    // Figure
    figureWidth: z.enum(FIGURE_WIDTHS).optional(),
    figureBleed: z.boolean().optional(),
    figureType: z.enum(["image", "video", "icon", "none"]).optional(),
    figureImage: z.string().optional(),
    figureVideo: z.string().optional(),

    // Style
    theme: z.string().optional(),
    appearance: z.string().optional(),
    backgroundTheme: z.string().optional(),

    // Espacement
    paddingX: z.string().optional(),
    paddingY: z.string().optional(),
    gapX: z.string().optional(),
  gapY: z.string().optional(),

    // Séparateur
    separator: z.boolean().optional(),
    separatorPosition: z.string().optional(),

    // Contenu
    content: z.string().optional(),
    contentSize: z.string().optional(),

    // BlobSection spécifique
    containerWidth: z.enum(["center", "wide", "full"]).optional(),

    // BlobIterator spécifique
    iteratorLayout: z.string().optional(),
    iteratorGapX: z.string().optional(),
  iteratorGapY: z.string().optional(),
    itemFields: z.array(z.string()).optional(),
    // Items sont toujours des BlockNode complets (avec ID, blockType, data, innerBlocks)
    items: z.array(z.lazy(() => BlockSchema)).optional(),
    swiperNavigation: z.boolean().optional(),
    swiperPagination: z.boolean().optional(),
    swiperAutoplay: z.boolean().optional(),
    swiperAutoplayDelay: z.number().optional(),
    swiperLoop: z.boolean().optional(),
  })
  .passthrough() // Autorise les champs supplémentaires non listés

/* ── Schema récursif BlockNode ── */

export interface BlockNodeInput {
  id: string
  blockType: string
  data: Record<string, unknown>
  innerBlocks: BlockNodeInput[]
  meta?: {
    collapsed?: boolean
    locked?: boolean
    visible?: boolean
  }
}

export const BlockSchema: z.ZodType<BlockNodeInput> = z.lazy(() =>
  z.object({
    id: z.string().min(1, "L'ID est requis"),
    blockType: BlockTypeSchema,
    data: BlockDataSchema,
    innerBlocks: z.array(BlockSchema),
    meta: BlockMetaSchema,
  })
)

/* ── Schema avec validation des contraintes croisées ── */

export const ValidatedBlockSchema = BlockSchema.refine(
  (block) => {
    const { layout, marker, actions } = block.data as {
      layout?: string
      marker?: string
      actions?: string
    }

    // bar ne supporte pas les actions "after"
    if (layout === "bar" && actions === "after") return false

    // bar ne supporte pas le marker "right"
    if (layout === "bar" && marker === "right") return false

    // row ne supporte pas le marker "left" ou "right"
    if (layout === "row" && (marker === "left" || marker === "right")) return false

    return true
  },
  {
    message:
      "Combinaison layout/marker/actions invalide. Vérifiez la matrice de compatibilité dans blob-compatibility.ts.",
  }
)
