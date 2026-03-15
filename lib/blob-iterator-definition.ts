/**
 * BLOB ITERATOR BLOCK DEFINITION
 *
 * Définit BlobIterator comme une extension de Blob via le système BlockDefinition.
 * Cette approche :
 * - Élimine la duplication de champs (source unique: blob-fields.ts)
 * - Rend TOUS les champs Blob disponibles dans Iterator
 * - Utilise le système d'héritage inversé via multiselect itemFields
 * - Cohérent avec BlockBlobSection
 */

import React from "react"
import type { BlockDefinition } from "./block-definition"
import type { MappedIteratorData } from "./blob-iterator-mapper"
import { BlockBlobIterator } from "@/components/blocks/BlockBlobIterator"
import blobFieldSections, {
  SIZES,
  createBlobItemFields,
  withSharedFieldCondition,
  generateItemFieldsOptions,
} from "./blob-fields"
import type { Field } from "./blob-fields"

// ─── Iterator-specific constants ─────────────────────────────────────────────

export const ITERATOR_LAYOUTS = [
  "swiper",
  "grid-1",
  "grid-2",
  "grid-3",
  "grid-4",
  "grid-5",
  "grid-6",
  "grid-auto",
] as const

export type IteratorLayout = (typeof ITERATOR_LAYOUTS)[number]

const allSizes: Record<string, string> = Object.fromEntries(SIZES.map((s) => [s, s]))
const gapSizes: Record<string, string> = { auto: "Auto (défaut)", none: "Aucun (0)", ...allSizes }

// ─── Iterator Block Definition ──────────────────────────────────────────────

export const IteratorBlockDefinition: BlockDefinition = {
  // Masquer toutes les sections de base — elles sont gérées via sharedConfig + items
  hideSections: [
    "header", "marker", "figure", "buttons", "content",
    "layout", "spacing", "style", "separator", "seo",
  ],
  extraSections: {
    // ─── Section 1: Configuration du conteneur ───────────────────────────────
    iterator: {
      label: "Itérateur",
      fields: {
        iteratorLayout: {
          type: "dropdown",
          label: "Layout du conteneur",
          options: {
            "grid-auto": "Grille auto",
            "grid-1": "Grille 1 colonne",
            "grid-2": "Grille 2 colonnes",
            "grid-3": "Grille 3 colonnes",
            "grid-4": "Grille 4 colonnes",
            "grid-5": "Grille 5 colonnes",
            "grid-6": "Grille 6 colonnes",
            swiper: "Swiper (carrousel)",
          },
          responsive: true,
        },
        iteratorGapX: {
          type: "dropdown",
          label: "Espacement X",
          options: gapSizes,
          responsive: true,
        },
        iteratorGapY: {
          type: "dropdown",
          label: "Espacement entre les items",
          options: gapSizes,
          responsive: true,
        },
        enableSwiper: {
          type: "checkbox",
          label: "Activer les options Swiper",
          showIf: { field: "iteratorLayout", value: "swiper" },
        },
        swiperNavigation: {
          type: "checkbox",
          label: "Navigation (flèches)",
          showIf: { field: "enableSwiper", value: true },
        },
        swiperPagination: {
          type: "checkbox",
          label: "Pagination (points)",
          showIf: { field: "enableSwiper", value: true },
        },
        swiperAutoplay: {
          type: "checkbox",
          label: "Autoplay",
          showIf: { field: "enableSwiper", value: true },
        },
        swiperLoop: {
          type: "checkbox",
          label: "Boucle infinie",
          showIf: { field: "enableSwiper", value: true },
        },
      },
    },

    // ─── Section 2: Champs gérés par item ──────────────────────────────────────
    itemConfig: {
      label: "Champs par item",
      fields: {
        itemFields: {
          type: "multiselect",
          label: "Propriétés gérées par chaque item",
          options: generateItemFieldsOptions(),
        },
      },
    },

    // ─── Sections partagées (une par catégorie, conditionnées sur itemFields) ──
    ...generateSharedSections(),

    // ─── Section Items (repeater) ────────────────────────────────────────────
    items: {
      label: "Items",
      fields: {
        items: {
          type: "repeater",
          label: "Items",
          fields: createBlobItemFields(), // Tous les champs Blob disponibles !
        },
      },
    },
  },

  // Valeurs initiales (pré-remplies mais modifiables)
  initialValues: {
    iteratorLayout: "grid-auto",
    iteratorGapX: "md",
    iteratorGapY: "md",
    // Par défaut : seul le CONTENU spécifique est géré par item
    // Tout le reste (forme, structure, style) est partagé/hérité
    itemFields: [
      // Textes (contenu spécifique à chaque item)
      "title",
      "emphasisText",
      "eyebrow",
      "eyebrowTheme",
      "subtitle",
      // Marqueur (contenu spécifique : texte ou icône)
      "markerContent",
      "markerIcon",
      // Figure (média spécifique : image ou vidéo)
      "image",
      "video",
      // Boutons (contenu spécifique)
      "buttons",
      // Contenu texte libre
      "contentText",
    ],
  },

  // Renderer
  render: (formData, mappedData) => {
    return React.createElement(BlockBlobIterator, { data: mappedData as MappedIteratorData })
  },
}

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Applique la condition de champ partagé à TOUS les champs d'une section.
 * Chaque champ marqué inheritable est affiché quand il N'EST PAS dans itemFields.
 */
function withSharedFields(
  fields: Record<string, Field>
): Record<string, Field> {
  const result: Record<string, Field> = {}

  for (const [fieldKey, field] of Object.entries(fields)) {
    if (field.inheritable) {
      result[fieldKey] = withSharedFieldCondition(field, fieldKey)
    }
  }

  return result
}

/**
 * Génère les sections partagées à partir des sections de base de blob-fields.
 * Chaque section est recréée avec ses champs conditionnés sur itemFields.
 * Préfixé "shared_" pour éviter les collisions avec les sections de base masquées.
 */
function generateSharedSections(): Record<string, { label: string; fields: Record<string, Field> }> {
  const sections: Record<string, { label: string; fields: Record<string, Field> }> = {}

  // Utiliser l'ordre natif des sections de blobFieldSections
  for (const [sectionKey, section] of Object.entries(blobFieldSections)) {

    const sharedFields = withSharedFields(section.fields)
    // Ne créer la section que si elle contient au moins un champ héritable
    if (Object.keys(sharedFields).length > 0) {
      sections[`shared_${sectionKey}`] = {
        label: section.label,
        fields: sharedFields,
      }
    }
  }

  return sections
}
