/**
 * BLOB EDITOR PAGE
 *
 * Page principale de l'éditeur de contenu Blob UI.
 * Permet de créer et éditer des pages complètes avec des blocs imbriqués.
 */

import { Suspense } from "react"
import { BlobEditor } from "@/components/blob-editor/BlobEditor"

export default function BlobEditorPage() {
  return (
    <Suspense>
      <BlobEditor />
    </Suspense>
  )
}
