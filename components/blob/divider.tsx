import * as React from "react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function Divider({
  className,
  separatorClassName,
  orientation = "horizontal",
  decorative = true,
  children,
  ...props
}: React.ComponentProps<typeof Separator> & {
  children?: React.ReactNode
  separatorClassName?: string
}) {
  if (!children) {
    return (
      <Separator
        data-slot="divider"
        decorative={decorative}
        orientation={orientation}
        className={className}
        {...props}
      />
    )
  }

  return (
    <div
      data-slot="divider"
      data-orientation={orientation}
      className={cn(
        "flex items-center gap-3",
        orientation === "vertical" && "flex-col",
        className
      )}
    >
      <Separator
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "flex-1",
          orientation === "horizontal" ? "h-px" : "w-px",
          separatorClassName
        )}
        {...props}
      />
      <div className="shrink-0">{children}</div>
      <Separator
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "flex-1",
          orientation === "horizontal" ? "h-px" : "w-px",
          separatorClassName
        )}
        {...props}
      />
    </div>
  )
}

export { Divider }
