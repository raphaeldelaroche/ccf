import type React from "react";
import type { FieldSection, Field } from "./blob-fields";
import type { FormDataValue } from "@/types/editor";
import type { MappedBlobData } from "./blob-form-mapper";
import type { MappedIteratorData } from "./blob-iterator-mapper";

// ─── BlockDefinition ─────────────────────────────────────────────────────────

export interface BlockDefinition {
  /** Champs supplémentaires injectés dans des sections existantes de Blob */
  extraFields?: Record<string, Record<string, Field>>;
  /** Nouvelles sections accordion complètes */
  extraSections?: Record<string, FieldSection>;
  /**
   * Sections de base à masquer entièrement.
   * Utile quand le bloc gère ces champs via ses propres sections (ex: Iterator).
   */
  hideSections?: string[];
  /**
   * Valeurs forcées : les champs correspondants sont masqués de la sidebar
   * et leur valeur est toujours celle définie ici, invisible à l'utilisateur.
   */
  defaultValues?: Record<string, FormDataValue>;
  /**
   * Valeurs initiales : pré-remplissent le formulaire au chargement,
   * mais les champs restent visibles et modifiables.
   */
  initialValues?: Record<string, FormDataValue>;
  /**
   * Restreint les options d'un dropdown à une liste blanche de clés.
   */
  restrictOptions?: Record<string, string[]>;
  /** Rendu du bloc — reçoit le formData utilisateur + les données mappées */
  render: (
    formData: Record<string, FormDataValue>,
    mappedData: MappedBlobData | MappedIteratorData
  ) => React.ReactElement;
}

// ─── resolveBlockSections ────────────────────────────────────────────────────

/**
 * Fusionne les sections Blob de base avec la définition d'un bloc.
 * Fonction pure, indépendante de React.
 */
export function resolveBlockSections(
  base: Record<string, FieldSection>,
  definition?: BlockDefinition
): Record<string, FieldSection> {
  if (!definition) return base;

  const {
    extraFields = {},
    extraSections = {},
    hideSections = [],
    defaultValues = {},
    restrictOptions = {},
  } = definition;

  const hiddenSections = new Set(hideSections);
  const hiddenFields = new Set(Object.keys(defaultValues));

  const applyField = (fieldId: string, field: Field): Field | null => {
    if (hiddenFields.has(fieldId)) return null;
    if (field.type === "dropdown" && restrictOptions[fieldId]) {
      const allowed = new Set(restrictOptions[fieldId]);
      return {
        ...field,
        options: Object.fromEntries(
          Object.entries(field.options).filter(([key]) => allowed.has(key))
        ),
      };
    }
    return field;
  };

  const result: Record<string, FieldSection> = {};

  // Sections de base + extraFields injectés (skip hidden sections)
  for (const [sectionId, section] of Object.entries(base)) {
    if (hiddenSections.has(sectionId)) continue;
    const extra = extraFields[sectionId] ?? {};
    const filteredFields: Record<string, Field> = {};

    for (const [fieldId, field] of Object.entries({ ...section.fields, ...extra })) {
      const resolved = applyField(fieldId, field);
      if (resolved) filteredFields[fieldId] = resolved;
    }

    result[sectionId] = { label: section.label, fields: filteredFields };
  }

  // Nouvelles sections
  for (const [sectionId, section] of Object.entries(extraSections)) {
    const filteredFields: Record<string, Field> = {};
    for (const [fieldId, field] of Object.entries(section.fields)) {
      const resolved = applyField(fieldId, field);
      if (resolved) filteredFields[fieldId] = resolved;
    }
    result[sectionId] = { label: section.label, fields: filteredFields };
  }

  return result;
}
