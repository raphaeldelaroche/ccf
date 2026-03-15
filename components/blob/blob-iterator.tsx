import { ReactNode } from "react"
import { BlobGrid, type GridColumns, type SizeValue } from "./blob-grid"
import { BlobSwiper } from "./blob-swiper"
import type { SwiperOptions } from "swiper/types"

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
  /** Espacement entre les éléments (tokens de taille, via blob-gutter-*, supports responsive syntax "md lg:xl") */
  gapX?: string
  gapY?: string
  /** Options Swiper.js (utilisées si swiper présent dans containerLayout) */
  swiperOptions?: Partial<SwiperOptions>
  /** Classes CSS supplémentaires */
  className?: string
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
 * Parse "md lg:xl" → ["blob-gap-x-md", "lg:blob-gap-x-xl"]
 */
function parseResponsiveGap(value: string | undefined, axis: "x" | "y"): string {
  if (!value) return ""

  const parts = value.trim().split(/\s+/)
  const classes: string[] = []

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx !== -1) {
      const bp = part.slice(0, colonIdx)
      const val = part.slice(colonIdx + 1)
      if (val !== "auto") {
        classes.push(`${bp}:blob-gap-${axis}-${val}`)
      }
    } else {
      if (part !== "auto") {
        classes.push(`blob-gap-${axis}-${part}`)
      }
    }
  }

  return classes.join(" ")
}

/**
 * Check if a gap value contains responsive syntax (has ":")
 */
function isResponsiveGap(value: string | undefined): boolean {
  return !!value && value.includes(":")
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
  gapX,
  gapY,
  swiperOptions,
  className
}: BlobIteratorProps) {
  const layoutMap = parseResponsiveLayout(containerLayout, "grid-auto")
  const breakpoints = resolveBreakpoints(containerLayout)
  const needsClient = requiresClientComponent(layoutMap)

  // Parse responsive gap classes
  const gapXResponsive = isResponsiveGap(gapX)
  const gapYResponsive = isResponsiveGap(gapY)
  const gapXClasses = gapXResponsive ? parseResponsiveGap(gapX, "x") : ""
  const gapYClasses = gapYResponsive ? parseResponsiveGap(gapY, "y") : ""

  // Combine className with responsive gap classes
  const combinedClassName = [className, gapXClasses, gapYClasses].filter(Boolean).join(" ")

  // Si un seul breakpoint et c'est une grid, retourne directement BlobGrid (Server Component)
  if (!needsClient) {
    const singleLayout = breakpoints[0]?.layout || "grid-auto"
    const columns = extractGridColumns(singleLayout)
    return (
      <BlobGrid
        columns={columns}
        gapX={!gapXResponsive ? (gapX as SizeValue) : undefined}
        gapY={!gapYResponsive ? (gapY as SizeValue) : undefined}
        className={combinedClassName}
      >
        {children}
      </BlobGrid>
    )
  }

  // Si swiper est présent, on doit gérer le responsive avec CSS + composants conditionnels
  // Pour l'instant, on va utiliser une approche simple avec CSS media queries
  // et rendre les deux types de conteneurs avec display conditionnels

  return (
    <>
      {breakpoints.map(({ bp, layout }) => {
        const isSwiperLayout = layout === "swiper"
        const columns = extractGridColumns(layout)

        // Générer la classe CSS pour afficher ce conteneur au bon breakpoint
        const displayClass = getDisplayClassForBreakpoint(bp, breakpoints)

        if (isSwiperLayout) {
          return (
            <div key={`swiper-${bp}`} className={displayClass}>
              <BlobSwiper
                gapX={!gapXResponsive ? (gapX as SizeValue) : undefined}
                swiperOptions={swiperOptions}
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

/**
 * Génère la classe CSS pour afficher un conteneur uniquement au bon breakpoint
 */
function getDisplayClassForBreakpoint(
  currentBp: Breakpoint,
  allBreakpoints: Array<{ bp: Breakpoint; layout: IteratorLayout }>
): string {
  const currentIndex = BREAKPOINT_ORDER.indexOf(currentBp)
  const nextBreakpoint = allBreakpoints.find(
    ({ bp }) => BREAKPOINT_ORDER.indexOf(bp) > currentIndex
  )

  if (currentBp === "base") {
    if (nextBreakpoint) {
      return `block ${nextBreakpoint.bp}:hidden`
    }
    return "block"
  }

  if (nextBreakpoint) {
    return `hidden ${currentBp}:block ${nextBreakpoint.bp}:hidden`
  }

  return `hidden ${currentBp}:block`
}
