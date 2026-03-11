"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BLOCK_REGISTRY } from "@/lib/new-editor/block-registry"
import type { BlockType } from "@/lib/new-editor/block-types"
import { Clipboard } from "lucide-react"
import { Separator } from "@/components/ui/separator"

import type { ComponentProps } from "react"

interface BlockPickerPopoverProps {
  onSelect: (blockType: BlockType) => void
  onPaste?: () => void
  hasClipboard?: boolean
  children: React.ReactNode
  side?: ComponentProps<typeof PopoverContent>["side"]
  align?: ComponentProps<typeof PopoverContent>["align"]
}

export function BlockPickerPopover({ onSelect, onPaste, hasClipboard, children, side = "right", align = "start" }: BlockPickerPopoverProps) {
  const [open, setOpen] = useState(false)

  const blockTypes = Object.entries(BLOCK_REGISTRY) as [BlockType, (typeof BLOCK_REGISTRY)[BlockType]][]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-52 p-1.5"
        side={side}
        align={align}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-0.5">
          Ajouter un bloc
        </p>
        {blockTypes.map(([type, def]) => (
          <button
            key={type}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => {
              onSelect(type)
              setOpen(false)
            }}
          >
            <def.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight">{def.label}</div>
              <div className="text-[11px] text-muted-foreground leading-tight truncate">
                {def.description}
              </div>
            </div>
          </button>
        ))}
        {hasClipboard && onPaste && (
          <>
            <Separator className="my-1" />
            <button
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => {
                onPaste()
                setOpen(false)
              }}
            >
              <Clipboard className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="text-sm font-medium leading-tight">Coller le bloc copié</div>
              </div>
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
