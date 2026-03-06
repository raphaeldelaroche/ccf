import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

function Subtitle({
  className,
  as = "p",
  asChild = false,
  ...props
}: React.ComponentProps<"p"> & {
  as?: "p" | "div"
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : as

  return (
    <Comp
      data-slot="subtitle"
      className={cn(
        "text-lead",
        "text-pretty text-foreground/60",
        className
      )}
      {...props}
    />
  )
}

export { Subtitle }
