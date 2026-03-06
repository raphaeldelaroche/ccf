import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export type GridColumns = "1" | "2" | "3" | "4" | "auto"
export type SizeValue = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | "10xl"

interface BlobGridProps {
  children: ReactNode
  columns?: GridColumns
  gutter?: SizeValue
  className?: string
}

/**
 * BlobGrid - Server Component pour afficher des blobs en grille
 *
 * @param columns - Nombre de colonnes (1-4) ou "auto" pour auto-fit
 * @param gutter - Espacement entre les éléments (tokens de taille, via blob-gutter-*)
 * @param className - Classes CSS supplémentaires
 */
export function BlobGrid({
  children,
  columns = "auto",
  gutter,
  className
}: BlobGridProps) {
  return (
    <div
      data-slot="blob-grid"
      className={cn(
        `blob-iterator-grid-${columns}`,
        gutter && `blob-gutter-${gutter}`,
        className
      )}
    >
      {children}
    </div>
  )
}
