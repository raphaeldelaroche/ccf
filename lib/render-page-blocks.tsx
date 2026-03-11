/**
 * RENDER PAGE BLOCKS
 *
 * Système de rendu récursif des blocs pour les pages publiques (lecture seule).
 * Transforme les BlockNode en composants React en utilisant les mappers existants.
 */

import React from "react"
import type { BlockNode } from "@/lib/new-editor/block-types"
import { mapFormDataToBlob } from "@/lib/blob-form-mapper"
import { mapIteratorFormData } from "@/lib/blob-iterator-mapper"
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlobBlock } from "@/components/blocks/BlockBlob"
import { BlockBlobIterator } from "@/components/blocks/BlockBlobIterator"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"
import { BlockParagraph } from "@/components/blocks/BlockParagraph"
import { BlockDivider } from "@/components/blocks/BlockDivider"
import { BlockList } from "@/components/blocks/BlockList"

/**
 * Rend récursivement un bloc selon son type
 */
export function renderBlock(block: BlockNode): React.ReactNode {
  const { blockType, data, innerBlocks } = block

  try {
    switch (blockType) {
      case "blob": {
        const mappedData = mapFormDataToBlob(data)

        // Si le bloc a un contentType "innerBlocks" et des innerBlocks, on les rend
        const hasInnerBlocks = data.contentType === "innerBlocks" && innerBlocks && innerBlocks.length > 0

        return (
          <BlobBlock
            key={block.id}
            data={mappedData}
            innerBlocks={hasInnerBlocks ? innerBlocks : undefined}
            renderInnerBlock={hasInnerBlocks ? renderBlock : undefined}
          />
        )
      }

      case "blobIterator": {
        const mappedData = mapIteratorFormData(data)
        // Passer la fonction de rendu pour supporter les innerBlocks dans les items
        return <BlockBlobIterator key={block.id} data={mappedData} renderInnerBlock={renderBlock} />
      }

      case "buttonTooltip": {
        const mappedData = mapButtonTooltipFormData(data)
        return <BlockButtonTooltip key={block.id} data={mappedData} />
      }

      case "paragraph": {
        return (
          <BlockParagraph
            key={block.id}
            text={(data.text as string) || ""}
            appearance={(data.appearance as string) || undefined}
          />
        )
      }

      case "divider": {
        return (
          <BlockDivider
            key={block.id}
            orientation={(data.orientation as "horizontal" | "vertical") || "horizontal"}
            label={(data.label as string) || undefined}
            spacingBefore={(data.spacingBefore as string) || undefined}
            spacingAfter={(data.spacingAfter as string) || undefined}
          />
        )
      }

      case "list": {
        const items = Array.isArray(data.items)
          ? (data.items as Array<{title: string; subtitle?: string}>)
          : (() => { try { return JSON.parse((data.items as string) || "[]") } catch { return [] } })()
        return <BlockList key={block.id} items={items} icon={(data.icon as string) || "arrowRight"} />
      }

      default:
        console.warn(`Type de bloc inconnu: ${blockType}`)
        return null
    }
  } catch (error) {
    console.error(`Erreur lors du rendu du bloc ${block.id}:`, error)
    return null
  }
}

/**
 * Rend une liste de blocs
 */
export function renderBlocks(blocks: BlockNode[]): React.ReactNode {
  return blocks.map((block) => (
    <React.Fragment key={block.id}>
      {renderBlock(block)}
    </React.Fragment>
  ))
}
