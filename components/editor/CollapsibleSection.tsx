"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  // Once a section has been opened, keep children mounted to avoid
  // remounting costs on every toggle. But don't mount at all until first open.
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen)

  const toggle = () => {
    if (!hasBeenOpened) setHasBeenOpened(true)
    setIsOpen((v) => !v)
  }

  return (
    <div className="border-b border-border/40">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* Children are not mounted until the section is first opened.
            After that they stay mounted (hidden via CSS) to avoid remount costs. */}
        {hasBeenOpened && (
          <div className="space-y-3 px-4 pb-4">{children}</div>
        )}
      </div>
    </div>
  )
}
