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
    blobClassName: "bg-white",
  },
  list: {
    label: "Liste",
    blobClassName: "mb-1",
    markerClassName: "stroke-2 w-auto h-auto",
    headerClassName: "[&_[data-slot='title']]:font-medium",
  },
  borderedGrid: {
    label: "Grille bordée",
    blobClassName: "[&_>[data-slot='blob-grid']]:p-px [&_>[data-slot='blob-grid']]:gap-px bg-border",
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
