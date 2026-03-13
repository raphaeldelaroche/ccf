import type { UserRole, Permission } from './types'
import { hasPermission, getPermissionErrorMessage } from './permissions'

/**
 * Extract user role from request headers
 * In the future, this will validate a JWT token or session
 */
export function getUserRoleFromRequest(request: Request): UserRole | null {
  const role = request.headers.get('x-user-role')
  if (role === 'engineer' || role === 'editor' || role === 'reviewer') {
    return role
  }
  return null
}

/**
 * Validate that the user has the required permission
 * Returns an error response if permission is denied
 */
export function validatePermission(
  request: Request,
  permission: Permission
): { authorized: boolean; role: UserRole | null; error?: Response } {
  const role = getUserRoleFromRequest(request)

  if (!role) {
    return {
      authorized: false,
      role: null,
      error: new Response(
        JSON.stringify({ error: 'Rôle utilisateur non spécifié' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }

  if (!hasPermission(role, permission)) {
    return {
      authorized: false,
      role,
      error: new Response(
        JSON.stringify({ error: getPermissionErrorMessage(permission) }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }

  return { authorized: true, role }
}

/**
 * Helper functions for common permission checks
 */

export function requireCreatePage(request: Request) {
  return validatePermission(request, 'create_page')
}

export function requireEditPage(request: Request) {
  return validatePermission(request, 'edit_page')
}

export function requireDeletePage(request: Request) {
  return validatePermission(request, 'delete_page')
}

export function requireSaveChanges(request: Request) {
  return validatePermission(request, 'save_changes')
}
