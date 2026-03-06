/**
 * BLOCK MAPPER RECURSIVE
 *
 * Mapper récursif qui transforme les BlockNode (avec innerBlocks) en données mappées.
 * Gère la récursion pour les blocs imbriqués.
 */

import type { BlockNode } from "@/types/editor"
import { BLOCK_REGISTRY } from "./block-registry"
import type { MappedBlobData } from "./blob-form-mapper"
import type { MappedIteratorData } from "./blob-iterator-mapper"

/**
 * Extension de MappedBlobData pour supporter les innerBlocks
 */
export interface MappedBlobDataWithInnerBlocks extends MappedBlobData {
  innerBlocks?: MappedBlockData[]
}

/**
 * Extension de MappedIteratorData pour supporter les innerBlocks dans les items
 */
export interface MappedIteratorDataWithInnerBlocks extends MappedIteratorData {
  items: MappedBlobDataWithInnerBlocks[]
}

/**
 * Type union pour les données mappées
 */
export type MappedBlockData =
  | MappedBlobDataWithInnerBlocks
  | MappedIteratorDataWithInnerBlocks

/**
 * Mappe un bloc avec ses innerBlocks de manière récursive
 *
 * @param blockNode Le bloc à mapper
 * @param depth Profondeur actuelle (sécurité contre récursion infinie)
 * @param maxDepth Profondeur maximale autorisée
 * @returns Les données mappées avec innerBlocks récursifs
 */
export function mapBlockWithInnerBlocks(
  blockNode: BlockNode,
  depth = 0,
  maxDepth = 50
): MappedBlockData {
  // Sécurité contre récursion infinie
  if (depth > maxDepth) {
    throw new Error(`Profondeur maximale dépassée (${maxDepth}) lors du mapping des blocs`)
  }

  // Récupérer la définition du bloc
  const blockDef = BLOCK_REGISTRY[blockNode.blockType]
  if (!blockDef) {
    throw new Error(`Type de bloc inconnu : ${blockNode.blockType}`)
  }

  // Mapper les données avec le mapper spécifique du bloc
  const mappedData = blockDef.mapper(blockNode.data)

  // Si le bloc a des innerBlocks, les mapper récursivement (quel que soit le contentType)
  if (blockNode.innerBlocks && blockNode.innerBlocks.length > 0) {
    const mappedInnerBlocks = blockNode.innerBlocks.map((innerBlock) =>
      mapBlockWithInnerBlocks(innerBlock, depth + 1, maxDepth)
    )

    return {
      ...mappedData,
      innerBlocks: mappedInnerBlocks,
    } as MappedBlockData
  }

  return mappedData as MappedBlockData
}

/**
 * Mappe une liste de blocs
 */
export function mapBlocks(blocks: BlockNode[]): MappedBlockData[] {
  return blocks.map((block) => mapBlockWithInnerBlocks(block))
}

/**
 * Vérifie si un bloc mappé contient des innerBlocks
 */
export function hasMappedInnerBlocks(
  mappedData: MappedBlockData
): mappedData is MappedBlobDataWithInnerBlocks {
  return "innerBlocks" in mappedData && Array.isArray(mappedData.innerBlocks)
}

/**
 * Récupère tous les blocs mappés de manière plate (sans hiérarchie)
 */
export function flattenMappedBlocks(blocks: MappedBlockData[]): MappedBlockData[] {
  return blocks.flatMap((block) => {
    const children = hasMappedInnerBlocks(block) && block.innerBlocks
      ? flattenMappedBlocks(block.innerBlocks)
      : []
    return [block, ...children]
  })
}

/**
 * Compte le nombre total de blocs mappés (incluant les enfants)
 */
export function countMappedBlocks(blocks: MappedBlockData[]): number {
  return blocks.reduce((count, block) => {
    const childCount = hasMappedInnerBlocks(block) && block.innerBlocks
      ? countMappedBlocks(block.innerBlocks)
      : 0
    return count + 1 + childCount
  }, 0)
}

/**
 * Calcule la profondeur maximale des blocs mappés
 */
export function getMappedMaxDepth(blocks: MappedBlockData[]): number {
  if (blocks.length === 0) return 0

  return Math.max(
    ...blocks.map((block) => {
      if (!hasMappedInnerBlocks(block) || !block.innerBlocks || block.innerBlocks.length === 0) return 1
      return 1 + getMappedMaxDepth(block.innerBlocks)
    })
  )
}
