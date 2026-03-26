import type { FormDataValue } from '@/types/editor'

/**
 * Mapper pour le bloc FAQ
 * Transforme les données du formulaire en props utilisables par le composant
 */

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqFormData {
  faqItems?: FormDataValue
  accordionType?: string
  collapsible?: boolean
  spacing?: string
}

export interface MappedFaqData {
  faqItems: FaqItem[]
  accordionType: 'single' | 'multiple'
  collapsible: boolean
  spacing: string
}

/**
 * Parse un champ JSON (utilisé pour les champs répéteurs)
 */
function parseJsonField<T>(value: FormDataValue | undefined, defaultValue: T): T {
  if (!value) return defaultValue
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (e) {
      console.warn('Failed to parse JSON field:', e)
      return defaultValue
    }
  }
  return value as T
}

/**
 * Mappe les données du formulaire FAQ vers les props du composant
 */
export function mapFaqFormData(
  formData: FaqFormData
): MappedFaqData {
  // Parse le tableau de FAQ items
  const rawItems = parseJsonField<Array<Record<string, unknown>>>(formData.faqItems, [])

  const faqItems: FaqItem[] = rawItems.map((item) => ({
    question: (item?.question as string) || "",
    answer: (item?.answer as string) || "",
  }))

  return {
    faqItems,
    accordionType: (formData.accordionType === 'multiple' ? 'multiple' : 'single') as 'single' | 'multiple',
    collapsible: formData.collapsible !== undefined ? formData.collapsible : true,
    spacing: formData.spacing || "md",
  }
}
