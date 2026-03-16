"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { composeBlobClasses, type BlobComposableProps } from "@/lib/blob-compose"
import { usePreview } from "./PreviewContext"

type ClientBlobProps = React.ComponentProps<"div"> & BlobComposableProps

/**
 * Version client du composant Blob pour l'éditeur.
 * Lit isPreviewMode depuis PreviewContext pour activer automatiquement
 * les container queries (@sm:, @md:, etc.) en mode preview responsive.
 * Le composant Blob de production (blob.tsx) reste un Server Component pur.
 */
export function ClientBlob({ className, responsive, theme, children, ...props }: ClientBlobProps) {
  const { isPreviewMode } = usePreview()
  const composedClasses = composeBlobClasses({ responsive, theme }, isPreviewMode)

  return (
    <div
      data-slot="blob"
      data-preview-mode={String(isPreviewMode)}
      className={cn("w-full text-foreground", composedClasses, className)}
      {...props}
    >
      {children}
    </div>
  )
}
