"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BLOCK_ALIGNMENTS,
  ALIGNMENT_LABELS,
  isAlignmentLocked,
  type BlockAlignment,
} from "@/lib/editor/block-alignment"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface AlignmentInspectorFieldProps {
  value: BlockAlignment
  blockType: string
  onChange: (value: BlockAlignment) => void
}

/**
 * Inspector dropdown for block alignment.
 * Reusable: any block inspector can embed this component.
 * Automatically disables itself when alignment is locked for the block type.
 */
export function AlignmentInspectorField({
  value,
  blockType,
  onChange,
}: AlignmentInspectorFieldProps) {
  const locked = isAlignmentLocked(blockType)

  const field = (
    <div className={cn("space-y-2", locked && "opacity-40 pointer-events-none")}>
      <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
        Alignement du bloc
      </Label>
      <Select
        disabled={locked}
        value={value}
        onValueChange={(v) => onChange(v as BlockAlignment)}
      >
        <SelectTrigger className="h-8 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BLOCK_ALIGNMENTS.map((alignment) => (
            <SelectItem key={alignment} value={alignment}>
              {ALIGNMENT_LABELS[alignment]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (locked) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{field}</TooltipTrigger>
          <TooltipContent>
            Alignement fixé pour ce type de bloc
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return field
}
