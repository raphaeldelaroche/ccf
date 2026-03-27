/**
 * LAYOUT NEW EDITOR
 *
 * Layout spécifique pour la route /new-editor.
 * Inclut le UserProvider et RoleSelectionDialog nécessaires pour l'éditeur.
 */

import { UserProvider } from "@/lib/auth/UserContext"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"

export default function NewEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <RoleSelectionDialog />
      {children}
    </UserProvider>
  )
}
