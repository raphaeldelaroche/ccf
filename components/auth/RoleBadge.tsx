'use client'

import { useUser } from '@/lib/auth/UserContext'
import { ROLE_METADATA, ROLE_ICONS, USER_ROLES } from '@/lib/auth/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import type { UserRole } from '@/lib/auth/types'

/**
 * RoleBadge - Display current user role with option to change it
 */
export function RoleBadge() {
  const { user, setRole, clearRole } = useUser()

  if (!user.role) return null

  const metadata = ROLE_METADATA[user.role]
  const emoji = ROLE_ICONS[user.role]

  const handleChangeRole = (newRole: UserRole) => {
    setRole(newRole)
  }

  const handleClearRole = () => {
    clearRole()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span>{emoji}</span>
          {metadata.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Rôle actuel</DropdownMenuLabel>
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {metadata.description}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Changer de rôle</DropdownMenuLabel>
        {USER_ROLES.map((role) => {
          if (role === user.role) return null
          const roleMetadata = ROLE_METADATA[role]
          const roleEmoji = ROLE_ICONS[role]
          return (
            <DropdownMenuItem key={role} onClick={() => handleChangeRole(role)}>
              <span className="mr-2">{roleEmoji}</span>
              <span>{roleMetadata.label}</span>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleClearRole} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Réinitialiser le rôle</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
