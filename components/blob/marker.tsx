import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const markerVariants = cva(
  "relative flex text-nowrap shrink-0 items-center justify-center overflow-hidden [&_svg]:pointer-events-none w-media h-media [&_svg]:size-media-icon mb-media-bottom",
  {
    variants: {
      rounded: {
        false: "rounded-[25%]",
        true: "rounded-full",
      },
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "bg-transparent text-foreground",
        outline: "bg-white border border-border text-foreground",
      },
    },
    defaultVariants: {
      rounded: false,
      variant: "default",
    },
  }
)

function Marker({
  className,
  rounded = false,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof markerVariants>) {
  return (
    <div
      data-slot="marker"
      data-rounded={rounded}
      data-variant={variant}
      className={cn(markerVariants({ rounded, variant }), className)}
      {...props}
    />
  )
}

export { Marker, markerVariants }
