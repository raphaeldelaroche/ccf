import { cn } from "@/lib/utils"
import { resolveAppearance } from "@/config/blob-appearances"

interface BlockParagraphProps {
  text: string
  appearance?: string
}

export function BlockParagraph({ text, appearance }: BlockParagraphProps) {
  if (!text) return null
  const appearanceConfig = resolveAppearance(appearance)
  return (
    <p className={cn("text-base text-foreground", appearanceConfig.blobClassName)}>{text}</p>
  )
}
