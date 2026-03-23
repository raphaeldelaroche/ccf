import Image from "next/image"
import type { ReactNode } from "react"

/**
 * Configuration d'un background de Blob
 *
 * Chaque background est rendu comme une div absolue dans le blob.
 * Plusieurs backgrounds peuvent être empilés (multiselect).
 */
export interface BackgroundDefinition {
  /** Nom affiché dans le multiselect */
  label: string
  /** Classes CSS appliquées à la div background */
  className: string
  /** Ordre d'empilement (défaut: 0, plus bas = plus en arrière) */
  zIndex?: number
  /** Contenu React optionnel (SVG, shapes, éléments décoratifs) */
  content?: ReactNode
}

// ─── SVG data URIs ──────────────────────────────────────────────────────────

const PLUS_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M6 2v8M2 6h8' stroke='%23000' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"

const PLUS_SMALL_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 18v4M18 20h4' stroke='%23000' stroke-width='0.5' stroke-linecap='round' opacity='0.15'/%3E%3C/svg%3E"


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
  },
  solidWhite: {
    label: "Fond blanc",
    className: "bg-white",
  },
  // ─── Patterns ───────────────────────────────────────────────────────────────
  dots: {
    label: "Points",
    className: "bg-[radial-gradient(circle,_#00000010_1px,_transparent_1px)] bg-[size:20px_20px]",
  },
  grid: {
    label: "Quadrillage",
    className: "",
    content: (
      <div
        className="absolute inset-0 mx-auto max-w-[var(--container-xl)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000010 1px, transparent 1px), linear-gradient(to bottom, #00000010 1px, transparent 1px)",
          backgroundSize: "calc(var(--container-xl) / var(--blob-bg-grid-columns)) calc(var(--container-xl) / var(--blob-bg-grid-columns))",
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
    className: "",
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
    className: "overflow-visible",
    zIndex: 20,
    content: (
      <div
      className="absolute inset-0 mx-auto max-w-[calc(var(--container-xl))]"
      >
        <div
          className="absolute -inset-x-1.5 inset-y-0 overflow-hidden "
          style={{
            top: -7,
            bottom: -6,
            backgroundImage: `url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}"), url("${PLUS_SVG}")`,
            backgroundSize: "12px 12px",
            backgroundPosition: "top left, top right, bottom left, bottom right",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    ),
  },
  greenPhoto: {
    label: "Photo verte",
    className: "-z-10",
    content: (
      <Image
        src="/green-background.jpg"
        alt=""
        fill
        className="object-cover object-center"
      />
    ),
  },
  lineSide: {
    label: "Lignes latérales",
    className: "",
    zIndex: 1,
    content: (
      <div
        className="absolute inset-0 mx-auto max-w-[var(--container-xl)]"
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
 * Retourne un tableau (chaque background = une div séparée).
 */
export function resolveBackgrounds(
  keys?: string | string[]
): BackgroundDefinition[] {
  const normalized = normalizeBackground(keys)
  return normalized
    .map((k) => BACKGROUNDS[k])
    .filter(Boolean)
}
