import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { composeBlobClasses, type BlobComposableProps } from "@/lib/blob-compose"

/* =======================================
   BLOB
   ======================================= */

type BlobProps = React.ComponentProps<"div"> &
  BlobComposableProps & {
    useContainerQueries?: boolean
  }

function Blob({
  className,
  responsive,
  theme,
  useContainerQueries = false,
  children,
  ...props
}: BlobProps) {
  const composedClasses = composeBlobClasses({ responsive, theme }, useContainerQueries)

  return (
    <div
      data-slot="blob"
      className={cn(
        "w-full text-foreground",
        composedClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* =======================================
   BLOB ACTIONS
   ======================================= */

const blobActionsVariants = cva(
  "flex gap-actions [&>button]:h-button [&>button]:px-button-x [&>button]:text-button [&>button]:rounded-button [&>button]:gap-button [&>a]:h-button [&>a]:px-button-x [&>a]:text-button [&>a]:rounded-button [&>a]:gap-button",
  {
    variants: {
      layout: {
        stack: "flex-col",
        flow: "flex-row flex-wrap",
      },
    },
    defaultVariants: {
      layout: "flow",
    },
  }
)

function BlobActions({
  className,
  layout = "flow",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof blobActionsVariants>) {
  return (
    <div
      data-slot="blob-actions"
      data-layout={layout}
      className={cn(
        blobActionsVariants({ layout }),
        className,
      )}
      {...props}
    />
  )
}

/* =======================================
   BLOB HEADER
   ======================================= */

function BlobHeader({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="blob-header"
      className={cn(
        "flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* =======================================
   BLOB CONTENT
   ======================================= */

function BlobContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="blob-content"
      className={cn(
        "w-full [&>:last-child]:!mb-0",
        className
      )}
      {...props}
    />
  )
}

/* =======================================
   BLOB FIGURE
   ======================================= */

function BlobFigure({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="blob-figure"
      className={cn(
        "size-full",
        className
      )}
      {...props}
    />
  )
}

/* =======================================
   COMPOUND COMPONENT ASSEMBLY
   ======================================= */

const BlobCompound = Object.assign(Blob, {
  Header: BlobHeader,
  Actions: BlobActions,
  Content: BlobContent,
  Figure: BlobFigure,
})

export { BlobCompound as Blob, BlobHeader, BlobActions, BlobContent, BlobFigure }

