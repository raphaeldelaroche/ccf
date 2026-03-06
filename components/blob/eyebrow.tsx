import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

function Eyebrow({
  className,
  as = "div",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : as

  return (
    <Comp
      data-slot="eyebrow"
      className={cn(
        "text-eyebrow mb-eyebrow-bottom mt-eyebrow-top", // Semantic tokens
        "font-medium uppercase tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Eyebrow }
