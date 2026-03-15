/**
 * REFRESH HELPERS
 *
 * Nettoie les champs "orphelins" qui traînent à la racine de data
 * alors qu'ils devraient être dans data.responsive.base
 *
 * Contexte : Lors de la migration du système responsive, certains blocs
 * ont gardé des champs comme layout, size, marker, etc. à la racine
 * au lieu de les avoir uniquement dans responsive.base
 *
 * Ce helper permet de nettoyer ces doublons pour éviter les bugs.
 */

import type { BlockNode } from './block-types'
import fieldSections from '@/lib/blob-fields'
import type { FormDataValue } from '@/types/editor'

export type RefreshMode = 'clean' // Un seul mode maintenant

/**
 * Liste des champs qui doivent être dans responsive.base (marqués responsive: true dans blob-fields.ts)
 */
export const RESPONSIVE_FIELDS = [
  // Layout fields
  'size',
  'layout',
  'direction',
  'align',

  // Marker position
  'markerPosition',

  // Figure fields
  'figureWidth',
  'figureBleed',

  // Spacing fields
  'paddingX',
  'paddingY',
  'headerPaddingX',
  'headerPaddingY',
  'gapX',
  'gapY',

  // Actions position
  'actions',
] as const

/**
 * Génère dynamiquement la liste des champs responsive depuis blob-fields.ts
 */
function getResponsiveFieldKeys(): string[] {
  const keys: string[] = []

  for (const section of Object.values(fieldSections)) {
    for (const [fieldKey, field] of Object.entries(section.fields)) {
      if (field.responsive === true) {
        keys.push(fieldKey)
      }
    }
  }

  return keys
}

// Liste générée dynamiquement au chargement
const DYNAMIC_RESPONSIVE_FIELDS = getResponsiveFieldKeys()

/**
 * Nettoie les champs responsive orphelins à la racine de data
 */
function cleanOrphanedResponsiveFields(block: BlockNode): BlockNode {
  const cleanedData = { ...block.data }
  let cleaned = false

  // Supprimer tous les champs responsive qui traînent à la racine
  for (const key of DYNAMIC_RESPONSIVE_FIELDS) {
    if (key in cleanedData && key !== 'responsive') {
      delete cleanedData[key]
      cleaned = true
    }
  }

  if (cleaned) {
    console.log(`🧹 Cleaned orphaned responsive fields from block ${block.id} (${block.blockType})`)
  }

  return {
    ...block,
    data: cleanedData,
  }
}

/**
 * Nettoie les champs responsive orphelins de manière récursive (innerBlocks + Iterator items)
 *
 * @param block - Le bloc à nettoyer
 * @returns Le bloc nettoyé sans champs responsive orphelins
 */
export function refreshBlockRecursive(
  block: BlockNode,
  _mode: RefreshMode = 'clean' // mode ignoré, on garde pour compatibilité
): BlockNode {
  let cleaned = cleanOrphanedResponsiveFields(block)

  // Nettoyer récursivement les innerBlocks
  if (block.innerBlocks && block.innerBlocks.length > 0) {
    cleaned = {
      ...cleaned,
      innerBlocks: block.innerBlocks.map(inner =>
        refreshBlockRecursive(inner, 'clean')
      )
    }
  }

  // Pour Iterator : nettoyer les items (ce sont aussi des BlockNode)
  if (block.blockType === 'blobIterator' && cleaned.data.items) {
    try {
      const items = typeof cleaned.data.items === 'string'
        ? JSON.parse(cleaned.data.items as string)
        : cleaned.data.items

      if (Array.isArray(items)) {
        const cleanedItems = items.map(item =>
          refreshBlockRecursive(item as BlockNode, 'clean')
        )
        cleaned = {
          ...cleaned,
          data: {
            ...cleaned.data,
            items: typeof cleaned.data.items === 'string'
              ? JSON.stringify(cleanedItems)
              : (cleanedItems as unknown as FormDataValue)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to clean Iterator items:', e)
    }
  }

  return cleaned
}
