"use client"

import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import { BlockRenderer } from "./BlockRenderer"
import { HoveredBlockProvider } from "./HoveredBlockContext"
import type { RefreshMode } from "@/lib/new-editor/refresh-helpers"

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
  onRefreshBlock: (blockId: string, mode: RefreshMode) => void
  onInsertFromClipboard: (afterBlockId?: string, parentId?: string, position?: number) => void
  hasClipboard: boolean
  previewBreakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'
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
  onRefreshBlock,
  onInsertFromClipboard,
  hasClipboard,
  previewBreakpoint = 'auto',
}: BlockCanvasProps) {
  // Mapping des breakpoints vers les classes Tailwind
  const getWidthClass = () => {
    switch (previewBreakpoint) {
      case 'base':
        return 'max-w-[375px]'
      case 'sm':
        return 'max-w-[640px]'
      case 'md':
        return 'max-w-[768px]'
      case 'lg':
        return 'max-w-[1024px]'
      case 'xl':
        return 'max-w-[1280px]'
      case '2xl':
        return 'max-w-[1536px]'
      case 'auto':
      default:
        return 'w-full'
    }
  }

  const isResponsiveMode = previewBreakpoint !== 'auto'
  const widthClass = getWidthClass()

  if (blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Aucun bloc. Utilisez le bouton + pour commencer.</p>
      </div>
    )
  }

  return (
    <HoveredBlockProvider>
      <div
        className={`min-h-full ${isResponsiveMode ? 'bg-gray-50 p-8' : ''}`}
        onClick={(e) => {
          // Clic sur le fond désélectionne
          if (e.target === e.currentTarget) {
            onSelectBlock("")
          }
        }}
      >
        <div
          className={`${widthClass} ${isResponsiveMode ? 'mx-auto bg-white shadow-lg' : ''} transition-all duration-300`}
          style={isResponsiveMode ? { containerType: 'inline-size' } : undefined}
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
              onRefresh={(mode) => onRefreshBlock(block.id, mode)}
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
              onRefreshChild={onRefreshBlock}
              hasClipboard={hasClipboard}
            />
          ))}
        </div>
      </div>
    </HoveredBlockProvider>
  )
}
