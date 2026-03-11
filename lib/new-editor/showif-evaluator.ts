import type { FormDataValue } from '@/types/editor'
import type { Field, FieldSection } from '@/lib/blob-fields'

/**
 * SHOWIF EVALUATOR
 *
 * Helper pour évaluer les conditions showIf des champs.
 * Supporte:
 * - Valeurs simples: { field: "markerType", value: "text" }
 * - Tableaux de valeurs: { field: "markerType", value: ["text", "icon"] }
 * - Valeurs négatives (exclusion): { field: "itemFields", value: "!title" }
 * - Conditions multiples (AND): [condition1, condition2]
 */

export interface ShowIfCondition {
  field: string
  value: string | boolean | string[]
}

/**
 * Évalue si un champ doit être affiché selon sa condition showIf
 *
 * @param showIf - La condition ou le tableau de conditions (AND logique)
 * @param formData - Les données du formulaire
 * @returns true si le champ doit être affiché, false sinon
 */
export function evaluateShowIf(
  showIf: ShowIfCondition | ShowIfCondition[] | undefined,
  formData: Record<string, FormDataValue>
): boolean {
  // Pas de condition = toujours visible
  if (!showIf) return true

  // Tableau de conditions = AND logique
  if (Array.isArray(showIf)) {
    return showIf.every((condition) => evaluateSingleCondition(condition, formData))
  }

  // Condition simple
  return evaluateSingleCondition(showIf, formData)
}

/**
 * Évalue une seule condition showIf
 */
function evaluateSingleCondition(
  condition: ShowIfCondition,
  formData: Record<string, FormDataValue>
): boolean {
  const { field, value } = condition
  const fieldValue = formData[field]

  // Cas 1: Valeur négative (exclusion) - ex: "!title"
  if (typeof value === "string" && value.startsWith("!")) {
    const excludedValue = value.slice(1) // Enlever le "!"

    // Si le champ est un tableau (ex: itemFields)
    if (Array.isArray(fieldValue)) {
      return !(fieldValue as string[]).includes(excludedValue)
    }

    // Si le champ est une valeur simple
    return fieldValue !== excludedValue
  }

  // Cas 2: Tableau de valeurs acceptées - ex: ["text", "icon"]
  if (Array.isArray(value)) {
    return value.includes(fieldValue as string)
  }

  // Cas 3: Valeur simple - ex: "text"
  // Gérer aussi le cas boolean pour showContent, etc.
  if (typeof fieldValue === "boolean" && typeof value === "boolean") {
    return fieldValue === value
  }

  if (typeof fieldValue === "boolean" && typeof value === "string") {
    return fieldValue === (value === "true")
  }

  return fieldValue === value
}

/**
 * Helper pour trouver la définition d'un champ dans les sections
 * Utile pour récupérer le field definition à partir de son key
 */
export function findFieldInSections(
  fieldKey: string,
  sections: Record<string, FieldSection>
): Field | undefined {
  for (const section of Object.values(sections)) {
    if (section.fields[fieldKey]) {
      return section.fields[fieldKey]
    }
  }
  return undefined
}
