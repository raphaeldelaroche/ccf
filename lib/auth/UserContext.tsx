'use client'

import React, { createContext, useContext, useState, useSyncExternalStore } from 'react'
import type { User, UserRole, Permission } from './types'
import { ROLE_PERMISSIONS, USER_ROLE_STORAGE_KEY } from './types'

interface UserContextType {
  user: User
  setRole: (role: UserRole) => void
  hasPermission: (permission: Permission) => boolean
  clearRole: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// External store for localStorage synchronization
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot(): UserRole | null {
  if (typeof window === 'undefined') return null
  const storedRole = localStorage.getItem(USER_ROLE_STORAGE_KEY)
  if (storedRole && (storedRole === 'engineer' || storedRole === 'editor' || storedRole === 'reviewer')) {
    return storedRole as UserRole
  }
  return null
}

function getServerSnapshot(): UserRole | null {
  return null
}

/**
 * UserProvider - Manages user role state and localStorage persistence
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore to avoid hydration mismatch
  const storedRole = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [user, setUser] = useState<User>({ role: storedRole })

  // Save role to localStorage when it changes
  const setRole = (role: UserRole) => {
    setUser({ role })
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ROLE_STORAGE_KEY, role)
    }
  }

  // Clear role from state and localStorage
  const clearRole = () => {
    setUser({ role: null })
    localStorage.removeItem(USER_ROLE_STORAGE_KEY)
  }

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user.role) return false
    return ROLE_PERMISSIONS[user.role][permission] ?? false
  }

  return (
    <UserContext.Provider value={{ user, setRole, hasPermission, clearRole }}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * useUser hook - Access user context
 * @throws Error if used outside UserProvider
 */
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
