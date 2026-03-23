"use client"

import React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { OptionState } from "@/lib/use-blob-compatibility"
import type { IconData } from "@/lib/blob-fields"
import { renderIconObject } from "@/lib/render-icon"
import { getBreakpointValue, type Breakpoint, type ResponsiveProps } from "@/lib/responsive-utils"

interface InspectorFieldProps {
  label: string
  value: string | boolean | string[]
  type: "text" | "textarea" | "select" | "checkbox" | "icon" | "multiselect"
  /** Static options map (key → label). Ignored when compatOptions is provided. */
  options?: Record<string, string>
  /** Icon options — used when type === "icon". */
  iconOptions?: Record<string, IconData>
  /** Compatibility-aware options — takes precedence over `options`. */
  compatOptions?: OptionState[]
  /** Disable the entire field (e.g. not supported by current layout). */
  disabled?: boolean
  disabledReason?: string
  onChange: (value: string | boolean | string[]) => void
  /** Current breakpoint being edited (for responsive mode) */
  currentBreakpoint?: Breakpoint
  /** Responsive values object (for determining inherited values) */
  responsiveValues?: ResponsiveProps
  /** Field key (needed for responsive value lookup) */
  fieldKey?: string
}

export function InspectorField({
  label,
  value,
  type,
  options,
  iconOptions,
  compatOptions,
  disabled = false,
  disabledReason,
  onChange,
  currentBreakpoint,
  responsiveValues,
  fieldKey,
}: InspectorFieldProps) {
  // Compute responsive value and inheritance info
  const { effectiveValue, inheritedFrom } = React.useMemo(() => {
    if (currentBreakpoint && fieldKey && responsiveValues) {
      const result = getBreakpointValue(responsiveValues, currentBreakpoint, fieldKey)
      // If no value found in responsive, use the provided value as fallback
      return {
        effectiveValue: result.value !== undefined ? result.value : value,
        inheritedFrom: result.inheritedFrom
      }
    }
    return { effectiveValue: value, inheritedFrom: null }
  }, [value, currentBreakpoint, responsiveValues, fieldKey])

  // Local state keeps the input controlled and avoids cursor-jump on re-renders
  const [localValue, setLocalValue] = useState(effectiveValue)

  // Sync local value when the block selection changes externally or breakpoint changes
  useEffect(() => {
    // Guard avoids a no-op setState (and its subsequent re-render)
    // when value arrives equal to what we already have locally
    if (effectiveValue !== localValue) {
      setLocalValue(effectiveValue)
    }
  // localValue intentionally excluded: we only want to react to external changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveValue])

  // Helper to render inheritance badge
  const InheritanceBadge = () => {
    if (!inheritedFrom) return null
    return (
      <span className="ml-2 text-[10px] text-muted-foreground italic">
        (from {inheritedFrom})
      </span>
    )
  }

  if (type === "checkbox") {
    // Normalize: propSchema stores "true"/"false" strings, not booleans.
    // Read from localValue (not value) so the checkbox updates immediately on
    // click, without waiting for the BlockNote updateBlock → onSelectionChange
    // → re-render round-trip.
    const isChecked = localValue === true || localValue === "true"
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={label}
          checked={isChecked}
          onCheckedChange={(checked) => {
            const next = checked === true
            setLocalValue(next)
            onChange(next)
          }}
        />
        <Label htmlFor={label} className="text-sm font-normal">
          {label}
          <InheritanceBadge />
        </Label>
      </div>
    )
  }

  if (type === "icon" && iconOptions) {
    const selectedKey = localValue as string
    const selectedIcon = selectedKey ? iconOptions[selectedKey] : undefined
    return (
      <div className="space-y-2">
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
          {label}
          <InheritanceBadge />
        </Label>
        <Select
          value={selectedKey || ""}
          onValueChange={(v) => {
            setLocalValue(v)
            onChange(v)
          }}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Choisir…">
              {selectedIcon && (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3">{renderIconObject(selectedIcon.iconObject)}</div>
                  <span>{selectedIcon.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(iconOptions).map(([key, iconData]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3">{renderIconObject(iconData.iconObject)}</div>
                  <span>{iconData.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (type === "multiselect" && options) {
    const selectedValues = Array.isArray(localValue) ? localValue as string[] : []

    const toggleOption = (optionValue: string) => {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      setLocalValue(next)
      onChange(next)
    }

    const removeOption = (optionValue: string) => {
      const next = selectedValues.filter((v) => v !== optionValue)
      setLocalValue(next)
      onChange(next)
    }

    const selectedOptions = Object.entries(options).filter(([key]) => selectedValues.includes(key))

    return (
      <div className="space-y-2">
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
          {label}
          <InheritanceBadge />
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between h-auto min-h-8 py-1.5 text-sm"
            >
              <span className="text-muted-foreground truncate">
                {selectedValues.length > 0
                  ? `${selectedValues.length} style${selectedValues.length > 1 ? "s" : ""}`
                  : "Aucun"}
              </span>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher..." />
              <CommandList>
                <CommandEmpty>Aucun style trouvé.</CommandEmpty>
                <CommandGroup>
                  {Object.entries(options).map(([key, optLabel]) => {
                    const isSelected = selectedValues.includes(key)
                    return (
                      <CommandItem
                        key={key}
                        value={key}
                        onSelect={() => toggleOption(key)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {optLabel}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedOptions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(([key, optLabel]) => (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {optLabel}
                <button
                  type="button"
                  onClick={() => removeOption(key)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === "select" && (options || compatOptions)) {
    // Shadcn Select.Item doesn't allow empty string values.
    // We use a sentinel "__none__" internally to represent "".
    const EMPTY_SENTINEL = "__none__"
    const toSelect = (v: string) => v === "" ? EMPTY_SENTINEL : v
    const fromSelect = (v: string) => v === EMPTY_SENTINEL ? "" : v

    const fieldContent = (
      <div className={cn("space-y-2", disabled && "opacity-40 pointer-events-none")}>
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
          {label}
          <InheritanceBadge />
        </Label>
        <Select
          disabled={disabled}
          value={toSelect(localValue as string)}
          onValueChange={(v) => {
            const raw = fromSelect(v)
            setLocalValue(raw)
            onChange(raw)
          }}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {compatOptions
              ? compatOptions.map(({ value: key, label: optLabel, disabled: optDisabled }) => (
                  <SelectItem key={key || EMPTY_SENTINEL} value={toSelect(key)} disabled={optDisabled}>
                    {optLabel}
                  </SelectItem>
                ))
              : Object.entries(options!).map(([key, optLabel]) => (
                  <SelectItem key={key || EMPTY_SENTINEL} value={toSelect(key)}>
                    {optLabel}
                  </SelectItem>
                ))
            }
          </SelectContent>
        </Select>
      </div>
    )

    if (disabled && disabledReason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{fieldContent}</div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[220px] text-xs">
              {disabledReason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return fieldContent
  }

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
          {label}
          <InheritanceBadge />
        </Label>
        <Textarea
          value={localValue as string}
          onChange={(e) => {
            setLocalValue(e.target.value)
            onChange(e.target.value)
          }}
          className="min-h-[80px] text-sm"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">
        {label}
        <InheritanceBadge />
      </Label>
      <Input
        value={localValue as string}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        className="h-8 text-sm"
      />
    </div>
  )
}
