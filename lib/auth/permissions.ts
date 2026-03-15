import type { UserRole, Permission } from './types'
import { ROLE_PERMISSIONS } from './types'

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role][permission] ?? false
}

/**
 * Permission check functions for specific actions
 */

export function canCreatePage(role: UserRole | null): boolean {
  return hasPermission(role, 'create_page')
}

export function canEditPage(role: UserRole | null): boolean {
  return hasPermission(role, 'edit_page')
}

export function canDeletePage(role: UserRole | null): boolean {
  return hasPermission(role, 'delete_page')
}

export function canAccessEditor(role: UserRole | null): boolean {
  return hasPermission(role, 'access_editor')
}

export function canSaveChanges(role: UserRole | null): boolean {
  return hasPermission(role, 'save_changes')
}

/**
 * Role-based feature access functions
 * These check roles directly for features not tied to CRUD permissions
 */

export function canAccessResponsivePreview(role: UserRole | null): boolean {
  return role === 'engineer'
}

export function canAccessBreakpointTabs(role: UserRole | null): boolean {
  return role === 'engineer' || role === 'reviewer'
}

export function canAccessJsonEditor(role: UserRole | null): boolean {
  return role === 'engineer' || role === 'reviewer'
}

export function canAccessBlockControls(role: UserRole | null): boolean {
  return role === 'engineer'
}

export function isEngineer(role: UserRole | null): boolean {
  return role === 'engineer'
}

export function isEditor(role: UserRole | null): boolean {
  return role === 'editor'
}

export function isReviewer(role: UserRole | null): boolean {
  return role === 'reviewer'
}

/**
 * Get user-friendly permission error message
 */
export function getPermissionErrorMessage(permission: Permission): string {
  const messages: Record<Permission, string> = {
    create_page: 'Vous n\'avez pas la permission de créer des pages',
    edit_page: 'Vous n\'avez pas la permission de modifier des pages',
    delete_page: 'Vous n\'avez pas la permission de supprimer des pages',
    access_editor: 'Vous n\'avez pas la permission d\'accéder à l\'éditeur',
    save_changes: 'Vous n\'avez pas la permission de sauvegarder des modifications',
    edit_advanced_fields: 'Vous n\'avez pas la permission de modifier les champs avancés',
  }
  return messages[permission] || 'Permission refusée'
}
