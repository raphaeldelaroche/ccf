import {
  generateRegistry,
  buildRegistryKey,
  resolveValid,
  type Layout,
  type Direction,
  type Marker,
  type Action,
  type AlignValue,
  type FigureWidthValue,
  type SizeValue,
  type PropContext,
} from "@/lib/blob-compatibility"

/* ========================================================
   BLOB — CLASSE COMPOSER
   ========================================================

   API responsive : syntaxe Tailwind-like ("stack md:row lg:bar")
   ======================================================== */

const REGISTRY = generateRegistry()

const BREAKPOINT_ORDER = ["base", "sm", "md", "lg", "xl", "2xl"] as const
export type Breakpoint = (typeof BREAKPOINT_ORDER)[number]

export type { AlignValue, FigureWidthValue, SizeValue } from "@/lib/blob-compatibility"

/* ── Responsive value types ── */
export type FigureBleedValue = "full" | "none"
export type PaddingValue = SizeValue | "container-sm" | "container-md" | "container-lg" | "container-xl" | "container-2xl"

/**
 * Props responsive pour un breakpoint donné
 */
export interface ResponsiveBreakpointProps {
  layout?: Layout
  direction?: Direction
  marker?: Marker
  actions?: Action
  align?: AlignValue
  figureWidth?: FigureWidthValue
  size?: SizeValue
  gapX?: SizeValue
  gapY?: SizeValue
  paddingX?: PaddingValue
  paddingY?: SizeValue
  headerPaddingX?: PaddingValue
  headerPaddingY?: PaddingValue
  figureBleed?: FigureBleedValue
  markerSize?: SizeValue
  markerWidth?: "default" | "auto"
  // Iterator container props
  iteratorLayout?: string
  iteratorPaddingX?: PaddingValue
  iteratorPaddingY?: SizeValue
  iteratorGapX?: SizeValue
  iteratorGapY?: SizeValue
  swiperSlidesPerView?: string
  swiperSlideWidth?: string
  swiperNavigation?: boolean
  swiperPagination?: boolean
  swiperAutoplay?: boolean
  swiperLoop?: boolean
  swiperCenteredSlides?: boolean
}

/**
 * Objet responsive : valeurs par breakpoint
 */
export interface ResponsiveProps {
  base?: ResponsiveBreakpointProps
  sm?: ResponsiveBreakpointProps
  md?: ResponsiveBreakpointProps
  lg?: ResponsiveBreakpointProps
  xl?: ResponsiveBreakpointProps
  "2xl"?: ResponsiveBreakpointProps
}

export type BlobComposableProps = {
  /** Objet responsive contenant toutes les props par breakpoint */
  responsive?: ResponsiveProps
  /** Thème de couleur (ex: "brand", "blue", "red") */
  theme?: string
}

/**
 * Type helper pour construire des configs Blob manuellement dans votre code.
 *
 * Ce type élimine le besoin de `as const` sur chaque propriété grâce à l'annotation de type.
 * TypeScript infère automatiquement les types littéraux corrects pour layout, size, align, etc.
 *
 * **Architecture** :
 * - Blob est un composant Server Component réutilisable entre sites
 * - BlobConfig ne contient QUE les props du composant Blob lui-même
 * - Les appearance/background sont site-spécifiques et appliqués externally via className
 *
 * @example
 * ```tsx
 * import type { BlobConfig } from '@/lib/blob-compose'
 *
 * const config: BlobConfig = {
 *   responsive: {
 *     base: {
 *       layout: "stack",        // ✅ Auto-complétion : "stack" | "bar" | "row"
 *       size: "xl",             // ✅ Auto-complétion : "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | ...
 *       align: "center",        // ✅ Auto-complétion : "left" | "center" | "right"
 *       paddingX: "container-xl",
 *       paddingY: "2xl",
 *     },
 *     md: {
 *       size: "2xl",
 *       paddingY: "4xl",
 *     },
 *   },
 *   theme: "brand",
 * }
 *
 * <Blob {...config}>
 *   <Blob.Header>...</Blob.Header>
 * </Blob>
 * ```
 *
 * @see BlobComposableProps - Le type de base (équivalent sans className)
 * @see ResponsiveProps - Structure de l'objet responsive
 * @see ResponsiveBreakpointProps - Props disponibles par breakpoint
 */
export type BlobConfig = BlobComposableProps & {
  /** Classes CSS additionnelles (Tailwind, custom, ou appearance resolved) */
  className?: string
}

/* ── Conversion objet → string ── */

/**
 * Convertit un objet responsive en format string pour une propriété donnée
 * Ex: { xs: { layout: "stack" }, md: { layout: "row" } } → "stack md:row"
 */
export function convertResponsiveToString(
  responsiveObj: ResponsiveProps | undefined,
  propKey: keyof ResponsiveBreakpointProps
): string | undefined {
  if (!responsiveObj) return undefined

  const parts: string[] = []

  for (const bp of BREAKPOINT_ORDER) {
    const breakpointProps = responsiveObj[bp as keyof ResponsiveProps]
    const value = breakpointProps?.[propKey]

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      if (bp === "base") {
        // base values are unprefixed (mobile-first)
        parts.push(String(value))
      } else {
        // Other breakpoints get prefix
        parts.push(`${bp}:${String(value)}`)
      }
    }
  }

  return parts.length > 0 ? parts.join(" ") : undefined
}

/* ── Parser ── */

/**
 * Parse "stack md:row lg:bar" → { base: "stack", md: "row", lg: "bar" }
 * Les valeurs sans préfixe sont assignées à "base".
 */
function parseResponsiveValue<T extends string>(
  value: string | undefined,
  defaultValue?: T
): Partial<Record<string, T>> {
  if (!value) return defaultValue ? { base: defaultValue } : {}

  const parts = value.trim().split(/\s+/)
  const result: Partial<Record<string, T>> = {}

  for (const part of parts) {
    const colonIdx = part.indexOf(":")
    if (colonIdx !== -1) {
      const bp = part.slice(0, colonIdx)
      const val = part.slice(colonIdx + 1)
      result[bp] = val as T
    } else {
      result.base = part as T
    }
  }

  return result
}

/**
 * Résout toutes les combinaisons breakpoint → { layout, direction, marker, actions }
 * en propageant mobile-first les valeurs non redéfinies.
 */
function resolveBreakpoints(
  layoutStr: string | undefined,
  directionStr: string | undefined,
  markerStr: string | undefined,
  actionsStr: string | undefined
): Array<{ bp: string; layout: Layout; direction?: Direction; marker?: Marker; actions?: Action }> {
  const layoutMap = parseResponsiveValue<Layout>(layoutStr, "stack")
  const directionMap = parseResponsiveValue<Direction>(directionStr, "default")
  const markerMap = parseResponsiveValue<Marker>(markerStr)
  const actionsMap = parseResponsiveValue<Action>(actionsStr)

  const allBps = new Set([
    ...Object.keys(layoutMap),
    ...Object.keys(directionMap),
    ...Object.keys(markerMap),
    ...Object.keys(actionsMap),
  ])

  // Tri mobile-first selon l'ordre standard Tailwind
  const sorted = Array.from(allBps).sort(
    (a, b) =>
      (BREAKPOINT_ORDER.indexOf(a as Breakpoint) ?? 99) -
      (BREAKPOINT_ORDER.indexOf(b as Breakpoint) ?? 99)
  )

  const resolved: Array<{ bp: string; layout: Layout; direction?: Direction; marker?: Marker; actions?: Action }> =
    []

  let prevLayout: Layout = "stack"
  let prevDirection: Direction = "default"
  let prevMarker: Marker | undefined = undefined
  let prevActions: Action | undefined = undefined

  for (const bp of sorted) {
    const layout: Layout = layoutMap[bp] ?? prevLayout
    const direction: Direction = directionMap[bp] ?? prevDirection
    const marker: Marker | undefined = markerMap[bp] ?? prevMarker
    const actions: Action | undefined = actionsMap[bp] ?? prevActions
    resolved.push({ bp, layout, direction, marker, actions })
    prevLayout = layout
    prevDirection = direction
    prevMarker = marker
    prevActions = actions
  }

  return resolved
}

/**
 * Parse "left md:center" → "blob-align-left md:blob-align-center"
 * Normalise "/" → "-" pour les fractions (ex: "1/2" → "blob-figure-w-1-2")
 * En mode container, transforme "md:" → "@md:"
 */
function normalizeSlashes(val: string): string {
  return val.replace(/\//g, "-")
}

function parseResponsiveClass(value: string, prefix: string, containerMode = false): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => {
      const colonIdx = part.indexOf(":")
      if (colonIdx !== -1) {
        const bp = part.slice(0, colonIdx)
        const val = normalizeSlashes(part.slice(colonIdx + 1))
        // Container mode: breakpoint prefix with @
        const bpPrefix = containerMode ? `@${bp}` : bp
        return `${bpPrefix}:${prefix}-${val}`
      }
      return `${prefix}-${normalizeSlashes(part)}`
    })
    .join(" ")
}

/**
 * Compose les classes CSS pour un Blob à partir des props sémantiques.
 * Gère la syntaxe responsive Tailwind-like sur toutes les props.
 * @param props - Les propriétés du Blob
 * @param containerMode - Si true, utilise les container queries (@sm:, @md:, etc.) au lieu des media queries (sm:, md:, etc.)
 */
export function composeBlobClasses(props: BlobComposableProps, containerMode = false): string {
  const { responsive, theme } = props
  const classes: string[] = []

  // Convertir l'objet responsive en strings pour chaque propriété
  const layout = convertResponsiveToString(responsive, "layout")
  const direction = convertResponsiveToString(responsive, "direction")
  const marker = convertResponsiveToString(responsive, "marker")
  const actions = convertResponsiveToString(responsive, "actions")
  const align = convertResponsiveToString(responsive, "align")
  const figureWidth = convertResponsiveToString(responsive, "figureWidth")
  const size = convertResponsiveToString(responsive, "size")
  const gapX = convertResponsiveToString(responsive, "gapX")
  const gapY = convertResponsiveToString(responsive, "gapY")
  const paddingX = convertResponsiveToString(responsive, "paddingX")
  const paddingY = convertResponsiveToString(responsive, "paddingY")
  const headerPaddingX = convertResponsiveToString(responsive, "headerPaddingX")
  const headerPaddingY = convertResponsiveToString(responsive, "headerPaddingY")
  const figureBleed = convertResponsiveToString(responsive, "figureBleed")

  // ── Props dépendantes : layout + direction + marker + actions ──
  const breakpoints = resolveBreakpoints(layout, direction, marker, actions)

  for (const { bp, layout: l, direction: d, marker: m, actions: a } of breakpoints) {
    const key = buildRegistryKey(l, d, m, a)
    const entry = REGISTRY[key]

    if (!entry) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[Blob@${bp}] Combinaison inconnue : "${key}"`)
      }
      continue
    }

    if (!entry.valid) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[Blob@${bp}] Combinaison invalide :\n` +
            `  layout="${l}" direction="${d}" marker="${m}" actions="${a}"\n` +
            `  → ${entry.error}`
        )
      }
      continue
    }

    // base is always unprefixed (mobile-first)
    const shouldSkipPrefix = bp === "base"
    const prefix = shouldSkipPrefix ? "" : containerMode ? `@${bp}:` : `${bp}:`
    classes.push(`${prefix}${entry.className}`)
  }

  // ── Props indépendantes ──

  // Valide align et figureWidth par breakpoint contre la matrice de compatibilité
  // (inclut les contraintes croisées : ex. marker left/right → align center invalide)
  if (process.env.NODE_ENV === "development") {
    const alignMap = parseResponsiveValue<AlignValue>(align)
    const figureWidthMap = parseResponsiveValue<FigureWidthValue>(figureWidth)
    const markerMap = parseResponsiveValue<Marker>(marker)
    const actionsMap = parseResponsiveValue<Action>(actions)
    const layoutMap = parseResponsiveValue<Layout>(layout)
    const directionMap = parseResponsiveValue<Direction>(direction, "default")

    let prevLayout: Layout = "stack"
    let prevDirection: Direction = "default"
    let prevMarker: Marker | undefined = undefined
    let prevActions: Action | undefined = undefined

    for (const bp of BREAKPOINT_ORDER) {
      const l: Layout = (layoutMap[bp] as Layout) ?? prevLayout
      const d: Direction = (directionMap[bp] as Direction) ?? prevDirection
      const m: Marker | undefined = markerMap[bp] ?? prevMarker
      const a: Action | undefined = actionsMap[bp] ?? prevActions
      prevLayout = l
      prevDirection = d
      prevMarker = m
      prevActions = a

      const context: PropContext = { marker: m, actions: a }

      const alignVal = alignMap[bp]
      if (alignVal) {
        const validAligns = resolveValid(l, "align", context)
        if (!(validAligns as readonly string[]).includes(alignVal)) {
          const contextDesc = [
            m ? `marker="${m}"` : null,
            a ? `actions="${a}"` : null,
          ].filter(Boolean).join(" ")
          console.error(
            `[Blob@${bp}] align="${alignVal}" non supporté pour layout="${l}" direction="${d}"` +
            (contextDesc ? ` avec ${contextDesc}` : "") +
            `.` +
            ` Valeurs valides pour align : ${validAligns.join(", ")}`
          )
        }
      }

      const fwVal = figureWidthMap[bp]
      if (fwVal) {
        const validWidths = resolveValid(l, "figureWidth", context)
        if (validWidths.length === 0) {
          // console.error(
          //   `[Blob@${bp}] figureWidth="${fwVal}" ignoré : layout="${l}" n'a pas de slot Figure dimensionnable.`
          // )
        } else if (!(validWidths as readonly string[]).includes(fwVal)) {
          console.error(
            `[Blob@${bp}] figureWidth="${fwVal}" non supporté pour layout="${l}".` +
            ` Valeurs valides pour figureWidth : ${validWidths.join(", ")}`
          )
        }
      }
    }
  }

  if (align) classes.push(parseResponsiveClass(align, "blob-align", containerMode))
  if (figureWidth) classes.push(parseResponsiveClass(figureWidth, "blob-figure-w", containerMode))
  if (size) classes.push(parseResponsiveClass(size, "blob-size", containerMode))
  if (gapX) classes.push(parseResponsiveClass(gapX,
  "blob-gap-x", containerMode));
  if (gapY) classes.push(parseResponsiveClass(gapY, "blob-gap-y", containerMode))
  if (paddingX) classes.push(parseResponsiveClass(paddingX, "blob-padding-x", containerMode))
  if (paddingY) classes.push(parseResponsiveClass(paddingY, "blob-padding-y", containerMode))
  if (headerPaddingX) classes.push(parseResponsiveClass(headerPaddingX, "blob-header-padding-x", containerMode))
  if (headerPaddingY) classes.push(parseResponsiveClass(headerPaddingY, "blob-header-padding-y", containerMode))

  // ── Figure bleed : applique la bonne classe en fonction du layout + direction ──
  if (figureBleed) {
    const bleedClasses = computeFigureBleedClasses(figureBleed, layout, direction, containerMode)
    if (bleedClasses) classes.push(bleedClasses)
  }

  // ── Theme : applique la classe theme-{theme} ──
  if (theme) {
    classes.push(`theme-${theme}`)
  }

  return classes.join(" ")
}

/**
 * Calcule les classes de bleed en fonction du layout, direction et de la valeur de bleed.
 * - stack/bar layouts (default) : blob-figure-bleed (figure en haut)
 * - stack/bar layouts (reverse) : blob-figure-bleed-reverse (figure en bas)
 * - row layout (default) : blob-figure-bleed-row (figure à gauche)
 * - row layout (reverse) : blob-figure-bleed-row-reverse (figure à droite)
 * - none : blob-figure-bleed-none (reset)
 * Génère uniquement les classes quand layout, direction ou bleed change au breakpoint.
 */
function computeFigureBleedClasses(
  bleedValue: string,
  layoutStr: string | undefined,
  directionStr: string | undefined,
  containerMode = false
): string {
  const layoutMap = parseResponsiveValue<Layout>(layoutStr, "stack")
  const directionMap = parseResponsiveValue<Direction>(directionStr, "default")
  const bleedMap = parseResponsiveValue<FigureBleedValue>(bleedValue, "full")

  const bleedClasses: string[] = []

  let prevLayout: Layout = "stack"
  let prevDirection: Direction = "default"
  let prevBleed: FigureBleedValue = "full"
  let prevBleedClass: string | null = null

  for (const bp of BREAKPOINT_ORDER) {
    const layout: Layout = (layoutMap[bp] as Layout) ?? prevLayout
    const direction: Direction = (directionMap[bp] as Direction) ?? prevDirection
    const bleed: FigureBleedValue = bleedMap[bp] ?? prevBleed

    // Détermine la classe de bleed en fonction du layout, direction et de la valeur
    let bleedClass: string

    if (bleed === "none") {
      bleedClass = "blob-figure-bleed-none"
    } else if (layout === "row" && direction === "default") {
      bleedClass = "blob-figure-bleed-row"
    } else if (layout === "row" && direction === "reverse") {
      bleedClass = "blob-figure-bleed-row-reverse"
    } else if ((layout === "stack" || layout === "bar") && direction === "reverse") {
      // Figure en bas
      bleedClass = "blob-figure-bleed-reverse"
    } else {
      // Stack/bar layouts (figure en haut)
      bleedClass = "blob-figure-bleed"
    }

    // Ajoute la classe uniquement si elle a changé ou si c'est le premier breakpoint
    if (prevBleedClass === null || bleedClass !== prevBleedClass) {
      // base is always unprefixed
      const shouldSkipPrefix = bp === "base"
      const prefix = shouldSkipPrefix ? "" : containerMode ? `@${bp}:` : `${bp}:`
      bleedClasses.push(`${prefix}${bleedClass}`)
      prevBleedClass = bleedClass
    }

    prevLayout = layout
    prevDirection = direction
    prevBleed = bleed
  }

  return bleedClasses.join(" ")
}
