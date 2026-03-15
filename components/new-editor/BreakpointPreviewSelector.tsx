"use client"

import { Monitor, Smartphone, Tablet, Laptop, Maximize } from "lucide-react"
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
  icon: React.ComponentType<{ className?: string }>
}

const BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  base: { label: 'Base', width: '375px', icon: Smartphone },
  sm: { label: 'SM', width: '640px', icon: Smartphone },
  md: { label: 'MD', width: '768px', icon: Tablet },
  lg: { label: 'LG', width: '1024px', icon: Laptop },
  xl: { label: 'XL', width: '1280px', icon: Monitor },
  '2xl': { label: '2XL', width: '1536px', icon: Monitor },
  auto: { label: 'Auto', width: '100%', icon: Maximize },
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
          const Icon = config.icon
          const isActive = value === breakpoint

          return (
            <Tooltip key={breakpoint}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange(breakpoint)}
                  className={`h-7 px-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1" />
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
