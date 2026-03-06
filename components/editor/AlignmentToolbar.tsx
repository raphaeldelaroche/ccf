"use client"

import { cn } from "@/lib/utils"
import {
  BLOCK_ALIGNMENTS,
  ALIGNMENT_LABELS,
  type BlockAlignment,
} from "@/lib/editor/block-alignment"
import {
  AlignCenter,
  AlignJustify,
  Maximize2,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ALIGNMENT_ICONS: Record<BlockAlignment, React.ReactNode> = {
  default: <AlignCenter className="h-4 w-4" />,
  wide: <AlignJustify className="h-4 w-4" />,
  full: <Maximize2 className="h-4 w-4" />,
}

interface AlignmentToolbarProps {
  value: BlockAlignment
  onChange: (value: BlockAlignment) => void
  disabled?: boolean
  disabledReason?: string
}

/**
 * Floating toolbar for block alignment — rendered inside the block's render().
 * Positioned absolutely above the block.
 * Reusable: any custom block can import and render this in its own render function.
 */
export function AlignmentToolbar({
  value,
  onChange,
  disabled = false,
  disabledReason,
}: AlignmentToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-md"
        // Prevent mousedown from propagating to the block's own handler
        onMouseDown={(e) => e.stopPropagation()}
      >
        {BLOCK_ALIGNMENTS.map((alignment) => (
          <Tooltip key={alignment}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "flex items-center justify-center rounded-md p-1.5 transition-colors",
                  value === alignment
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
                onClick={() => {
                  if (!disabled) onChange(alignment)
                }}
              >
                {ALIGNMENT_ICONS[alignment]}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {disabled && disabledReason
                ? disabledReason
                : ALIGNMENT_LABELS[alignment]}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
