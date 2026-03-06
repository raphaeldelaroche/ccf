/**
 * BLOCK UTILITIES
 *
 * Fonctions utilitaires pour manipuler la structure de blocs de manière immutable.
 * Toutes les fonctions retournent de nouvelles instances sans modifier l'original.
 */

import type { BlockNode, ValidationError, FormDataValue } from "@/types/editor"
import { BLOCK_REGISTRY } from "./block-registry"

/**
 * Trouve un bloc par son ID de manière récursive
 * @returns Le bloc trouvé ou null
 */
export function findBlock(blocks: BlockNode[], id: string): BlockNode | null {
  for (const block of blocks) {
    if (block.id === id) {
      return block
    }

    if (block.innerBlocks) {
      const found = findBlock(block.innerBlocks, id)
      if (found) return found
    }
  }

  return null
}

/**
 * Trouve le chemin vers un bloc dans l'arborescence
 * @returns Le chemin sous forme de tableau d'indices et de clés, ou null si non trouvé
 * @example findBlockPath(blocks, "abc") // [0, "innerBlocks", 2, "innerBlocks", 0]
 */
export function findBlockPath(
  blocks: BlockNode[],
  id: string,
  currentPath: (string | number)[] = []
): (string | number)[] | null {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const path = [...currentPath, i]

    if (block.id === id) {
      return path
    }

    if (block.innerBlocks) {
      const found = findBlockPath(block.innerBlocks, id, [...path, "innerBlocks"])
      if (found) return found
    }
  }

  return null
}

/**
 * Trouve le parent d'un bloc
 * @returns Le bloc parent et l'index de l'enfant, ou null si c'est un bloc racine
 */
export function findBlockParent(
  blocks: BlockNode[],
  childId: string
): { parent: BlockNode; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (block.innerBlocks) {
      const childIndex = block.innerBlocks.findIndex((child) => child.id === childId)
      if (childIndex !== -1) {
        return { parent: block, index: childIndex }
      }

      const found = findBlockParent(block.innerBlocks, childId)
      if (found) return found
    }
  }

  return null
}

/**
 * Met à jour un bloc de manière immutable
 * @param updater Fonction qui modifie le bloc (mutation autorisée, l'objet sera cloné)
 */
export function updateBlock(
  blocks: BlockNode[],
  id: string,
  updater: (block: BlockNode) => void
): BlockNode[] {
  return blocks.map((block) => {
    if (block.id === id) {
      const cloned = structuredClone(block)
      updater(cloned)
      return cloned
    }

    if (block.innerBlocks) {
      return {
        ...block,
        innerBlocks: updateBlock(block.innerBlocks, id, updater),
      }
    }

    return block
  })
}

/**
 * Insère un nouveau bloc
 * @param parentId ID du bloc parent (null pour insérer à la racine)
 * @param newBlock Le bloc à insérer
 * @param index Position d'insertion (undefined = à la fin)
 */
export function insertBlock(
  blocks: BlockNode[],
  parentId: string | null,
  newBlock: BlockNode,
  index?: number
): BlockNode[] {
  // Insertion à la racine
  if (parentId === null) {
    const insertIndex = index ?? blocks.length
    return [...blocks.slice(0, insertIndex), newBlock, ...blocks.slice(insertIndex)]
  }

  // Insertion dans un parent
  return updateBlock(blocks, parentId, (parent) => {
    parent.innerBlocks = parent.innerBlocks || []
    const insertIndex = index ?? parent.innerBlocks.length
    parent.innerBlocks.splice(insertIndex, 0, newBlock)
  })
}

/**
 * Supprime un bloc
 */
export function deleteBlock(blocks: BlockNode[], id: string): BlockNode[] {
  const filtered = blocks.filter((block) => block.id !== id)

  return filtered.map((block) => {
    if (block.innerBlocks) {
      return {
        ...block,
        innerBlocks: deleteBlock(block.innerBlocks, id),
      }
    }
    return block
  })
}

/**
 * Déplace un bloc vers le haut ou le bas dans sa liste
 */
export function moveBlock(
  blocks: BlockNode[],
  id: string,
  direction: "up" | "down"
): BlockNode[] {
  // Fonction helper pour déplacer dans une liste
  const moveInList = (list: BlockNode[]): BlockNode[] | null => {
    const index = list.findIndex((b) => b.id === id)

    if (index === -1) return null

    const newIndex = direction === "up" ? index - 1 : index + 1

    // Impossible de déplacer (déjà au début/fin)
    if (newIndex < 0 || newIndex >= list.length) {
      return list
    }

    // Swap
    const newList = [...list]
    ;[newList[index], newList[newIndex]] = [newList[newIndex], newList[index]]
    return newList
  }

  // Essayer de déplacer à la racine
  const movedRoot = moveInList(blocks)
  if (movedRoot) return movedRoot

  // Sinon, chercher récursivement
  return blocks.map((block) => {
    if (block.innerBlocks) {
      const moved = moveInList(block.innerBlocks)
      if (moved) {
        return { ...block, innerBlocks: moved }
      }

      return {
        ...block,
        innerBlocks: moveBlock(block.innerBlocks, id, direction),
      }
    }
    return block
  })
}

/**
 * Duplique un bloc (avec un nouvel ID)
 */
export function duplicateBlock(blocks: BlockNode[], id: string): BlockNode[] {
  const block = findBlock(blocks, id)
  if (!block) return blocks

  const duplicated = structuredClone(block)
  regenerateIds(duplicated)

  const path = findBlockPath(blocks, id)
  if (!path) return blocks

  // Trouver le parent ou insérer à la racine
  if (path.length === 1) {
    // Racine
    const index = path[0] as number
    return insertBlock(blocks, null, duplicated, index + 1)
  }

  // Trouver le parent
  const parentIndex = path[path.length - 2] as number
  const parentPath = path.slice(0, -2)

  // Naviguer jusqu'au parent
  let current: BlockNode[] = blocks
  for (let i = 0; i < parentPath.length; i += 2) {
    const idx = parentPath[i] as number
    current = current[idx].innerBlocks || []
  }

  const parentId = current[parentIndex].id
  const childIndex = path[path.length - 1] as number

  return insertBlock(blocks, parentId, duplicated, childIndex + 1)
}

/**
 * Régénère tous les IDs d'un bloc et de ses enfants (mutation)
 */
function regenerateIds(block: BlockNode): void {
  block.id = crypto.randomUUID()

  if (block.innerBlocks) {
    block.innerBlocks.forEach(regenerateIds)
  }
}

/**
 * Compte le nombre total de blocs (incluant les enfants)
 */
export function countBlocks(blocks: BlockNode[]): number {
  return blocks.reduce((count, block) => {
    const childCount = block.innerBlocks ? countBlocks(block.innerBlocks) : 0
    return count + 1 + childCount
  }, 0)
}

/**
 * Calcule la profondeur maximale de l'arborescence
 */
export function getMaxDepth(blocks: BlockNode[]): number {
  if (blocks.length === 0) return 0

  return Math.max(
    ...blocks.map((block) => {
      if (!block.innerBlocks || block.innerBlocks.length === 0) return 1
      return 1 + getMaxDepth(block.innerBlocks)
    })
  )
}

/**
 * Valide la structure d'un bloc et de ses enfants
 * @param maxDepth Profondeur maximale autorisée (0 = pas de limite)
 */
export function validateBlockStructure(
  block: BlockNode,
  registry = BLOCK_REGISTRY,
  depth = 0,
  maxDepth = 0
): ValidationError[] {
  const errors: ValidationError[] = []
  const blockDef = registry[block.blockType]

  // 1. Vérifier que le type de bloc existe dans le registre
  // Les types natifs BlockNote (paragraph, heading, …) ne sont pas dans le registre
  // et sont considérés comme valides sans validation structurelle supplémentaire.
  if (!blockDef) {
    return errors
  }

  // 2. Vérifier la profondeur maximale
  if (maxDepth > 0 && depth > maxDepth) {
    errors.push({
      blockId: block.id,
      error: `Profondeur maximale dépassée (${depth} > ${maxDepth})`,
    })
  }

  // 3. Vérifier les innerBlocks autorisés
  if (block.innerBlocks && block.innerBlocks.length > 0) {
    const allowedInnerBlocks = blockDef.allowedInnerBlocks || []

    // Ce bloc ne peut pas avoir d'enfants
    if (allowedInnerBlocks.length === 0) {
      errors.push({
        blockId: block.id,
        error: `Le bloc ${block.blockType} ne peut pas contenir d'innerBlocks`,
      })
    } else {
      // Vérifier chaque enfant
      for (const child of block.innerBlocks) {
        if (!allowedInnerBlocks.includes(child.blockType)) {
          errors.push({
            blockId: block.id,
            error: `Le bloc ${block.blockType} ne peut pas contenir un bloc de type ${child.blockType}`,
          })
        }

        // Validation récursive
        errors.push(...validateBlockStructure(child, registry, depth + 1, maxDepth))
      }
    }
  }

  return errors
}

/**
 * Valide une liste de blocs
 */
export function validateBlocks(
  blocks: BlockNode[],
  maxDepth = 0
): ValidationError[] {
  return blocks.flatMap((block) => validateBlockStructure(block, BLOCK_REGISTRY, 0, maxDepth))
}

/**
 * Crée un nouveau bloc avec des valeurs par défaut
 */
export function createBlock(blockType: string, data?: Record<string, unknown>): BlockNode {
  const blockDef = BLOCK_REGISTRY[blockType]
  const initialData = blockDef?.initialValues || {}

  return {
    id: crypto.randomUUID(),
    blockType,
    data: { ...initialData, ...data } as Record<string, FormDataValue>,
    innerBlocks: [],
  }
}

/**
 * Vérifie si un bloc peut accepter des innerBlocks
 */
export function canHaveInnerBlocks(blockType: string): boolean {
  const allowed = BLOCK_REGISTRY[blockType]?.allowedInnerBlocks || []
  return allowed.length > 0
}

/**
 * Récupère tous les blocs de manière plate (sans hiérarchie)
 */
export function flattenBlocks(blocks: BlockNode[]): BlockNode[] {
  return blocks.flatMap((block) => {
    const children = block.innerBlocks ? flattenBlocks(block.innerBlocks) : []
    return [block, ...children]
  })
}

/**
 * Trouve le sibling suivant d'un bloc
 */
export function getNextSibling(blocks: BlockNode[], id: string): BlockNode | null {
  const findInList = (list: BlockNode[]): BlockNode | null => {
    const index = list.findIndex((b) => b.id === id)
    if (index !== -1 && index < list.length - 1) {
      return list[index + 1]
    }
    return null
  }

  const next = findInList(blocks)
  if (next) return next

  for (const block of blocks) {
    if (block.innerBlocks) {
      const found = getNextSibling(block.innerBlocks, id)
      if (found) return found
    }
  }

  return null
}

/**
 * Trouve le sibling précédent d'un bloc
 */
export function getPreviousSibling(blocks: BlockNode[], id: string): BlockNode | null {
  const findInList = (list: BlockNode[]): BlockNode | null => {
    const index = list.findIndex((b) => b.id === id)
    if (index > 0) {
      return list[index - 1]
    }
    return null
  }

  const prev = findInList(blocks)
  if (prev) return prev

  for (const block of blocks) {
    if (block.innerBlocks) {
      const found = getPreviousSibling(block.innerBlocks, id)
      if (found) return found
    }
  }

  return null
}
