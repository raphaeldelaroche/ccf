/**
 * BLOCK REGISTRY
 *
 * Registre central de tous les types de blocs disponibles dans l'éditeur.
 * Chaque bloc définit :
 * - Sa configuration (sections, champs, valeurs par défaut)
 * - Son mapper (transformation formData → mappedData)
 * - Son renderer (composant React à rendre)
 * - Les types de blocs qu'il peut contenir (allowedInnerBlocks)
 */

import React from "react"
import type { BlockDefinition } from "./block-definition"
import type { FormDataValue } from "@/types/editor"
import { mapFormDataToBlob, type MappedBlobData } from "./blob-form-mapper"
import { mapIteratorFormData, type MappedIteratorData } from "./blob-iterator-mapper"
import { BlobBlock } from "@/components/blocks/BlockBlob"
import { BlockBlobIterator } from "@/components/blocks/BlockBlobIterator"
import { BlockBlobSection } from "@/components/blocks/BlockBlobSection"
import { IteratorBlockDefinition } from "./blob-iterator-definition"
import blobFieldSections from "./blob-fields"
import { resolveBlockSections } from "./block-definition"

/**
 * Interface étendue de BlockDefinition pour l'éditeur
 * Ajoute les métadonnées nécessaires pour l'éditeur
 */
export interface EditorBlockDefinition extends BlockDefinition {
  /** Label affiché dans l'interface */
  label: string

  /** Description du bloc */
  description?: string

  /** Icône du bloc (emoji ou nom d'icône) */
  icon?: string

  /** Types de blocs autorisés comme enfants (innerBlocks) */
  allowedInnerBlocks?: string[]

  /** Mapper spécifique pour ce bloc */
  mapper: (formData: Record<string, FormDataValue>) => MappedBlobData | MappedIteratorData

  /** Sections de champs résolues */
  sections: ReturnType<typeof resolveBlockSections>
}

/**
 * Définition du bloc BlobBlock (bloc de base)
 */
const BlobBlockDefinition: EditorBlockDefinition = {
  label: "Blob",
  description: "Bloc de contenu flexible et responsive",
  icon: "📦",

  // Peut contenir n'importe quel type de bloc (récursif)
  allowedInnerBlocks: ["BlobBlock", "BlobSection", "BlobIterator"],

  // Pas de modifications des sections de base
  sections: blobFieldSections,

  // Mapper standard
  mapper: mapFormDataToBlob,

  // Renderer
  render: (formData, mappedData) => {
    return React.createElement(BlobBlock, { data: mappedData as MappedBlobData })
  },
}

/**
 * Définition du bloc BlobSection (wrapper avec largeur de conteneur)
 */
const BlobSectionDefinition: EditorBlockDefinition = {
  label: "Section",
  description: "Section wrapper avec gestion de la largeur du conteneur",
  icon: "📐",

  // Peut contenir des blobs et iterators
  allowedInnerBlocks: ["BlobBlock", "BlobIterator"],

  // Ajoute le champ containerWidth
  extraSections: {
    container: {
      label: "Conteneur",
      fields: {
        containerWidth: {
          type: "dropdown",
          label: "Largeur du conteneur",
          options: {
            center: "Centré (max-w-7xl)",
            wide: "Large (max-w-screen-2xl)",
            full: "Pleine largeur",
          },
        },
      },
    },
  },

  initialValues: {
    containerWidth: "center",
  },

  sections: resolveBlockSections(blobFieldSections, {
    extraSections: {
      container: {
        label: "Conteneur",
        fields: {
          containerWidth: {
            type: "dropdown",
            label: "Largeur du conteneur",
            options: {
              center: "Centré (max-w-7xl)",
              wide: "Large (max-w-screen-2xl)",
              full: "Pleine largeur",
            },
          },
        },
      },
    },
    render: () => React.createElement(React.Fragment), // Placeholder, remplacé par le vrai render ci-dessous
  }),

  mapper: mapFormDataToBlob,

  render: (formData, mappedData) => {
    return React.createElement(BlockBlobSection, {
      formData,
      mappedData: mappedData as MappedBlobData,
    })
  },
}

/**
 * Définition du bloc BlobIterator (collection de blobs)
 */
const BlobIteratorDefinition: EditorBlockDefinition = {
  label: "Iterator",
  description: "Collection de blobs avec layouts responsives (grille/swiper)",
  icon: "🔄",

  // Les iterators ne peuvent pas avoir d'innerBlocks directement
  // Les innerBlocks sont gérés via les items
  allowedInnerBlocks: [],

  // Utilise la définition Iterator existante
  ...IteratorBlockDefinition,

  sections: resolveBlockSections(blobFieldSections, IteratorBlockDefinition),

  mapper: mapIteratorFormData,

  render: (formData, mappedData) => {
    return React.createElement(BlockBlobIterator, { data: mappedData as MappedIteratorData })
  },
}

/**
 * Registre de tous les blocs disponibles
 */
export const BLOCK_REGISTRY: Record<string, EditorBlockDefinition> = {
  BlobBlock: BlobBlockDefinition,
  BlobSection: BlobSectionDefinition,
  BlobIterator: BlobIteratorDefinition,
}

/**
 * Types de blocs disponibles
 */
export type BlockType = keyof typeof BLOCK_REGISTRY

/**
 * Liste des types de blocs sous forme de tableau
 */
export const BLOCK_TYPES = Object.keys(BLOCK_REGISTRY) as BlockType[]

/**
 * Récupère la définition d'un bloc par son type
 */
export function getBlockDefinition(blockType: string): EditorBlockDefinition | undefined {
  return BLOCK_REGISTRY[blockType]
}

/**
 * Vérifie si un type de bloc existe dans le registre
 */
export function isValidBlockType(blockType: string): blockType is BlockType {
  return blockType in BLOCK_REGISTRY
}

/**
 * Récupère les types de blocs autorisés comme enfants d'un bloc parent
 */
export function getAllowedInnerBlocks(parentBlockType: string): string[] {
  const definition = getBlockDefinition(parentBlockType)
  return definition?.allowedInnerBlocks || []
}

/**
 * Vérifie si un bloc peut contenir un certain type d'enfant
 */
export function canContainBlock(parentBlockType: string, childBlockType: string): boolean {
  const allowed = getAllowedInnerBlocks(parentBlockType)
  return allowed.length === 0 ? false : allowed.includes(childBlockType)
}
