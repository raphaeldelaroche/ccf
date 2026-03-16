import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export type GridColumns = "1" | "2" | "3" | "4" | "5" | "6" | "auto"
export type SizeValue = "none" | "auto" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl"

interface BlobGridProps {
  children: ReactNode
  columns?: GridColumns
  responsiveLayout?: string
  gapX?: SizeValue; gapY?: SizeValue
  className?: string
}

/**
 * BlobGrid - Server Component pour afficher des blobs en grille
 *
 * @param columns - Nombre de colonnes (1-4) ou "auto" pour auto-fit
 * @param gapX - X gap. @param gapY - Espacement entre les éléments (tokens de taille, via blob-gutter-*)
 * @param className - Classes CSS supplémentaires
 */
export function BlobGrid({
  children,
  columns = "auto",
  responsiveLayout,
  gapX,
  gapY,
  className
}: BlobGridProps) {
  return (
    <div
      data-slot="blob-grid"
      className={cn(
        responsiveLayout ?? `blob-iterator-grid-${columns}`,
        gapX && gapX !== "auto" && `blob-gap-x-${gapX}`,
        gapY && gapY !== "auto" && `blob-gap-y-${gapY}`,
        className
      )}
    >
      {children}
    </div>
  )
}
