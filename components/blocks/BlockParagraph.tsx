import { cn } from "@/lib/utils"
import { resolveAppearances } from "@/config/blob-appearances"

interface BlockParagraphProps {
  text: string
  appearance?: string | string[]
}

export function BlockParagraph({ text, appearance }: BlockParagraphProps) {
  if (!text) return null
  const appearanceConfig = resolveAppearances(appearance)
  return (
    <p className={cn("text-base text-foreground", appearanceConfig.blobClassName)}>{text}</p>
  )
}
