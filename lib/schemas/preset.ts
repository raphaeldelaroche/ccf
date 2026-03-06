/**
 * Zod schemas pour les presets de blocs BlobUI
 * Basés sur preset.schema.json comme source de vérité
 */

import { z } from "zod"
import { BlockTypeSchema, BlockDataSchema, BlockMetaSchema } from "./block"

export const PresetMetaSchema = z
  .object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
  })
  .optional()

/**
 * Template d'un preset : identique à un BlockNode mais sans l'id racine
 */
export const BlockTemplateSchema = z.object({
  blockType: BlockTypeSchema,
  data: BlockDataSchema,
  innerBlocks: z.array(z.record(z.string(), z.unknown())), // innerBlocks sont des blocs complets avec id
  meta: BlockMetaSchema,
})

export const BlockPresetSchema = z.object({
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  blockType: BlockTypeSchema,
  useCase: z.string().optional(),
  template: BlockTemplateSchema,
  meta: PresetMetaSchema,
})

/**
 * Schema pour la création d'un preset depuis l'API
 * (le bloc source est un BlockNode complet, le preset est construit côté serveur)
 */
export const CreateBlockPresetRequestSchema = z.object({
  block: z.object({
    id: z.string().min(1),
    blockType: BlockTypeSchema,
    data: BlockDataSchema,
    innerBlocks: z.array(z.record(z.string(), z.unknown())),
    meta: BlockMetaSchema,
  }),
  name: z.string().min(1, "Le nom est requis"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  description: z.string().optional(),
  useCase: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type BlockPresetInput = z.infer<typeof BlockPresetSchema>
export type CreateBlockPresetRequest = z.infer<typeof CreateBlockPresetRequestSchema>
