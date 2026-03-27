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
// Removed unused import: renderIconObject
import { getBreakpointValue, type Breakpoint, type ResponsiveProps } from "@/lib/responsive-utils"
import { IconifyPicker } from "./IconifyPicker"
import { ImagePicker } from "./ImagePicker"

interface InspectorFieldProps {
  label: string
  value: string | boolean | string[] | IconData | null
  type: "text" | "textarea" | "select" | "checkbox" | "icon" | "multiselect" | "file"
  /** Static options map (key → label). Ignored when compatOptions is provided. */
  options?: Record<string, string>
  /** Icon options — DEPRECATED: kept for backward compatibility, now using IconifyPicker. */
  iconOptions?: Record<string, IconData>
  /** Compatibility-aware options — takes precedence over `options`. */
  compatOptions?: OptionState[]
  /** Disable the entire field (e.g. not supported by current layout). */
  disabled?: boolean
  disabledReason?: string
  onChange: (value: string | boolean | string[] | IconData | null) => void
  /** Current breakpoint being edited (for responsive mode) */
  currentBreakpoint?: Breakpoint
  /** Responsive values object (for determining inherited values) */
  responsiveValues?: ResponsiveProps
  /** Field key (needed for responsive value lookup) */
  fieldKey?: string
  /** Reset handler for clearing a breakpoint-specific value */
  onReset?: () => void
}

export function InspectorField({
  label,
  value,
  type,
  options,
  iconOptions: _iconOptions,
  compatOptions,
  disabled = false,
  disabledReason,
  onChange,
  currentBreakpoint,
  responsiveValues,
  fieldKey,
  onReset,
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
      <span className="text-[10px] uppercase text-muted-foreground">
        from {inheritedFrom}
      </span>
    )
  }

  // Helper to render reset button
  const ResetButton = () => {
    if (!onReset) return null

    // For responsive fields: check if there's a value set
    if (currentBreakpoint && fieldKey && responsiveValues) {
      const hasValue = responsiveValues[currentBreakpoint]
        && responsiveValues[currentBreakpoint]![fieldKey as keyof typeof responsiveValues[typeof currentBreakpoint]] !== undefined

      if (!hasValue) return null

      // For base: always show reset (clears the value)
      // For other breakpoints: only show if not inherited (has override)
      if (currentBreakpoint !== "base" && inheritedFrom !== null) {
        return null
      }
    } else {
      // For non-responsive fields, check if there's a value
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        return null
      }
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onReset()
              }}
              className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Reset value"
            >
              <X className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Reset value
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (type === "checkbox") {
    // Normalize: propSchema stores "true"/"false" strings, not booleans.
    // Read from localValue (not value) so the checkbox updates immediately on
    // click, without waiting for the BlockNote updateBlock → onSelectionChange
    // → re-render round-trip.
    const isChecked = localValue === true || localValue === "true"
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={label}
            checked={isChecked}
            onCheckedChange={(checked) => {
              const next = checked === true
              setLocalValue(next)
              onChange(next)
            }}
            className={cn(inheritedFrom && "opacity-50")}
          />
          <Label htmlFor={label} className={cn("text-sm font-normal", inheritedFrom && "opacity-60")}>
            {label}
          </Label>
        </div>
        <div className="flex items-center gap-1">
          <ResetButton />
          <InheritanceBadge />
        </div>
      </div>
    )
  }

  if (type === "icon") {
    const iconValue = localValue as IconData | null
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase font-semibold tracking-wide">
            {label}
          </span>
          <div className="flex items-center gap-1">
            <ResetButton />
            <InheritanceBadge />
          </div>
        </div>
        <IconifyPicker
          value={iconValue}
          onChange={(newIcon) => {
            setLocalValue(newIcon)
            onChange(newIcon)
          }}
          label=""
          showSizeControl={true}
          showStrokeControl={true}
        />
      </div>
    )
  }

  if (type === "file") {
    const fileValue = localValue as string | null
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] uppercase font-semibold tracking-wide">
            {label}
          </span>
          <div className="flex items-center gap-1">
            <ResetButton />
            <InheritanceBadge />
          </div>
        </div>
        <ImagePicker
          value={fileValue}
          onChange={(newPath) => {
            setLocalValue(newPath)
            onChange(newPath)
          }}
          label=""
        />
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <Label className="text-[11px] uppercase font-semibold tracking-wide">
            {label}
          </Label>
          <div className="flex items-center gap-1">
            <ResetButton />
            <InheritanceBadge />
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn("w-full justify-between h-auto min-h-8 py-1.5 text-sm", inheritedFrom && "opacity-50")}
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <Label className="text-[11px] uppercase font-semibold tracking-wide">
            {label}
          </Label>
          <div className="flex items-center gap-1">
            <ResetButton />
            <InheritanceBadge />
          </div>
        </div>
        <Select
          disabled={disabled}
          value={toSelect(localValue as string)}
          onValueChange={(v) => {
            const raw = fromSelect(v)
            setLocalValue(raw)
            onChange(raw)
          }}
        >
          <SelectTrigger className={cn("h-8 w-full", inheritedFrom && "opacity-60")}>
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <Label className="text-[11px] uppercase font-semibold tracking-wide">
            {label}
          </Label>
          <div className="flex items-center gap-1">
            <ResetButton />
            <InheritanceBadge />
          </div>
        </div>
        <Textarea
          value={localValue as string}
          onChange={(e) => {
            setLocalValue(e.target.value)
            onChange(e.target.value)
          }}
          className={cn("min-h-[80px] text-sm", inheritedFrom && "opacity-60")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <Label className="text-[11px] uppercase font-semibold tracking-wide">
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <ResetButton />
          <InheritanceBadge />
        </div>
      </div>
      <Input
        value={localValue as string}
        onChange={(e) => {
          setLocalValue(e.target.value)
          onChange(e.target.value)
        }}
        className={cn("h-8 text-sm", inheritedFrom && "opacity-60")}
      />
    </div>
  )
}
