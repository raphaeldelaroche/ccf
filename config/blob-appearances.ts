// removed unused import: negative from zod

/**
 * Configuration d'une apparence de Blob
 *
 * Une apparence définit uniquement des classes CSS pour le Blob et ses sous-composants.
 * Elle ne modifie PAS les props de comportement/layout du Blob.
 */
export interface AppearanceDefinition {
  /** Nom affiché dans le dropdown de la playground */
  label: string;

  /** Classes Tailwind appliquées au composant Blob principal */
  blobClassName?: string;

  /** Classes Tailwind appliquées à Blob.Figure (images/vidéos) */
  figureClassName?: string;

  /** Classes Tailwind appliquées à Marker */
  markerClassName?: string;

  /** Classes Tailwind appliquées à Blob.Header */
  headerClassName?: string;

  /** Classes Tailwind appliquées à Blob.Content */
  contentClassName?: string;

  /** Classes Tailwind appliquées à Blob.Actions */
  actionsClassName?: string;
}

/**
 * Registre des apparences disponibles
 *
 * Pour ajouter une nouvelle apparence :
 * 1. Ajouter une entrée dans cet objet avec une clé unique
 * 2. L'apparence sera automatiquement disponible dans la playground
 */
export const APPEARANCES: Record<string, AppearanceDefinition> = {
  default: {
    label: "Par défaut",
    blobClassName: "",
  },
  list: {
    label: "Liste",
    blobClassName: "mb-1",
    markerClassName: "stroke-2 w-auto h-auto",
    headerClassName: "[&_[data-slot='title']]:font-medium",
  },
  borderedGrid: {
    label: "Grille bordée",
    blobClassName: "[&_>[data-slot='blob-grid']]:gap-px bg-border",
  },
  card: {
    label: "Carte",
    blobClassName: "bg-white border border-gray-200 rounded-lg shadow-sm",
  },
  rounded: {
    label: "Arrondi",
    blobClassName: "rounded-lg overflow-hidden",
  },
  borderBottom: {
    label: "Bordure inférieure",
    blobClassName: "border-b",
  },
  outlined: {
    label: "Contour",
    blobClassName: "bg-white border rounded-lg overflow-hidden",
  },
  markerGridLines: {
    label: "Marqueur : Lignes de repère",
    markerClassName: "marker-grid-lines",
  },
  scorecardSectionItem: {
    label: "Scorecard : Section item",
    blobClassName: "!pb-0",
    figureClassName: "aspect-[5/6] [&_img]:object-contain [&_img]:object-bottom flex items-end",
  },
  stackedActions: {
    label: "Actions empilées",
    actionsClassName: "flex-col items-start gap-2 [&_[data-slot='button']]:w-full",
  },
  parnersSwiper: {
    label: "Partenaires : Swiper",
    figureClassName: "[&_img]:h-24 [&_img]:object-contain [&_img]:object-center grayscale",
  },
  subtitleOffset: {
    label: "Sous-titre décalé",
    headerClassName: "md:[&_>[data-slot='title']]:mr-[calc(100%/5)] md:[&_>[data-slot='subtitle']]:ml-[calc(100%/2)] xl:[&_>[data-slot='subtitle']]:ml-[calc(var(--container-xl)/2)]"
  },
  ratio2to1: {
    label: "Ratio 2/1",
    blobClassName: "2xl:min-h-[calc(var(--container-2xl)/2)]",
    actionsClassName: "!self-start mt-6"
  },
  largePaddingTop: {
    label: "Grande marge au-dessus",
    blobClassName: "pt-[calc(var(--spacing-padding-y)*1.5)]"
  },
  largePaddingBottom: {
    label: "Grande marge en-dessous",
    blobClassName: "pb-[calc(var(--spacing-padding-y)*2)]"
  },
  headerWidthTwoThirds: {
    label: "Header : Largeur 2/3",
    headerClassName: "max-w-[calc(var(--container-xl)/3*2)]"
  },
  actionsOffsetMarker: {
    label: "Actions : Décalage aligné sur marker",
    actionsClassName: "!pl-[calc(var(--size-media-width)+var(--spacing-section))]"
  },
  gridTwoColumnsLikeContainer: {
    // Ici, on cherche à appliquer un pading latéral aux 2 colonnes de la grille pour faire comme si elles étaient dans un --container-xl
    label: "Grille 2 colonnes avec padding comme container",
    blobClassName: "xl:[&_[data-slot='blob-grid']_>[data-slot='blob']:first-child]:pl-[calc((100vw-var(--container-xl))/2)] xl:[&_[data-slot='blob-grid']_>[data-slot='blob']:last-child]:pr-[calc((100vw-var(--container-xl))/2)]",
  },
  gridThreeColumnsLikeContainer: {
    // Grille 3 colonnes : override grid-template-columns + padding latéral pour simuler un container-xl
    label: "Grille 3 colonnes avec padding comme container",
    blobClassName: "xl:[&_[data-slot='blob-grid']]:grid-cols-[minmax(0,1fr)_calc(var(--container-2xl)/3)_minmax(0,1fr)] xl:[&_[data-slot='blob-grid']_>[data-slot='blob']:first-child]:pl-[calc((100vw-var(--container-xl))/2)] xl:[&_[data-slot='blob-grid']_>[data-slot='blob']:last-child]:pr-[calc((100vw-var(--container-xl))/2)]",
  },
  zIndexBelow: {
    label: "Z-index : en dessous",
    blobClassName: "z-[-1]",
  },
  fontMono: {
    label: "Police monospace",
    blobClassName: "font-mono font-[90%]",
  },
  markerOutlinePrimary: {
    label: "Marqueur : contour primaire",
    markerClassName: "border border-primary/50 text-primary-foreground",
  },
  borderPrimary: {
    label: "Contour primaire",
    blobClassName: "border border-primary/50",
  },
  eyebrowAsBadge: {
    label: "Surtitre : style badge",
    headerClassName: "[&_>[data-slot='eyebrow']]:inline-block [&_[data-slot='eyebrow']]:bg-white [&_[data-slot='eyebrow']]:text-foreground [&_[data-slot='eyebrow']]:px-[1.25em] [&_[data-slot='eyebrow']]:py-[0.5em] [&_[data-slot='eyebrow']]:rounded-full [&_[data-slot='eyebrow']]:text-xs [&_[data-slot='eyebrow']]:mb-3",
  },
  eyebrowBadgePrimary: {
    label: "Surtitre : badge primaire",
    headerClassName: "[&_>[data-slot='eyebrow']]:inline-block [&_[data-slot='eyebrow']]:bg-primary [&_[data-slot='eyebrow']]:text-primary-foreground",
  },
  eyebrowBadgeOutline: {
    label: "Surtitre : badge contour",
    headerClassName: "[&_>[data-slot='eyebrow']]:inline-block [&_[data-slot='eyebrow']]:border [&_[data-slot='eyebrow']]:border-border [&_[data-slot='eyebrow']]:text-foreground",
  },
  markerTextMono: {
    label: "Marqueur : Texte monospace",
    markerClassName: "font-mono",
  },
  layoutRowAlignCenter: {
    label: "Layout row : aligné en haut",
    blobClassName: "blob-layout-row-align-center",
  },
  negativeMarinTop: {
    label: "Marge négative en haut",
    blobClassName: "lg:-mt-26 xl:-mt-32 2xl:-mt-32",
  },
};

/**
 * Génère les options pour le dropdown de la playground
 */
export function getAppearanceOptions(): Record<string, string> {
  return Object.entries(APPEARANCES).reduce((acc, [key, config]) => {
    acc[key] = config.label;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Résout une clé d'apparence en AppearanceDefinition.
 * Retourne `fallback` (ou `APPEARANCES.default`) si la clé est invalide/absente.
 */
export function resolveAppearance(
  key?: string,
  fallback?: AppearanceDefinition
): AppearanceDefinition {
  if (key && APPEARANCES[key]) return APPEARANCES[key];
  return fallback ?? APPEARANCES.default;
}

/**
 * Normalise une valeur d'apparence (string legacy ou string[]) en tableau.
 */
export function normalizeAppearance(value?: string | string[]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/**
 * Fusionne plusieurs AppearanceDefinition en une seule.
 * Les classes CSS de chaque slot sont concaténées dans l'ordre.
 * Retourne `fallback` (ou APPEARANCES.default) si aucune clé valide.
 */
export function resolveAppearances(
  keys?: string | string[],
  fallback?: AppearanceDefinition
): AppearanceDefinition {
  const normalized = normalizeAppearance(keys);
  const validDefs = normalized
    .map((k) => APPEARANCES[k])
    .filter(Boolean);

  if (validDefs.length === 0) return fallback ?? APPEARANCES.default;
  if (validDefs.length === 1) return validDefs[0];

  const slots = [
    "blobClassName",
    "figureClassName",
    "markerClassName",
    "headerClassName",
    "contentClassName",
    "actionsClassName",
  ] as const;

  const merged: AppearanceDefinition = {
    label: validDefs.map((d) => d.label).join(" + "),
  };

  for (const slot of slots) {
    const classes = validDefs.map((d) => d[slot]).filter(Boolean).join(" ");
    if (classes) {
      merged[slot] = classes;
    }
  }

  return merged;
}
