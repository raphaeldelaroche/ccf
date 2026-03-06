"use client"

/**
 * BLOCK TREE
 *
 * Sidebar gauche affichant l'arborescence des blocs de la page.
 */

import React from "react"
import type { BlockNode } from "@/types/editor"
import { BlockTreeItem } from "./BlockTreeItem"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BLOCK_REGISTRY } from "@/lib/block-registry"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockTreeProps {
  blocks: BlockNode[]
  selectedBlockId: string | null
  onSelectBlock: (blockId: string) => void
  onAddBlock: (parentId: string | null, blockType: string) => void
  onDeleteBlock: (blockId: string) => void
  onMoveBlock: (blockId: string, direction: "up" | "down") => void
  onSaveAsPreset?: (blockId: string) => void
}

export function BlockTree({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  onSaveAsPreset,
}: BlockTreeProps) {
  // Types de blocs pouvant être ajoutés à la racine
  const rootBlockTypes = Object.keys(BLOCK_REGISTRY)

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Blocs</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Plus className="h-3 w-3 mr-1" />
              Ajouter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {rootBlockTypes.map((blockType) => {
              const def = BLOCK_REGISTRY[blockType]
              return (
                <DropdownMenuItem
                  key={blockType}
                  onClick={() => onAddBlock(null, blockType)}
                >
                  <span className="mr-2">{def?.icon}</span>
                  {def?.label || blockType}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tree */}
      <ScrollArea className="w-64 h-full">
        <div className="p-2">
          {blocks.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-8">
              Aucun bloc. <br />
              Cliquez sur ”+ Ajouter” pour commencer.
            </div>
          ) : (
            blocks.map((block) => (
              <BlockTreeItem
                key={block.id}
                block={block}
                level={0}
                isSelected={block.id === selectedBlockId}
                onSelect={onSelectBlock}
                onAdd={onAddBlock}
                onDelete={onDeleteBlock}
                onMove={onMoveBlock}
                onSaveAsPreset={onSaveAsPreset}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
