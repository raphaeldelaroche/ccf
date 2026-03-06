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
  card: {
    label: "Carte",
    blobClassName: "bg-white border border-gray-200 rounded-lg shadow-sm",
  },
  cardElevated: {
    label: "Carte élevée",
    blobClassName: "bg-white rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10",
  },
  glassmorphism: {
    label: "Glassmorphism",
    blobClassName: "bg-white/40 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl shadow-purple-800/5",
    figureClassName: "[&_>img]:rounded-2xl [&_>img]:shadow-xl [&_>img]:shadow-purple-800/5",
    markerClassName: "rounded-[30%] shadow-xl shadow-purple-800/10",
    actionsClassName : "[&_>[data-slot='button']]:rounded-full [&_>[data-slot='button']]:shadow-xl [&_>[data-slot='button']]:shadow-purple-800/10"
  },
  figma: {
    label: "Figma",
    blobClassName: "[&_[data-slot='subtitle']]:text-black [&_[data-slot='subtitle']]:font-medium rounded-lg overflow-hidden border-2 border-black",
    figureClassName: "[&_>img]:border-b-2 [&_>img]:border-black",
    actionsClassName : "[&_>[data-slot='button'][data-variant='outline']]:rounded-lg [&_>[data-slot='button'][data-variant='outline']]:border-2 [&_>[data-slot='button'][data-variant='outline']]:border-black",
    contentClassName: "[&_*]:!text-black [&_*]:!font-bold",
  },
  neoBrutalism: {
    label: "Néo-Brutalisme",
    blobClassName: "bg-white border-2 border-black rounded-lg overflow-hidden shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
    figureClassName: "[&_>img]:border-b-2 [&_>img]:border-black",
    markerClassName: "rounded-lg font-bold",
    headerClassName: "[&_[data-slot='subtitle']]:text-black [&_[data-slot='subtitle']]:font-semibold",
    contentClassName: "[&_*]:!text-black [&_*]:!font-bold",
    actionsClassName : "[&_>[data-slot='button'][data-variant='outline']]:rounded-lg [&_>[data-slot='button'][data-variant='outline']]:border-2 [&_>[data-slot='button'][data-variant='outline']]:border-black [&_>[data-slot='button'][data-variant='outline']]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
  },
  outlined: {
    label: "Contour",
    blobClassName: "bg-white border rounded-lg overflow-hidden",
  },

  minimal: {
    label: "Minimal",
    blobClassName: "bg-white",
  },

  // ─── Nouvelles apparences inspirées du design moderne ───

  neonSection: {
    label: "Section Néon",
    blobClassName: "bg-lime-300",
    headerClassName: "text-gray-900",
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
