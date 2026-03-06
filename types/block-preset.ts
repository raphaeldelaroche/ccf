/**
 * Types pour les presets de blocs
 */

import type { BlockNode } from "./editor"

export interface BlockPreset {
  /** Identifiant unique du preset */
  slug: string

  /** Nom du preset */
  name: string

  /** Description du preset */
  description?: string

  /** Tags pour catégoriser */
  tags?: string[]

  /** Type de bloc */
  blockType: string

  /** Pour quoi est-il fait ? (use case) */
  useCase?: string

  /** Le bloc template (sans ID) */
  template: Omit<BlockNode, "id">

  /** Métadonnées */
  meta?: {
    createdAt?: string
    updatedAt?: string
    author?: string
  }
}

export interface BlockPresetListItem {
  slug: string
  name: string
  description?: string
  blockType: string
  tags?: string[]
  useCase?: string
}
