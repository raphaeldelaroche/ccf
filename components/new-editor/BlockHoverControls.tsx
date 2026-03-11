"use client"

import { ArrowUp, ArrowDown, Plus, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlockPickerPopover } from "./BlockPickerPopover"
import type { BlockType } from "@/lib/new-editor/block-types"

interface BlockHoverControlsProps {
  onMoveUp: () => void
  onMoveDown: () => void
  onAddBelow: (blockType: BlockType) => void
  onInsertBelow?: () => void
  onDuplicate: () => void
  onDelete: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  isVisible?: boolean
  hasClipboard?: boolean
  className?: string
}

export function BlockHoverControls({
  onMoveUp,
  onMoveDown,
  onAddBelow,
  onInsertBelow,
  onDuplicate,
  onDelete,
  canMoveUp,
  canMoveDown,
  isVisible = false,
  hasClipboard = false,
  className,
}: BlockHoverControlsProps) {
  return (
    <div
      className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%)] px-2",
        "flex flex-col gap-1 transition-opacity z-10",
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-background shadow-sm"
        onClick={(e) => {
          e.stopPropagation()
          onMoveUp()
        }}
        disabled={!canMoveUp}
        title="Déplacer vers le haut"
      >
        <ArrowUp className="h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-background shadow-sm"
        onClick={(e) => {
          e.stopPropagation()
          onMoveDown()
        }}
        disabled={!canMoveDown}
        title="Déplacer vers le bas"
      >
        <ArrowDown className="h-3 w-3" />
      </Button>

      <BlockPickerPopover
        onSelect={(blockType) => onAddBelow(blockType)}
        onPaste={onInsertBelow}
        hasClipboard={hasClipboard}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-background shadow-sm"
          onClick={(e) => e.stopPropagation()}
          title="Ajouter un bloc en dessous"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </BlockPickerPopover>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-background shadow-sm"
        onClick={(e) => {
          e.stopPropagation()
          onDuplicate()
        }}
        title="Dupliquer le bloc"
      >
        <Copy className="h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 bg-background shadow-sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        title="Supprimer le bloc"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
