"use client"

import { BREAKPOINTS, type Breakpoint } from "@/lib/responsive-utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface BreakpointTabsProps {
  activeTab: Breakpoint
  onTabChange: (tab: Breakpoint) => void
  overrides: Set<Breakpoint>
  onResetBreakpoint?: (breakpoint: Breakpoint) => void
  onCopyBreakpoint?: (breakpoint: Breakpoint) => void
  onPasteBreakpoint?: (breakpoint: Breakpoint) => void
  hasCopiedValues?: boolean
}

export function BreakpointTabs({
  activeTab,
  onTabChange,
  overrides,
  onResetBreakpoint,
  onCopyBreakpoint,
  onPasteBreakpoint,
  hasCopiedValues = false
}: BreakpointTabsProps) {
  const tabs: Array<Breakpoint> = [...BREAKPOINTS]

  return (
    <div className="border-b border-border">
      <div className="flex gap-1 px-4 py-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          const hasOverride = overrides.has(tab)
          const canReset = hasOverride && tab !== "base" && onResetBreakpoint
          const canCopy = hasOverride && onCopyBreakpoint
          const canPaste = hasCopiedValues && onPasteBreakpoint
          const hasContextMenu = canReset || canCopy || canPaste

          const buttonElement = (
            <button
              onClick={() => onTabChange(tab)}
              className={`
                relative px-3 py-1.5 text-xs font-medium rounded transition-colors
                ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }
              `}
            >
              {tab === "base" ? "Base" : tab.toUpperCase()}
              {hasOverride && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500"
                  title={`Has overrides for ${tab}`}
                />
              )}
            </button>
          )

          // Wrap in ContextMenu if any action is available
          if (hasContextMenu) {
            return (
              <ContextMenu key={tab}>
                <ContextMenuTrigger asChild>
                  {buttonElement}
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {canCopy && (
                    <ContextMenuItem
                      onClick={() => onCopyBreakpoint(tab)}
                      className="text-xs"
                    >
                      Copy {tab === "base" ? "Base" : tab.toUpperCase()}
                    </ContextMenuItem>
                  )}
                  {canPaste && (
                    <ContextMenuItem
                      onClick={() => onPasteBreakpoint(tab)}
                      className="text-xs"
                    >
                      Paste to {tab === "base" ? "Base" : tab.toUpperCase()}
                    </ContextMenuItem>
                  )}
                  {(canCopy || canPaste) && canReset && <ContextMenuSeparator />}
                  {canReset && (
                    <ContextMenuItem
                      onClick={() => onResetBreakpoint(tab)}
                      className="text-xs"
                    >
                      Reset {tab.toUpperCase()}
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            )
          }

          return <div key={tab}>{buttonElement}</div>
        })}
      </div>
    </div>
  )
}
