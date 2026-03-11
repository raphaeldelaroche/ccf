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
type Breakpoint = (typeof BREAKPOINT_ORDER)[number]

export type { AlignValue, FigureWidthValue, SizeValue } from "@/lib/blob-compatibility"

/* ── Responsive value types ── */
type ResponsiveValue<T extends string> = string & { __brand?: T }

export type FigureBleedValue = "full" | "none"

export type BlobComposableProps = {
  /** Layout responsive (ex: "stack md:row lg:bar") */
  layout?: ResponsiveValue<Layout>
  /** Direction responsive (ex: "default md:reverse") */
  direction?: ResponsiveValue<Direction>
  /** Position du marker (ex: "top md:left") */
  marker?: ResponsiveValue<Marker>
  /** Position des actions (ex: "after") */
  actions?: ResponsiveValue<Action>
  /** Alignement (ex: "left md:center") */
  align?: ResponsiveValue<AlignValue>
  /** Largeur de la figure dans les layouts row/row-reverse (ex: "md:1-3") */
  figureWidth?: ResponsiveValue<FigureWidthValue>
  /** Taille (ex: "md" ou "sm lg:xl") */
  size?: ResponsiveValue<SizeValue>
  /** Gutter - gap entre les enfants (override de size, ex: "xs sm:md") */
  gapX?: ResponsiveValue<SizeValue>; gapY?: ResponsiveValue<SizeValue>
  /** Padding inline du container (ex: "xs sm:md") */
  paddingX?: ResponsiveValue<SizeValue | "container-sm" | "container-md" | "container-lg" | "container-xl" | "container-2xl">
  /** Padding block du container (ex: "xs sm:md") */
  paddingY?: ResponsiveValue<SizeValue>
  /** Padding inline du header uniquement (ex: "xs sm:md" ou "container-lg") */
  headerPaddingX?: ResponsiveValue<SizeValue | "container-sm" | "container-md" | "container-lg" | "container-xl" | "container-2xl">
  /** Padding block du header uniquement (ex: "xs sm:md") */
  headerPaddingY?: ResponsiveValue<SizeValue | "container-sm" | "container-md" | "container-lg" | "container-xl" | "container-2xl">
  /** Figure bleed - débordement de la figure sur le padding (ex: "full" ou "none md:full") */
  figureBleed?: ResponsiveValue<FigureBleedValue>
  /** Thème de couleur (ex: "brand", "blue", "red") */
  theme?: string
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
 */
function normalizeSlashes(val: string): string {
  return val.replace(/\//g, "-")
}

function parseResponsiveClass(value: string, prefix: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => {
      const colonIdx = part.indexOf(":")
      if (colonIdx !== -1) {
        const bp = part.slice(0, colonIdx)
        const val = normalizeSlashes(part.slice(colonIdx + 1))
        return `${bp}:${prefix}-${val}`
      }
      return `${prefix}-${normalizeSlashes(part)}`
    })
    .join(" ")
}

/**
 * Compose les classes CSS pour un Blob à partir des props sémantiques.
 * Gère la syntaxe responsive Tailwind-like sur toutes les props.
 */
export function composeBlobClasses(props: BlobComposableProps): string {
  const { layout, direction, marker, actions, align, figureWidth, size, gapX,
  gapY, paddingX, paddingY, headerPaddingX, headerPaddingY, figureBleed, theme } = props
  const classes: string[] = []

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

    const prefix = bp === "base" ? "" : `${bp}:`
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

  if (align) classes.push(parseResponsiveClass(align, "blob-align"))
  if (figureWidth) classes.push(parseResponsiveClass(figureWidth, "blob-figure-w"))
  if (size) classes.push(parseResponsiveClass(size, "blob-size"))
  if (gapX) classes.push(parseResponsiveClass(gapX,
  "blob-gap-x"));
  if (gapY) classes.push(parseResponsiveClass(gapY, "blob-gap-y"))
  if (paddingX) classes.push(parseResponsiveClass(paddingX, "blob-padding-x"))
  if (paddingY) classes.push(parseResponsiveClass(paddingY, "blob-padding-y"))
  if (headerPaddingX) classes.push(parseResponsiveClass(headerPaddingX, "blob-header-padding-x"))
  if (headerPaddingY) classes.push(parseResponsiveClass(headerPaddingY, "blob-header-padding-y"))

  // ── Figure bleed : applique la bonne classe en fonction du layout + direction ──
  if (figureBleed) {
    const bleedClasses = computeFigureBleedClasses(figureBleed, layout, direction)
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
  directionStr: string | undefined
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
      const prefix = bp === "base" ? "" : `${bp}:`
      bleedClasses.push(`${prefix}${bleedClass}`)
      prevBleedClass = bleedClass
    }

    prevLayout = layout
    prevDirection = direction
    prevBleed = bleed
  }

  return bleedClasses.join(" ")
}
