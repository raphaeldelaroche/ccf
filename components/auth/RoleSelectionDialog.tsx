'use client'

import { useUser } from '@/lib/auth/UserContext'
import type { UserRole } from '@/lib/auth/types'
import { ROLE_METADATA, ROLE_ICONS, USER_ROLES } from '@/lib/auth/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * RoleSelectionDialog - Modal that appears when user has no role set
 * Forces user to select a role before accessing the app
 */
export function RoleSelectionDialog() {
  const { user, setRole } = useUser()

  const handleSelectRole = (role: UserRole) => {
    setRole(role)
  }

  return (
    <Dialog open={!user.role} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">What kind of human are you?</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Sélectionnez votre rôle pour continuer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {USER_ROLES.map((role) => {
            const metadata = ROLE_METADATA[role]
            const emoji = ROLE_ICONS[role]

            return (
              <Card
                key={role}
                className="cursor-pointer transition-all shadow-none hover:border-gray-400"
                onClick={() => handleSelectRole(role)}
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <span className="text-3xl">{emoji}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{metadata.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {metadata.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
