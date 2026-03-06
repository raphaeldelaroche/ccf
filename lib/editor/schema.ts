import { BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs, defaultStyleSpecs } from "@blocknote/core"
import { alertBlock } from "./blocks/alert-block"
import { blobBlock } from "./blocks/blob-block"
import { sectionBlock } from "./blocks/section-block"

/**
 * Custom BlockNote schema with Blob blocks
 */
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    alert: alertBlock(),
    blob: blobBlock(),
    section: sectionBlock(),
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
})

export type CustomSchema = typeof schema
