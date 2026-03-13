import type { UserRole } from './types'

/**
 * Field categories for permission checking
 */
export type FieldCategory = 'text-content' | 'media-url' | 'layout-style'

/**
 * Determine the category of a field based on its type
 */
export function getFieldCategory(fieldType: string): FieldCategory {
  // Text content fields - allowed for Editors
  if (fieldType === 'text' || fieldType === 'textarea') {
    return 'text-content'
  }

  // Media URL fields - blocked for Editors
  if (fieldType === 'image' || fieldType === 'video') {
    return 'media-url'
  }

  // Everything else (dropdown, checkbox, icon, etc.) - blocked for Editors
  return 'layout-style'
}

/**
 * Check if a user can edit a specific field
 */
export function canEditField(
  role: UserRole | null,
  fieldType: string
): boolean {
  // Engineer can edit everything
  if (role === 'engineer') return true

  // Reviewer cannot edit anything
  if (role === 'reviewer') return false

  // Editor can only edit text content fields
  if (role === 'editor') {
    const category = getFieldCategory(fieldType)
    return category === 'text-content'
  }

  return false
}

/**
 * Check if a user can edit a field within a repeater
 * Special handling for repeaters like buttons where some fields are text and others are style
 */
export function canEditRepeaterField(
  role: UserRole | null,
  parentKey: string,
  fieldKey: string,
  fieldType: string
): boolean {
  // Engineer can edit everything
  if (role === 'engineer') return true

  // Reviewer cannot edit anything
  if (role === 'reviewer') return false

  // Editor: special handling for specific repeaters
  if (role === 'editor') {
    if (parentKey === 'buttons') {
      // Allow editing text content in buttons (labels and URLs)
      const textFields = ['label', 'internalHref', 'externalHref']
      return textFields.includes(fieldKey)
    }

    if (parentKey === 'tooltips') {
      // Allow editing all fields in tooltips repeater
      return true
    }

    // For other repeaters, use standard field check
    return canEditField(role, fieldType)
  }

  return false
}

/**
 * Filter fields to only include those editable by the user
 * Returns a new fields object with non-editable fields removed
 */
export function filterEditableFields<T extends Record<string, { type: string }>>(
  fields: T,
  role: UserRole | null,
  parentKey?: string
): Partial<T> {
  if (role === 'engineer') return fields

  const filtered = {} as Partial<T>

  for (const [key, field] of Object.entries(fields)) {
    const canEdit = parentKey
      ? canEditRepeaterField(role, parentKey, key, field.type)
      : canEditField(role, field.type)

    if (canEdit) {
      filtered[key as keyof T] = field as T[keyof T]
    }
  }

  return filtered
}

/**
 * Determine if a field should be shown in the inspector
 * Currently same as canEditField (fields are hidden if not editable)
 */
export function shouldShowField(
  role: UserRole | null,
  fieldType: string
): boolean {
  return canEditField(role, fieldType)
}

/**
 * Get a user-friendly message explaining why a field cannot be edited
 */
export function getFieldRestrictionMessage(fieldType: string): string {
  const category = getFieldCategory(fieldType)

  switch (category) {
    case 'media-url':
      return 'Les champs média sont réservés aux Engineers'
    case 'layout-style':
      return 'Les champs de mise en page et style sont réservés aux Engineers'
    case 'text-content':
      return 'Ce champ devrait être éditable' // Should not happen
    default:
      return 'Ce champ est réservé aux Engineers'
  }
}

/**
 * Check if a field is a text content field (text or textarea)
 */
export function isTextContentField(fieldType: string): boolean {
  return fieldType === 'text' || fieldType === 'textarea'
}
