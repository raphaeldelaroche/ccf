"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown, Plus, Copy, Trash2, Code, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlockPickerPopover } from "./BlockPickerPopover"
import type { BlockType, BlockNode } from "@/lib/new-editor/block-types"
import { useUser } from "@/lib/auth/UserContext"
import { canAccessBlockControls } from "@/lib/auth/permissions"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import { RefreshBlockDialog } from "./RefreshBlockDialog"
import type { RefreshMode } from "@/lib/new-editor/refresh-helpers"

interface BlockHoverControlsProps {
  block: BlockNode
  onMoveUp: () => void
  onMoveDown: () => void
  onAddBelow: (blockType: BlockType) => void
  onInsertBelow?: () => void
  onDuplicate: () => void
  onDelete: () => void
  onRefresh?: (mode: RefreshMode) => void
  canMoveUp: boolean
  canMoveDown: boolean
  isVisible?: boolean
  hasClipboard?: boolean
  className?: string
}

export function BlockHoverControls({
  block,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  onInsertBelow,
  onDuplicate,
  onDelete,
  onRefresh,
  canMoveUp,
  canMoveDown,
  isVisible = false,
  hasClipboard = false,
  className,
}: BlockHoverControlsProps) {
  const { user } = useUser()
  const [isJsonPopoverOpen, setIsJsonPopoverOpen] = useState(false)
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false)

  // Hide controls for editors and reviewers - engineers only
  if (!canAccessBlockControls(user.role)) {
    return null
  }

  const handleCopyJSON = async () => {
    try {
      const jsonString = JSON.stringify(block, null, 2)
      await navigator.clipboard.writeText(jsonString)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }

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

      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-background shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsRefreshDialogOpen(true)
          }}
          title="Rafraîchir le bloc (réinitialiser la structure)"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}

      <Popover open={isJsonPopoverOpen} onOpenChange={setIsJsonPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-background shadow-sm"
            onClick={(e) => e.stopPropagation()}
            title="Afficher le JSON"
          >
            <Code className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[500px] max-h-[600px] overflow-auto"
          side="right"
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <PopoverHeader>
            <PopoverTitle>JSON du bloc</PopoverTitle>
          </PopoverHeader>
          <div className="mt-4 space-y-2">
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[500px]">
              <code>{JSON.stringify(block, null, 2)}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyJSON()
              }}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copier le JSON
            </Button>
          </div>
        </PopoverContent>
      </Popover>

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

      {onRefresh && (
        <RefreshBlockDialog
          open={isRefreshDialogOpen}
          onOpenChange={setIsRefreshDialogOpen}
          onConfirm={(mode) => {
            onRefresh(mode)
          }}
          blockType={block.blockType}
        />
      )}
    </div>
  )
}
