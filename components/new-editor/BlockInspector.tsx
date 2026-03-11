"use client"

import { BlockNode } from "@/lib/new-editor/block-types"
import type { FormDataValue } from "@/types/editor"
import { BLOCK_REGISTRY } from "@/lib/new-editor/block-registry"
import { BlobInspector } from "./BlobInspector"
import { IteratorInspector } from "./IteratorInspector"
import { ButtonTooltipInspector } from "./ButtonTooltipInspector"
import { ParagraphInspector } from "./ParagraphInspector"
import { DividerInspector } from "./DividerInspector"
import { ListInspector } from "./ListInspector"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockInspectorProps {
  selectedBlock: BlockNode | null
  onUpdateBlock: (blockId: string, updates: Record<string, FormDataValue>) => void
}

export function BlockInspector({
  selectedBlock,
  onUpdateBlock,
}: BlockInspectorProps) {
  if (!selectedBlock) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Inspecteur</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">
            Sélectionnez un bloc pour afficher ses options
          </p>
        </div>
      </div>
    )
  }

  const blockDef = BLOCK_REGISTRY[selectedBlock.blockType]

  if (!blockDef) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Inspecteur</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-destructive text-center">
            Type de bloc inconnu : {selectedBlock.blockType}
          </p>
        </div>
      </div>
    )
  }

  const handleUpdate = (updates: Record<string, FormDataValue>) => {
    onUpdateBlock(selectedBlock.id, updates)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <blockDef.icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">{blockDef.label}</h3>
            <p className="text-xs text-muted-foreground">
              {blockDef.description}
            </p>
          </div>
        </div>
      </div>

      {/* Inspector content */}
      <ScrollArea className="flex-1">
        {selectedBlock.blockType === "blob" && (
          <BlobInspector data={selectedBlock.data as Record<string, unknown>} onUpdate={handleUpdate as (updates: Record<string, unknown>) => void} />
        )}
        {selectedBlock.blockType === "blobIterator" && (
          <IteratorInspector
            blockId={selectedBlock.id}
            data={selectedBlock.data}
            onUpdate={handleUpdate}
          />
        )}
        {selectedBlock.blockType === "buttonTooltip" && (
          <ButtonTooltipInspector
            data={selectedBlock.data}
            onUpdate={handleUpdate}
          />
        )}
        {selectedBlock.blockType === "paragraph" && (
          <ParagraphInspector
            data={selectedBlock.data}
            onUpdate={handleUpdate}
          />
        )}
        {selectedBlock.blockType === "divider" && (
          <DividerInspector
            data={selectedBlock.data}
            onUpdate={handleUpdate}
          />
        )}
        {selectedBlock.blockType === "list" && (
          <ListInspector
            data={selectedBlock.data}
            onUpdate={handleUpdate}
          />
        )}
      </ScrollArea>
    </div>
  )
}
