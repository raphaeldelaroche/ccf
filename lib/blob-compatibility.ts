/* ========================================================
   BLOB — COMPATIBILITY MATRIX + REGISTRY
   ========================================================

   Source de vérité pour toutes les combinaisons
   layout / marker / actions valides ou invalides.

   RÈGLE DE NORMALISATION DES NOMS DE CLASSES :
   ─────────────────────────────────────────────
   - direction "default" → omis du nom de classe (comportement par défaut)
   - marker "top"        → omis du nom de classe (comportement par défaut)
   - actions "before"    → omis du nom de classe (comportement par défaut)

   Exemples :
     buildClassName("stack", "default", "top", "before") → "blob-stack"
     buildClassName("stack", "reverse", undefined, "after") → "blob-stack-reverse-actions-after"
     buildClassName("bar", "default", "left", "before") → "blob-bar-marker-left"
     buildClassName("row", "default", "left", "after")   → "blob-row-marker-left-actions-after"
   ======================================================== */

export const LAYOUTS = ["stack", "bar", "row"] as const
export const DIRECTIONS = ["default", "reverse"] as const
export const MARKERS = ["top", "left", "right"] as const
export const ACTIONS = ["before", "after"] as const
export const ALIGNS = ["left", "center", "right"] as const
export const FIGURE_WIDTHS = ["xs", "sm", "md", "lg", "xl", "1/4", "1/3", "1/2", "2/3", "3/4"] as const
export const SIZES = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl"] as const

export type Layout = (typeof LAYOUTS)[number]
export type Direction = (typeof DIRECTIONS)[number]
export type Marker = (typeof MARKERS)[number]
export type Action = (typeof ACTIONS)[number]
export type AlignValue = (typeof ALIGNS)[number]
export type FigureWidthValue = (typeof FIGURE_WIDTHS)[number]
export type SizeValue = (typeof SIZES)[number]

export type RegistryEntry =
  | { valid: true; className: string }
  | { valid: false; error: string }

/* ── Types pour les contraintes croisées entre props ── */

/**
 * Condition d'activation d'une contrainte.
 * Chaque clé présente est une condition (ET logique) :
 * la valeur courante de la prop doit appartenir au tableau fourni.
 */
export type ConstraintWhen = Partial<{
  marker:  readonly Marker[]
  actions: readonly Action[]
  align:   readonly AlignValue[]
}>

/**
 * Une contrainte croisée : quand `when` est satisfait,
 * les props listées sont restreintes aux valeurs indiquées.
 * Toutes les contraintes actives sont intersectées.
 */
export type Constraint = {
  when: ConstraintWhen
} & Partial<{
  marker:      readonly Marker[]
  actions:     readonly Action[]
  align:       readonly AlignValue[]
  figureWidth: readonly FigureWidthValue[]
}>

/** Contexte prop courant utilisé pour évaluer les contraintes. */
export type PropContext = Partial<{
  marker:  Marker
  actions: Action
  align:   AlignValue
}>

type CompatEntry = {
  marker:        readonly Marker[]
  /** Marker appliqué quand la prop n'est pas fournie. */
  markerDefault: Marker
  align:         readonly AlignValue[]
  /** Absent = actions non supportée sur ce layout (undefined seul valide). */
  actions?:      readonly Action[]
  /** Absent = figureWidth non supporté sur ce layout. */
  figureWidth?:  readonly FigureWidthValue[]
  /** Contraintes croisées entre props (optionnel). */
  constraints?:  readonly Constraint[]
}

type ConstrainableProp = "marker" | "align" | "actions" | "figureWidth"

/* ── Matrice de compatibilité (layout → props valides) ── */
export const COMPATIBILITY: Record<string, CompatEntry> = {
  stack: {
    marker:        ["top", "left", "right"],
    markerDefault: "top",
    actions:       ["before", "after"],
    align:         ["left", "center", "right"],
    constraints: [
      { when: { marker: ["left", "right"] }, align: ["left", "right"] },
    ],
  },
  bar: {
    marker:        ["top", "left"],
    markerDefault: "left",
    align:         ["left", "right"],
    actions:       ["before"],
  },
  row: {
    marker:        ["top"],
    markerDefault: "top",
    actions:       ["before", "after"],
    align:         ["left", "center", "right"],
    figureWidth:   [...FIGURE_WIDTHS],
  },
}

/**
 * Construit le nom de la classe CSS pour une combinaison donnée.
 * "default", "top" et "before" sont les défauts — omis du nom pour réduire le
 * nombre de classes CSS nécessaires.
 */
export function buildClassName(
  layout: Layout,
  direction?: Direction,
  marker?: Marker,
  actions?: Action
): string {
  let name = `blob-${layout}`
  if (direction && direction !== "default") name += `-${direction}`
  if (marker && marker !== "top") name += `-marker-${marker}`
  if (actions && actions !== "before") name += `-actions-${actions}`
  return name
}

/**
 * Construit la clé de lookup dans le registre (inclut toutes les valeurs
 * explicitement passées, sans normalisation).
 */
export function buildRegistryKey(
  layout: Layout,
  direction?: Direction,
  marker?: Marker,
  actions?: Action
): string {
  let key = `blob-${layout}`
  if (direction) key += `-${direction}`
  if (marker) key += `-marker-${marker}`
  if (actions) key += `-actions-${actions}`
  return key
}

/**
 * Retourne toutes les classes CSS uniques (normalisées) produites par
 * le système. Ce sont les noms à définir via @utility dans le CSS.
 */
export function getUniqueCSSClasses(): string[] {
  const classes = new Set<string>()
  for (const layout of LAYOUTS) {
    const compat = COMPATIBILITY[layout]
    const markerOptions = [undefined, ...compat.marker] as (Marker | undefined)[]
    const actionOptions = [undefined, ...(compat.actions ?? [])] as (Action | undefined)[]
    for (const direction of [undefined, ...DIRECTIONS] as (Direction | undefined)[]) {
      for (const marker of markerOptions) {
        for (const action of actionOptions) {
          classes.add(buildClassName(layout, direction, marker, action))
        }
      }
    }
  }
  return Array.from(classes)
}

/**
 * Génère le registre complet : mappe chaque clé de lookup vers
 * { valid: true, className } ou { valid: false, error }.
 */
/**
 * Résout les valeurs valides pour une prop donnée en tenant compte
 * des contraintes croisées actives (celles dont le `when` matche le contexte).
 *
 * Comportement : intersection — toutes les contraintes actives s'appliquent,
 * seul l'ensemble commun est retourné.
 *
 * @example
 *   resolveValid("stack", "align", { marker: "left" })
 *   // → ["left", "right"]  ("center" exclu par contrainte)
 *
 *   resolveValid("stack", "align", { marker: "top" })
 *   // → ["left", "center", "right"]  (aucune contrainte active)
 */
export function resolveValid(
  layout: Layout,
  prop: ConstrainableProp,
  context: PropContext
): readonly string[] {
  const compat = COMPATIBILITY[layout]
  const base = (compat[prop as keyof typeof compat] ?? []) as readonly string[]
  const constraints = compat.constraints

  if (!constraints?.length) return base

  let result: string[] = [...base]

  for (const constraint of constraints) {
    // Vérifie si TOUTES les conditions du `when` sont satisfaites
    const matches = (
      Object.entries(constraint.when) as [keyof ConstraintWhen, readonly string[]][]
    ).every(([key, allowed]) => {
      const ctxVal = context[key]
      // Si la prop de contexte n'est pas définie, la contrainte ne s'applique pas
      if (ctxVal === undefined) return false
      return (allowed as readonly string[]).includes(ctxVal)
    })

    if (!matches) continue

    const restriction = (constraint as unknown as Record<string, readonly string[]>)[prop]
    if (restriction) {
      // Intersection : seules les valeurs communes restent
      result = result.filter((v) => restriction.includes(v))
    }
  }

  return result
}

/**
 * Vérifie toutes les props contraintes après n'importe quel changement
 * et retourne un patch des corrections évidentes.
 *
 * S'applique quel que soit la prop modifiée (layout, markerPosition, etc.).
 * La correction est toujours "évidente" : valeur hors de la liste valide
 * → première valeur valide, ou "" si la prop n'est pas supportée sur ce layout.
 *
 * Mapping propSchema → matrice de compatibilité :
 *   props.markerPosition → compat.marker       (default: compat.markerDefault)
 *   props.actions        → compat.actions      (default: "")
 *   props.align          → compat.align        via resolveValid (cross-constraints)
 *   props.figureWidth    → compat.figureWidth  (default: "" si absent)
 */
export function autocorrectProps(
  currentProps: Record<string, unknown>
): Record<string, string> {
  const layout = (currentProps.layout as string) || "stack"
  const compat = COMPATIBILITY[layout]
  if (!compat) return {}

  const patch: Record<string, string> = {}

  // Build the PropContext for resolveValid (uses markerPosition → "marker")
  const context: PropContext = {
    marker:  currentProps.markerPosition as Marker | undefined,
    actions: currentProps.actions as Action | undefined,
    align:   currentProps.align as AlignValue | undefined,
  }

  // ── markerPosition ──────────────────────────────────────────────────────
  const markerPos = currentProps.markerPosition as string | undefined
  if (markerPos) {
    const valid = resolveValid(layout as Layout, "marker", context)
    if (!valid.includes(markerPos)) {
      patch.markerPosition = compat.markerDefault
    }
  }

  // ── actions ─────────────────────────────────────────────────────────────
  const actions = currentProps.actions as string | undefined
  if (actions && actions !== "") {
    const valid = resolveValid(layout as Layout, "actions", context)
    if (!valid.includes(actions)) {
      patch.actions = ""
    }
  }

  // ── align ───────────────────────────────────────────────────────────────
  // Re-evaluate with the (possibly patched) markerPosition for cross-constraints
  const alignContext: PropContext = {
    ...context,
    marker: (patch.markerPosition ?? context.marker) as Marker | undefined,
  }
  const align = currentProps.align as string | undefined
  if (align) {
    const valid = resolveValid(layout as Layout, "align", alignContext)
    if (!valid.includes(align)) {
      patch.align = valid[0] as string
    }
  }

  // ── figureWidth ─────────────────────────────────────────────────────────
  const figureWidth = currentProps.figureWidth as string | undefined
  if (figureWidth && figureWidth !== "") {
    const valid = resolveValid(layout as Layout, "figureWidth", context)
    if (!compat.figureWidth || !valid.includes(figureWidth)) {
      patch.figureWidth = ""
    }
  }

  return patch
}

export function generateRegistry(): Record<string, RegistryEntry> {
  const registry: Record<string, RegistryEntry> = {}

  for (const layout of LAYOUTS) {
    const compat = COMPATIBILITY[layout]

    // Combinaisons valides — marker × actions permises
    const markerOptions = [undefined, ...compat.marker] as (Marker | undefined)[]
    const actionOptions = [undefined, ...(compat.actions ?? [])] as (Action | undefined)[]

    for (const direction of [undefined, ...DIRECTIONS] as (Direction | undefined)[]) {

      for (const marker of markerOptions) {
        for (const action of actionOptions) {
          const key = buildRegistryKey(layout, direction, marker, action)
          const className = buildClassName(layout, direction, marker, action)
          registry[key] = { valid: true, className }
        }
      }

      // Invalides — markers incompatibles
      for (const marker of MARKERS) {
        if (!compat.marker.includes(marker)) {
          for (const action of [undefined, ...ACTIONS] as (Action | undefined)[]) {
            const key = buildRegistryKey(layout, direction, marker, action)
            const displayLayout = direction === "reverse" ? `${layout}-${direction}` : layout
            registry[key] = {
              valid: false,
              error: `marker="${marker}" n'est pas compatible avec layout="${displayLayout}". Markers valides : ${compat.marker.join(", ")}`,
            }
          }
        }
      }

      // Invalides — actions non supportées sur ce layout (absent ou non listée)
      for (const action of ACTIONS) {
        if (!compat.actions || !compat.actions.includes(action)) {
          for (const marker of [undefined, ...MARKERS] as (Marker | undefined)[]) {
            const key = buildRegistryKey(layout, direction, marker, action)
            if (!registry[key] || registry[key].valid) {
              const displayLayout = direction === "reverse" ? `${layout}-${direction}` : layout
              registry[key] = {
                valid: false,
                error: `actions="${action}" n'est pas supporté sur layout="${displayLayout}".`,
              }
            }
          }
        }
      }
    }
  }

  return registry
}

