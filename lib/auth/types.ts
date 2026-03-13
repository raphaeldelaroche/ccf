/**
 * User roles for the application
 */
export type UserRole = 'engineer' | 'editor' | 'reviewer'

/**
 * User interface
 */
export interface User {
  role: UserRole | null
}

/**
 * Permission types
 */
export type Permission =
  | 'create_page'
  | 'edit_page'
  | 'delete_page'
  | 'access_editor'
  | 'save_changes'
  | 'edit_advanced_fields'

/**
 * Role permissions matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  engineer: {
    create_page: true,
    edit_page: true,
    delete_page: true,
    access_editor: true,
    save_changes: true,
    edit_advanced_fields: true,
  },
  editor: {
    create_page: false,
    edit_page: true,
    delete_page: false,
    access_editor: true,
    save_changes: true,
    edit_advanced_fields: false,
  },
  reviewer: {
    create_page: false,
    edit_page: false,
    delete_page: false,
    access_editor: false,
    save_changes: false,
    edit_advanced_fields: false,
  },
}

/**
 * Role metadata for UI display
 */
export const ROLE_METADATA: Record<
  UserRole,
  {
    label: string
    description: string
    color: string
  }
> = {
  reviewer: {
    label: 'Reviewer',
    description: 'Genre Renaud, Manuel ou Lise.',
    color: 'bg-gray-500',
  },
  editor: {
    label: 'Editor',
    description: 'Genre Fleur',
    color: 'bg-green-500',
  },
  engineer: {
    label: 'Engineer',
    description: 'Genre Raphaël',
    color: 'bg-blue-500',
  },
}

/**
 * Role icons (emojis) for UI display
 */
export const ROLE_ICONS: Record<UserRole, string> = {
  engineer: '🤓',
  editor: '✍️',
  reviewer: '😎',
}

/**
 * Ordered list of roles (defines display order across the app — follows ROLE_METADATA key order)
 */
export const USER_ROLES = Object.keys(ROLE_METADATA) as UserRole[]

/**
 * LocalStorage key for user role
 */
export const USER_ROLE_STORAGE_KEY = 'user-role'
