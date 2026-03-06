"use client"

/**
 * BLOCK CANVAS
 *
 * Zone centrale affichant le rendu visuel des blocs.
 */

import React from "react"
import type { BlockNode } from "@/types/editor"
import { BlockListRenderer } from "./BlockRenderer"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockCanvasProps {
  blocks: BlockNode[]
  selectedBlockId: string | null
  onBlockClick: (blockId: string) => void
}

export function BlockCanvas({ blocks, selectedBlockId, onBlockClick }: BlockCanvasProps) {
  return (
    <div className="flex flex-col h-full bg-white">

      {/* Canvas */}
      <ScrollArea className="flex-1 h-full theme-wireframes">
        <BlockListRenderer
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onBlockClick={onBlockClick}
        />
      </ScrollArea>
    </div>
  )
}
