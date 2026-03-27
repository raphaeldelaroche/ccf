/**
 * Form Mapper
 * Transforme les données FormData du bloc Form en props pour le composant GravityForm
 */

import type { FormDataValue } from '@/types/editor'

/**
 * Structure des données brutes du formulaire dans l'éditeur
 */
export interface FormFormData {
  formId?: FormDataValue
  successMessage?: FormDataValue
  debug?: FormDataValue
  [key: string]: FormDataValue | undefined
}

/**
 * Props typées pour le composant BlockForm
 */
export interface MappedFormData {
  formId: number
  successMessage?: string
  debug?: boolean
}

/**
 * Convertit les données FormData en props pour GravityForm
 */
export function mapFormData(formData: FormFormData): MappedFormData {
  // Extraction du formId (requis)
  const formIdRaw = formData.formId
  let formId: number

  if (typeof formIdRaw === 'number') {
    formId = formIdRaw
  } else if (typeof formIdRaw === 'string') {
    formId = parseInt(formIdRaw, 10)
  } else {
    // Valeur par défaut si formId manquant ou invalide
    formId = 1
  }

  // Validation : formId doit être > 0
  if (isNaN(formId) || formId < 1) {
    formId = 1
  }

  // Extraction du message de succès (optionnel)
  const successMessage = typeof formData.successMessage === 'string' && formData.successMessage.trim()
    ? formData.successMessage
    : undefined

  // Extraction du mode debug (optionnel)
  const debug = formData.debug === true || formData.debug === 'true'

  return {
    formId,
    successMessage,
    debug,
  }
}
