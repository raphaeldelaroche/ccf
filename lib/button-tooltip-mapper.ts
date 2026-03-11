import type { FormDataValue } from '@/types/editor'

/**
 * Mapper pour le bloc ButtonTooltip
 * Transforme les données du formulaire en props utilisables par le composant
 */

export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

export interface TooltipItem {
  label: string
  content: string
  linkLabel?: string
  linkUrl?: string
}

export interface ButtonTooltipFormData {
  tooltips?: FormDataValue
  layout?: string
  spacing?: string
  align?: string
  variant?: string
  size?: string
}

export interface MappedButtonTooltipData {
  layout: string
  spacing: string
  align: string
  variant: string
  size: ButtonSize
  tooltips: TooltipItem[]
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
 * Mappe les données du formulaire ButtonTooltip vers les props du composant
 */
export function mapButtonTooltipFormData(
  formData: ButtonTooltipFormData
): MappedButtonTooltipData {
  // Parse le tableau de tooltips
  const rawTooltips = parseJsonField<Array<Record<string, unknown>>>(formData.tooltips, [])

  const tooltips: TooltipItem[] = rawTooltips.map((item) => ({
    label: (item?.label as string) || "",
    content: (item?.content as string) || "",
    linkLabel: (item?.linkLabel as string) || undefined,
    linkUrl: (item?.linkUrl as string) || undefined,
  }))

  return {
    layout: formData.layout || "horizontal",
    spacing: formData.spacing || "md",
    align: formData.align || "left",
    variant: formData.variant || "default",
    size: (formData.size || "default") as ButtonSize,
    tooltips,
  }
}
