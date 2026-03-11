import { MappedButtonTooltipData } from '@/lib/button-tooltip-mapper'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlockButtonTooltipProps {
  data: MappedButtonTooltipData
}

/**
 * Tooltip personnalisé avec fond blanc
 */
function WhiteTooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "z-50 rounded-md px-3 py-1.5 bg-white border border-gray-200 shadow-md",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-white" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

/**
 * Composant BlockButtonTooltip
 * Affiche une liste de boutons avec tooltips
 */
export function BlockButtonTooltip({ data }: BlockButtonTooltipProps) {
  const { layout, spacing, align, size, tooltips } = data

  // Map spacing values to Tailwind gap classes
  const spacingMap: Record<string, string> = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  }

  // Map align values to Tailwind justify classes
  const alignMap: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  const containerClasses = cn(
    'flex',
    layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
    spacingMap[spacing] || 'gap-4',
    alignMap[align] || 'justify-start'
  )

  if (tooltips.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
        Aucun tooltip configuré
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <TooltipPrimitive.Provider delayDuration={0}>
        {tooltips.map((item, index) => (
          <TooltipPrimitive.Root key={index}>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="outline"
                size={size}
                className="bg-white"
              >
                {item.label || `Bouton ${index + 1}`}
              </Button>
            </TooltipPrimitive.Trigger>
            <WhiteTooltipContent>
              <p className="max-w-xs text-center whitespace-pre-wrap text-sm text-gray-900">
                {item.content || 'Contenu du tooltip'}
              </p>
            </WhiteTooltipContent>
          </TooltipPrimitive.Root>
        ))}
      </TooltipPrimitive.Provider>
    </div>
  )
}
