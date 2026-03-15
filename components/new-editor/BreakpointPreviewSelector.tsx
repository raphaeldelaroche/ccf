"use client"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'

interface BreakpointConfig {
  label: string
  width: string
}

const BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  base: { label: 'Base', width: '375px' },
  sm: { label: 'SM', width: '640px' },
  md: { label: 'MD', width: '768px' },
  lg: { label: 'LG', width: '1024px' },
  xl: { label: 'XL', width: '1280px' },
  '2xl': { label: '2XL', width: '1536px' },
  auto: { label: 'Auto', width: '100%' },
}

interface BreakpointPreviewSelectorProps {
  value: Breakpoint
  onChange: (breakpoint: Breakpoint) => void
}

export function BreakpointPreviewSelector({ value, onChange }: BreakpointPreviewSelectorProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 border border-gray-200 rounded-md p-0.5 bg-white">
        {(Object.keys(BREAKPOINTS) as Breakpoint[]).map((breakpoint) => {
          const config = BREAKPOINTS[breakpoint]
          const isActive = value === breakpoint

          return (
            <Tooltip key={breakpoint}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(breakpoint)}
                  className={`h-7 px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {config.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  {breakpoint === 'auto' ? 'Full width' : `${config.label} (${config.width})`}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
