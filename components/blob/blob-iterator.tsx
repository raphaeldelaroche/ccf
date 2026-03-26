import { ReactNode } from "react"
import { BlobGrid, type GridColumns, type SizeValue, type PaddingValue } from "./blob-grid"
import { BlobSwiper } from "./blob-swiper"
import type { SwiperOptions } from "swiper/types"
import type { SwiperResponsiveConfig } from "@/lib/blob-iterator-mapper"
import { resolveAppearances } from "@/config/blob-appearances"
import { resolveBackgrounds, resolveBackgroundClasses } from "@/config/blob-backgrounds"
import { BlobBackground } from "@/components/blob/blob-background"
import { cn } from "@/lib/utils"

/* ========================================================
   BLOB ITERATOR — Layout responsive pour collections de blobs
   ========================================================

   Syntaxe responsive : "swiper lg:grid-2"
   Détection automatique client/server selon les breakpoints
   ======================================================== */

const BREAKPOINT_ORDER = ["base", "sm", "md", "lg", "xl", "2xl"] as const
type Breakpoint = (typeof BREAKPOINT_ORDER)[number]

export type IteratorLayout = "swiper" | "grid-1" | "grid-2" | "grid-3" | "grid-4" | "grid-5" | "grid-6" | "grid-auto"

type ResponsiveIteratorLayout = string & { __brand?: "IteratorLayout" }

export interface BlobIteratorProps {
  children: ReactNode
  /** Layout responsive du conteneur (ex: "swiper lg:grid-2") */
  containerLayout?: ResponsiveIteratorLayout
  /** Espacement externe horizontal du conteneur (supports responsive syntax "md lg:xl") */
  paddingX?: string
  /** Espacement externe vertical du conteneur (supports responsive syntax "md lg:xl") */
  paddingY?: string
  /** Espacement entre les éléments (tokens de taille, via blob-gutter-*, supports responsive syntax "md lg:xl") */
  gapX?: string
  gapY?: string
  /** Options Swiper.js (utilisées si swiper présent dans containerLayout) */
  swiperOptions?: Partial<SwiperOptions>
  /** Largeur CSS de chaque slide en mode slidesPerView:"auto" (ex: "300px", "80%") */
  swiperSlideWidth?: string
  /** Per-breakpoint responsive config for CSS-driven behavior (nav/pagination/slideWidth) */
  swiperResponsiveConfig?: SwiperResponsiveConfig
  /** Apparences appliquées au conteneur iterator */
  appearance?: string[]
  /** Backgrounds appliqués au conteneur iterator */
  background?: string[]
  /** Classes CSS supplémentaires */
  className?: string
  /** Active les container queries (@md:) au lieu des media queries (md:) — éditeur uniquement */
  useContainerQueries?: boolean
}

/* ── Parser responsive ── */

/**
 * Parse "swiper lg:grid-2" → { base: "swiper", lg: "grid-2" }
 */
function parseResponsiveLayout(
  value: string | undefined,
  defaultValue: IteratorLayout = "grid-auto"
): Partial<Record<string, IteratorLayout>> {
  if (!value) return { base: defaultValue }

  const parts = value.trim().split(/\s+/)
  const result: Partial<Record<string, IteratorLayout>> = {}

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx !== -1) {
      const bp = part.slice(0, colonIdx)
      const val = part.slice(colonIdx + 1)
      result[bp] = val as IteratorLayout
    } else {
      result.base = part as IteratorLayout
    }
  }

  return result
}

/**
 * Détermine si un layout nécessite un Client Component (swiper)
 */
function requiresClientComponent(layoutMap: Partial<Record<string, IteratorLayout>>): boolean {
  return Object.values(layoutMap).some((layout) => layout === "swiper")
}

/**
 * Extrait le type de grid depuis un layout (grid-2 → "2")
 */
function extractGridColumns(layout: IteratorLayout): GridColumns {
  if (layout.startsWith("grid-")) {
    return layout.replace("grid-", "") as GridColumns
  }
  return "auto"
}

/**
 * Résout le layout pour chaque breakpoint en propagation mobile-first
 */
function resolveBreakpoints(
  layoutStr: string | undefined
): Array<{ bp: Breakpoint; layout: IteratorLayout }> {
  const layoutMap = parseResponsiveLayout(layoutStr, "grid-auto")

  const allBps = Object.keys(layoutMap)
  const sorted = allBps.sort(
    (a, b) =>
      (BREAKPOINT_ORDER.indexOf(a as Breakpoint) ?? 99) -
      (BREAKPOINT_ORDER.indexOf(b as Breakpoint) ?? 99)
  ) as Breakpoint[]

  const resolved: Array<{ bp: Breakpoint; layout: IteratorLayout }> = []
  let prevLayout: IteratorLayout = "grid-auto"

  for (const bp of sorted) {
    const layout: IteratorLayout = (layoutMap[bp] as IteratorLayout) ?? prevLayout
    resolved.push({ bp, layout })
    prevLayout = layout
  }

  return resolved
}

/* ── Composant principal ── */

/**
 * Parse responsive spacing values into CSS classes
 * @param value - e.g., "md lg:xl"
 * @param type - "gap" or "padding"
 * @param axis - "x" or "y"
 * @param containerMode - Use container queries (@) instead of media queries
 * @returns CSS classes string, e.g., "blob-gap-x-md lg:blob-gap-x-xl"
 */
function parseResponsiveSpacing(
  value: string | undefined,
  type: "gap" | "padding",
  axis: "x" | "y",
  containerMode = false
): string {
  if (!value) return ""

  const parts = value.trim().split(/\s+/)
  const classes: string[] = []

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx !== -1) {
      const bp = part.slice(0, colonIdx)
      const val = part.slice(colonIdx + 1)
      if (val !== "auto") {
        const bpPrefix = containerMode ? `@${bp}` : bp
        classes.push(`${bpPrefix}:blob-${type}-${axis}-${val}`)
      }
    } else {
      if (part !== "auto") {
        classes.push(`blob-${type}-${axis}-${part}`)
      }
    }
  }

  return classes.join(" ")
}

/**
 * Parse "md lg:xl" → ["blob-gap-x-md", "lg:blob-gap-x-xl"]
 * En mode container : "md lg:xl" → ["blob-gap-x-md", "@lg:blob-gap-x-xl"]
 */
function parseResponsiveGap(value: string | undefined, axis: "x" | "y", containerMode = false): string {
  return parseResponsiveSpacing(value, "gap", axis, containerMode)
}

/**
 * Parse padding values into CSS classes
 * @example "md lg:xl" → "blob-padding-x-md lg:blob-padding-x-xl"
 */
function parseResponsivePadding(value: string | undefined, axis: "x" | "y", containerMode = false): string {
  return parseResponsiveSpacing(value, "padding", axis, containerMode)
}

/**
 * Check if a spacing value contains responsive syntax (has ":")
 */
function isResponsiveSpacing(value: string | undefined): boolean {
  return !!value && value.includes(":")
}

/**
 * Génère les classes CSS responsive pour la grille
 * e.g. [{ bp: "base", layout: "grid-1" }, { bp: "md", layout: "grid-3" }]
 *   → "blob-iterator-grid-1 md:blob-iterator-grid-3"
 * En mode container : → "blob-iterator-grid-1 @md:blob-iterator-grid-3"
 */
function buildResponsiveGridClasses(
  breakpoints: Array<{ bp: Breakpoint; layout: IteratorLayout }>,
  containerMode = false
): string {
  return breakpoints
    .map(({ bp, layout }) => {
      const columns = extractGridColumns(layout)
      const cls = `blob-iterator-grid-${columns}`
      if (bp === "base") return cls
      const prefix = containerMode ? `@${bp}` : bp
      return `${prefix}:${cls}`
    })
    .join(" ")
}

/**
 * BlobIterator - Composant pour itérer sur des blobs avec layouts responsives
 *
 * Devient automatiquement un Client Component si swiper est utilisé dans containerLayout.
 * Reste Server Component si seulement grid est utilisé.
 *
 * @example
 * ```tsx
 * <BlobIterator containerLayout="swiper lg:grid-2" gapX="md" gapY="md">
 *   <Blob>...</Blob>
 *   <Blob>...</Blob>
 * </BlobIterator>
 * ```
 */
export function BlobIterator({
  children,
  containerLayout = "grid-auto",
  paddingX,
  paddingY,
  gapX,
  gapY,
  swiperOptions,
  swiperSlideWidth,
  swiperResponsiveConfig,
  appearance,
  background,
  className,
  useContainerQueries = false,
}: BlobIteratorProps) {
  const containerMode = useContainerQueries
  const layoutMap = parseResponsiveLayout(containerLayout, "grid-auto")
  const breakpoints = resolveBreakpoints(containerLayout)
  const needsClient = requiresClientComponent(layoutMap)

  // Parse responsive padding classes
  const paddingXResponsive = isResponsiveSpacing(paddingX)
  const paddingYResponsive = isResponsiveSpacing(paddingY)
  const paddingXClasses = paddingXResponsive ? parseResponsivePadding(paddingX, "x", containerMode) : ""
  const paddingYClasses = paddingYResponsive ? parseResponsivePadding(paddingY, "y", containerMode) : ""

  // Parse responsive gap classes
  const gapXResponsive = isResponsiveSpacing(gapX)
  const gapYResponsive = isResponsiveSpacing(gapY)
  const gapXClasses = gapXResponsive ? parseResponsiveGap(gapX, "x", containerMode) : ""
  const gapYClasses = gapYResponsive ? parseResponsiveGap(gapY, "y", containerMode) : ""

  // Combine className with responsive spacing classes
  const combinedClassName = [className, paddingXClasses, paddingYClasses, gapXClasses, gapYClasses].filter(Boolean).join(" ")

  // Resolve container appearance & background
  const appearanceConfig = resolveAppearances(appearance)
  const backgrounds = resolveBackgrounds(background)
  const backgroundClasses = resolveBackgroundClasses(background)
  const hasWrapper = (appearance?.length ?? 0) > 0 || backgrounds.length > 0 || backgroundClasses.length > 0

  // Render inner content (grid or swiper/grid mix)
  let content: ReactNode

  // Aucun swiper → Server Component avec classes CSS responsive
  if (!needsClient) {
    const responsiveLayout = buildResponsiveGridClasses(breakpoints, containerMode)
    content = (
      <BlobGrid
        responsiveLayout={responsiveLayout}
        paddingX={!paddingXResponsive ? (paddingX as PaddingValue) : undefined}
        paddingY={!paddingYResponsive ? (paddingY as SizeValue) : undefined}
        gapX={!gapXResponsive ? (gapX as SizeValue) : undefined}
        gapY={!gapYResponsive ? (gapY as SizeValue) : undefined}
        className={combinedClassName}
      >
        {children}
      </BlobGrid>
    )
  } else {
    // Si swiper est présent, on doit gérer le responsive avec CSS + composants conditionnels
    // et rendre les deux types de conteneurs avec display conditionnels
    content = (
      <>
        {breakpoints.map(({ bp, layout }) => {
          const isSwiperLayout = layout === "swiper"
          const columns = extractGridColumns(layout)

          // Générer la classe CSS pour afficher ce conteneur au bon breakpoint
          const displayClass = getDisplayClassForBreakpoint(bp, breakpoints, containerMode)

          if (isSwiperLayout) {
            return (
              <div key={`swiper-${bp}`} className={cn(displayClass, "w-full min-w-0 overflow-hidden")}>
                <BlobSwiper
                  gapX={!gapXResponsive ? (gapX as SizeValue) : undefined}
                  swiperOptions={swiperOptions}
                  swiperSlideWidth={swiperSlideWidth}
                  responsiveConfig={swiperResponsiveConfig}
                  useContainerQueries={containerMode}
                  className={combinedClassName}
                >
                  {children}
                </BlobSwiper>
              </div>
            )
          } else {
            return (
              <div key={`grid-${bp}`} className={displayClass}>
                <BlobGrid
                  columns={columns}
                  paddingX={!paddingXResponsive ? (paddingX as PaddingValue) : undefined}
                  paddingY={!paddingYResponsive ? (paddingY as SizeValue) : undefined}
                  gapX={!gapXResponsive ? (gapX as SizeValue) : undefined}
                  gapY={!gapYResponsive ? (gapY as SizeValue) : undefined}
                  className={combinedClassName}
                >
                  {children}
                </BlobGrid>
              </div>
            )
          }
        })}
      </>
    )
  }

  // Wrap with appearance/background if needed
  if (!hasWrapper) return content

  return (
    <div className={cn(appearanceConfig.blobClassName, backgroundClasses, backgrounds.length > 0 && "relative")}>
      <BlobBackground backgrounds={backgrounds} />
      {content}
    </div>
  )
}

/**
 * Génère la classe CSS pour afficher un conteneur uniquement au bon breakpoint
 * En mode container, utilise @md:block/@md:hidden au lieu de md:block/md:hidden
 */
function getDisplayClassForBreakpoint(
  currentBp: Breakpoint,
  allBreakpoints: Array<{ bp: Breakpoint; layout: IteratorLayout }>,
  containerMode = false
): string {
  const currentIndex = BREAKPOINT_ORDER.indexOf(currentBp)
  const nextBreakpoint = allBreakpoints.find(
    ({ bp }) => BREAKPOINT_ORDER.indexOf(bp) > currentIndex
  )

  const p = (bp: string) => containerMode ? `@${bp}` : bp

  if (currentBp === "base") {
    if (nextBreakpoint) {
      return `block ${p(nextBreakpoint.bp)}:hidden`
    }
    return "block"
  }

  if (nextBreakpoint) {
    return `hidden ${p(currentBp)}:block ${p(nextBreakpoint.bp)}:hidden`
  }

  return `hidden ${p(currentBp)}:block`
}
