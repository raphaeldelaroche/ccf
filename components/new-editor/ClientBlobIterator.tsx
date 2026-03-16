"use client"

import { BlobIterator, type BlobIteratorProps } from "@/components/blob/blob-iterator"
import { usePreview } from "./PreviewContext"

/**
 * Version client de BlobIterator pour l'éditeur.
 * Active automatiquement les container queries quand isPreviewMode est true.
 */
export function ClientBlobIterator(props: BlobIteratorProps) {
  const { isPreviewMode } = usePreview()
  return <BlobIterator {...props} useContainerQueries={isPreviewMode} />
}
