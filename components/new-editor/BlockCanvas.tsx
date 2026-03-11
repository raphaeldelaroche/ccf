"use client"

import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import { BlockRenderer } from "./BlockRenderer"

interface BlockCanvasProps {
  blocks: BlockNode[]
  selectedBlockId: string | null
  onSelectBlock: (blockId: string) => void
  onMoveBlock: (blockId: string, direction: "up" | "down") => void
  onAddBlockBelow: (afterBlockId: string, blockType: BlockType) => void
  onAddBlockBelowChild: (parentId: string, position: number, blockType: BlockType) => void
  onDuplicateBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onCopyBlock: (blockId: string) => void
  onPasteBlock: (blockId: string) => void
  onInsertFromClipboard: (afterBlockId?: string, parentId?: string, position?: number) => void
  hasClipboard: boolean
}

export function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onAddBlockBelow,
  onAddBlockBelowChild,
  onDuplicateBlock,
  onDeleteBlock,
  onCopyBlock,
  onPasteBlock,
  onInsertFromClipboard,
  hasClipboard,
}: BlockCanvasProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Aucun bloc. Utilisez le bouton + pour commencer.</p>
      </div>
    )
  }

  return (
    <div
      className=""
      onClick={(e) => {
        // Clic sur le fond désélectionne
        if (e.target === e.currentTarget) {
          onSelectBlock("")
        }
      }}
    >
      {blocks.map((block, index) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          selectedBlockId={selectedBlockId}
          onSelect={() => onSelectBlock(block.id)}
          onMoveUp={() => onMoveBlock(block.id, "up")}
          onMoveDown={() => onMoveBlock(block.id, "down")}
          onAddBelow={(blockType) => onAddBlockBelow(block.id, blockType)}
          onDuplicate={() => onDuplicateBlock(block.id)}
          onDelete={() => onDeleteBlock(block.id)}
          onCopy={() => onCopyBlock(block.id)}
          onPaste={() => onPasteBlock(block.id)}
          onInsertBelow={() => onInsertFromClipboard(block.id)}
          onInsertBelowChild={(parentId, position) => onInsertFromClipboard(undefined, parentId, position)}
          canMoveUp={index > 0}
          canMoveDown={index < blocks.length - 1}
          onSelectChild={onSelectBlock}
          onMoveChild={onMoveBlock}
          onAddBelowChild={onAddBlockBelowChild}
          onDuplicateChild={onDuplicateBlock}
          onDeleteChild={onDeleteBlock}
          onCopyChild={onCopyBlock}
          onPasteChild={onPasteBlock}
          hasClipboard={hasClipboard}
        />
      ))}
    </div>
  )
}
