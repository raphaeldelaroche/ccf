/**
 * Zod schemas pour les pages BlobUI
 * Basés sur page.schema.json comme source de vérité
 */

import { z } from "zod"

export const PageMetaSchema = z
  .object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
  })
  .optional()

export const PageSchema = z.object({
  version: z.string().min(1, "La version est requise"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  title: z.string().min(1, "Le titre est requis"),
  // Accepte n'importe quel format de blocs : BlockNote natif ou BlockNode (blob-editor)
  blocks: z.array(z.unknown()),
  meta: PageMetaSchema,
})

export type PageInput = z.infer<typeof PageSchema>
