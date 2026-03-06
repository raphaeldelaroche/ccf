"use client"

import dynamic from "next/dynamic"

// BlockNote (ProseMirror) requires browser APIs (window, document, ContentEditable).
// `ssr: false` disables server-side rendering for this component to avoid
// "window is not defined" errors during Next.js build / SSR.
const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
})

export default function EditorPage() {
  return <Editor />
}
