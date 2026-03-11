import { Suspense } from "react"
import { NewEditor } from "@/components/new-editor/NewEditor"

export default function NewEditorPage() {
  return (
    <Suspense>
      <NewEditor />
    </Suspense>
  )
}
