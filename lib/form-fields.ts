/**
 * Form Block Fields Definition
 * Définit les champs configurables pour le bloc Form (Gravity Forms)
 */

import type { FieldSection } from '@/lib/blob-fields'

// Définir les champs inline sans interface personnalisée pour compatibilité
export const formFieldSections: Record<string, FieldSection> = {
  configuration: {
    label: 'Configuration',
    fields: {
      formId: {
        label: 'ID du formulaire',
        type: 'text', // Using text for now, will handle as number in InspectorField
        copyCategory: 'content',
      },
      successMessage: {
        label: 'Message de succès',
        type: 'textarea',
        copyCategory: 'content',
      },
      debug: {
        label: 'Mode debug',
        type: 'checkbox', // Using checkbox for boolean toggle
        copyCategory: 'style',
      },
    },
  },
}

export default formFieldSections
