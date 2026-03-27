import type { BlobStylingResult } from '@/lib/blob-config-contract'
import { resolveAppearances } from './blob-appearances'
import { resolveBackgrounds, resolveBackgroundClasses } from './blob-backgrounds'
import { BlobBackground } from '@/components/blob/blob-background'
import { cn } from '@/lib/utils'

/**
 * Implémentation site-spécifique de la résolution Blob styling.
 *
 * Cette fonction est appelée par le composant Blob pour résoudre
 * les backgrounds et appearances en classes CSS et composants React.
 */
export function resolveBlobStyling(
  background?: string | string[],
  appearance?: string | string[]
): BlobStylingResult {
  // Résolution background
  const backgroundDefs = background ? resolveBackgrounds(background) : []
  const backgroundClasses = background ? resolveBackgroundClasses(background) : ""

  // Résolution appearance
  const appearanceConfig = appearance ? resolveAppearances(appearance) : undefined

  // Construction des backgrounds React
  const backgrounds = backgroundDefs.length > 0
    ? [<BlobBackground key="blob-bg" backgrounds={backgroundDefs} />]
    : []

  return {
    backgrounds,
    blobClassName: cn(
      backgroundClasses,
      appearanceConfig?.blobClassName,
      backgroundDefs.length > 0 && "relative"
    ),
    headerClassName: appearanceConfig?.headerClassName,
    contentClassName: appearanceConfig?.contentClassName,
    actionsClassName: appearanceConfig?.actionsClassName,
    figureClassName: appearanceConfig?.figureClassName,
    markerClassName: appearanceConfig?.markerClassName,
  }
}
