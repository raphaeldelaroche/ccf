import type { ReactNode } from 'react'

/**
 * Résultat de la résolution du styling Blob.
 * Retourné par la fonction resolveBlobStyling() que chaque site doit implémenter.
 */
export interface BlobStylingResult {
  /** Background components React à rendre dans le Blob */
  backgrounds: ReactNode[]

  /** Classes CSS à appliquer au conteneur Blob */
  blobClassName?: string

  /** Classes CSS pour les compound components (optionnel) */
  headerClassName?: string
  contentClassName?: string
  actionsClassName?: string
  figureClassName?: string
  markerClassName?: string
}

/**
 * Signature de la fonction que chaque site doit implémenter dans config/blob-config.tsx
 *
 * @param background - Keys du registre backgrounds (ex: ["grid", "plusCorners"])
 * @param appearance - Keys du registre appearances (ex: ["titleLarge", "headerCentered"])
 * @returns Object contenant les backgrounds à rendre et les classes CSS à appliquer
 */
export type ResolveBlobStyling = (
  background?: string | string[],
  appearance?: string | string[]
) => BlobStylingResult
