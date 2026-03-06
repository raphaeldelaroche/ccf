// BlockNote requires its own CSS (component styles + Inter font).
// These imports are placed here, in the /editor route layout, so the styles
// are only included in the bundle chunk for this route and not loaded upfront
// by the root layout on every page.
import "@blocknote/shadcn/style.css"
import "@blocknote/core/fonts/inter.css"

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
