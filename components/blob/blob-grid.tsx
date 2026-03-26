import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export type GridColumns = "1" | "2" | "3" | "4" | "5" | "6" | "auto"
export type SizeValue = "none" | "auto" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl"
export type PaddingValue = SizeValue | "container-sm" | "container-md" | "container-lg" | "container-xl" | "container-2xl"

interface BlobGridProps {
  children: ReactNode
  columns?: GridColumns
  responsiveLayout?: string
  paddingX?: PaddingValue; paddingY?: SizeValue
  gapX?: SizeValue; gapY?: SizeValue
  className?: string
}

/**
 * BlobGrid - Server Component pour afficher des blobs en grille
 *
 * @param columns - Nombre de colonnes (1-4) ou "auto" pour auto-fit
 * @param paddingX - Espacement externe horizontal
 * @param paddingY - Espacement externe vertical
 * @param gapX - Espacement interne horizontal entre les éléments
 * @param gapY - Espacement interne vertical entre les éléments
 * @param className - Classes CSS supplémentaires
 */
export function BlobGrid({
  children,
  columns = "auto",
  responsiveLayout,
  paddingX,
  paddingY,
  gapX,
  gapY,
  className
}: BlobGridProps) {
  return (
    <div
      data-slot="blob-grid"
      className={cn(
        responsiveLayout ?? `blob-iterator-grid-${columns}`,
        paddingX && paddingX !== "auto" && `blob-padding-x-${paddingX}`,
        paddingY && paddingY !== "auto" && `blob-padding-y-${paddingY}`,
        gapX && gapX !== "auto" && `blob-gap-x-${gapX}`,
        gapY && gapY !== "auto" && `blob-gap-y-${gapY}`,
        className
      )}
    >
      {children}
    </div>
  )
}
