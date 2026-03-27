import Image from "next/image"
import type { ReactNode } from "react"

/**
 * Configuration d'un background de Blob
 *
 * Chaque background peut être rendu de deux façons :
 * - 'div' (défaut) : Rendu comme une div absolue dans le blob (pour contenu React complexe)
 * - 'class' : Appliqué comme classe CSS directement sur le conteneur Blob (pour backgrounds CSS simples)
 *
 * Plusieurs backgrounds peuvent être empilés (multiselect).
 *
 * Z-INDEX SYSTEM (rendu 'div' uniquement):
 * Le contenu du blob (marker, header, actions, content, figure) est à z-index: 10
 *
 * - zIndex ≤ 10 : Background derrière le contenu (solides, patterns, photos)
 *   Exemples: 0 (défaut), 2 (logos)
 *
 * - zIndex > 10 : Background devant le contenu (éléments décoratifs de premier plan)
 *   Exemples: 15 (lignes), 30 (plus aux coins)
 *
 * Les valeurs sont appliquées telles quelles (aucun offset).
 */
export interface BackgroundDefinition {
  /** Nom affiché dans le multiselect */
  label: string
  /** Classes CSS appliquées (à la div background ou au conteneur selon renderAs) */
  className: string
  /**
   * Ordre d'empilement (défaut: 0, plus haut = plus en avant)
   * - Valeurs ≤ 10 : Derrière le contenu du blob
   * - Valeurs > 10 : Devant le contenu du blob (décoratifs)
   * Uniquement pour renderAs: 'div'
   */
  zIndex?: number
  /** Contenu React optionnel (SVG, shapes, éléments décoratifs) - Uniquement pour renderAs: 'div' */
  content?: ReactNode
  /** Mode de rendu : 'div' (défaut, backward compatible) ou 'class' (appliqué au conteneur) */
  renderAs?: 'div' | 'class'
}

// ─── SVG data URIs ──────────────────────────────────────────────────────────

const PLUS_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M10 4v12M4 10h12' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"

const PLUS_SMALL_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 16v8M16 20h8' stroke='%23000' stroke-width='0.5' stroke-linecap='round' opacity='0.15'/%3E%3C/svg%3E"


/**
 * Registre des backgrounds disponibles
 *
 * Pour ajouter un nouveau background :
 * 1. Ajouter une entrée dans cet objet avec une clé unique
 * 2. Le background sera automatiquement disponible dans l'éditeur
 */
export const BACKGROUNDS: Record<string, BackgroundDefinition> = {
  // ─── Solides ────────────────────────────────────────────────────────────────
  solidGray: {
    label: "Fond gris",
    className: "bg-[#F7F7F7]",
    renderAs: 'class',
  },
  solidWhite: {
    label: "Fond blanc",
    className: "bg-white",
    renderAs: 'class',
  },
  solidPrimaryLight: {
    label: "Fond primaire clair",
    className: "bg-primary/20",
    renderAs: 'class',
  },
  // ─── Patterns ───────────────────────────────────────────────────────────────
  dots: {
    label: "Points",
    className: "bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)] bg-[size:20px_20px]",
  },
  gradientfromtransparentToBlackToTransparent: {
    label: "Dégradé transparent > noir > transparent",
    className: "",
    zIndex: 5,
    content: (
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at center, transparent, rgba(0, 0, 0, 0.05) 50%, transparent 100%)",
        }}
      />
    ),
  },
  grayGradientFromBottom: {
    label: "Dégradé gris depuis le bas",
    className: "",
    zIndex: 25,
    content: (
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F7F7F7] to-transparent via-[#F7F7F7]"
      />
    ),
  },
  grid: {
    label: "Quadrillage",
    className: "bg-quadrillage",
    content: (
      <div
        className="absolute inset-0 mx-auto max-w-[var(--container-2xl)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000010 1px, transparent 1px), linear-gradient(to bottom, #00000010 1px, transparent 1px)",
          backgroundSize: "calc(var(--container-2xl) / var(--blob-bg-grid-columns)) calc(var(--container-2xl) / var(--blob-bg-grid-columns))",
        }}
      />
    ),
  },
  noise: {
    label: "Bruit",
    className: "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] bg-repeat",
  },

  plusPattern: {
    label: "Petits plus",
    className: "bg-petits-plus",
    content: (
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: "0",
          right: "0",
          backgroundImage: `url("${PLUS_SMALL_SVG}")`,
          backgroundSize: "40px 40px",
          backgroundRepeat: "repeat",
        }}
      />
    ),
  },

  // ─── Décoratifs (migrés depuis appearances) ────────────────────────────────
  plusCorners: {
    label: "Plus aux coins",
    className: "bg-plus-aux-coins overflow-visible",
    zIndex: 15,
    content: (
      <div
      className="absolute inset-0"
      >
        <div
          className="absolute inset-x-4 inset-y-0 mx-auto max-w-[calc(var(--decoration-grid-container)+20px)] overflow-hidden "
          style={{
            top: -11,
            bottom: -10,
            left: -10,
            right: -10,
            backgroundImage: `url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}")`,
            backgroundSize: "20px 20px",
            backgroundPosition: "top left, top right, bottom left, bottom right",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    ),
  },
  greenPhoto: {
    label: "Photo verte",
    className: "-z-30",
    content: (
      <div className="absolute inset-0 -z-10">
        <Image
          src="/green-background-2.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
      </div>
    ),
  },
  lineSide: {
    label: "Lignes latérales",
    className: "",
    zIndex: 15,
    content: (
      <div
        className="absolute inset-0 mx-auto max-w-[var(--decoration-grid-container)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to left, var(--border) 1px, transparent 1px)",
          backgroundSize: "1px 100%, 1px 100%",
          backgroundPosition: "left top, right top",
          backgroundRepeat: "no-repeat",
        }}
      />
    ),
  },
  lineTop: {
    label: "Ligne supérieure",
    className: "",
    zIndex: 15,
    content: (
      <div
        className="absolute inset-x-0 top-0 w-full border-t"
      />
    ),
  },
  lineBottom: {
    label: "Ligne inférieure",
    className: "",
    zIndex: 15,
    content: (
      <div
        className="absolute inset-x-0 bottom-0 w-full border-b"
      />
    ),
  },
  foundersLogos: {
    label: "Logos des fondateurs",
    className: "",
    zIndex: 2,
    content: (
      <div className="absolute inset-0 mx-auto max-w-[var(--container-2xl)]">
        {/* Logo Sweep - bas gauche */}
        <div className="absolute bottom-0 xl:bottom-6 left-16 h-20 w-16 md:size-28 -mb-2">
          <Image
            src="/logos/logo-sweep.png"
            alt="Sweep"
            fill
            className="object-contain object-center"
          />
        </div>
        {/* Logo Mirova Research Center - bas droit */}
        <div className="absolute bottom-0 xl:bottom-6 right-16 h-20 w-16 md:size-28">
          <Image
            src="/logos/logo-mirova-research-center.png"
            alt="Mirova Research Center"
            fill
            className="object-contain object-center"
          />
        </div>
      </div>
    ),
  },

  timelineVerticalLine1: {
    label: "Timeline ligne verticale #1",
    className: "",
    content: (
      <div
        className="absolute top-0 left-[calc(var(--spacing-padding-x)+(var(--size-media-width)/2))] top-[var(--spacing-padding-y)] h-128 -z-10 w-px"
        style={{
          backgroundImage: "linear-gradient(to bottom, #999 10px, transparent 10px)",
          backgroundSize: "1px 20px",
          backgroundRepeat: "repeat-y"
        }}
      />
    )
  },

  timelineVerticalLineX: {
    label: "Timeline ligne verticale #X",
    className: "",
    content: (
      <div
        className="absolute top-0 left-[calc(var(--spacing-padding-x)+(var(--size-media-width)/2))] top-0 h-128 -z-10 w-px"
        style={{
          backgroundImage: "linear-gradient(to bottom, #999 10px, transparent 10px)",
          backgroundSize: "1px 20px",
          backgroundRepeat: "repeat-y"
        }}
      />
    )
  }
}

/**
 * Génère les options pour le multiselect de l'éditeur
 */
export function getBackgroundOptions(): Record<string, string> {
  return Object.entries(BACKGROUNDS).reduce((acc, [key, config]) => {
    acc[key] = config.label
    return acc
  }, {} as Record<string, string>)
}

/**
 * Normalise une valeur de background (string legacy ou string[]) en tableau.
 */
export function normalizeBackground(value?: string | string[]): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

/**
 * Résout les clés de background en tableau de BackgroundDefinition.
 * Retourne uniquement les backgrounds de type 'div' (chaque background = une div séparée).
 */
export function resolveBackgrounds(
  keys?: string | string[]
): BackgroundDefinition[] {
  const normalized = normalizeBackground(keys)
  return normalized
    .map((k) => BACKGROUNDS[k])
    .filter(Boolean)
    .filter((bg) => (bg.renderAs ?? 'div') === 'div')
}

/**
 * Résout les clés de background et retourne les classes CSS des backgrounds de type 'class'.
 * Ces classes sont appliquées directement sur le conteneur Blob.
 */
export function resolveBackgroundClasses(
  keys?: string | string[]
): string {
  const normalized = normalizeBackground(keys)
  const classBackgrounds = normalized
    .map((k) => BACKGROUNDS[k])
    .filter(Boolean)
    .filter((bg) => bg.renderAs === 'class')

  return classBackgrounds
    .map((bg) => bg.className)
    .join(' ')
}
