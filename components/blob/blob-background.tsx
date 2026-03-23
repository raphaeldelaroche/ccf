import { cn } from "@/lib/utils"
import type { BackgroundDefinition } from "@/config/blob-backgrounds"

interface BlobBackgroundProps {
  backgrounds: BackgroundDefinition[]
}

export function BlobBackground({ backgrounds }: BlobBackgroundProps) {
  if (backgrounds.length === 0) return null

  return (
    <>
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          data-slot="blob-background"
          aria-hidden="true"
          className={cn("absolute inset-0 pointer-events-none", bg.className)}
          style={{ zIndex: (bg.zIndex ?? 0) - 10 }}
        >
          {bg.content}
        </div>
      ))}
    </>
  )
}
