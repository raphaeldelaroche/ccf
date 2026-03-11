"use client"

import React from "react"
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
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { OptionState } from "@/lib/use-blob-compatibility"
import type { IconData } from "@/lib/blob-fields"
import { renderIconObject } from "@/lib/render-icon"

interface InspectorFieldProps {
  label: string
  value: string | boolean
  type: "text" | "textarea" | "select" | "checkbox" | "icon"
  /** Static options map (key → label). Ignored when compatOptions is provided. */
  options?: Record<string, string>
  /** Icon options — used when type === "icon". */
  iconOptions?: Record<string, IconData>
  /** Compatibility-aware options — takes precedence over `options`. */
  compatOptions?: OptionState[]
  /** Disable the entire field (e.g. not supported by current layout). */
  disabled?: boolean
  disabledReason?: string
  onChange: (value: string | boolean) => void
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
}: InspectorFieldProps) {
  // Local state keeps the input controlled and avoids cursor-jump on re-renders
  const [localValue, setLocalValue] = useState(value)

  // Sync local value when the block selection changes externally
  useEffect(() => {
    // Guard avoids a no-op setState (and its subsequent re-render)
    // when value arrives equal to what we already have locally
    if (value !== localValue) {
      setLocalValue(value)
    }
  // localValue intentionally excluded: we only want to react to external changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

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
        </Label>
      </div>
    )
  }

  if (type === "icon" && iconOptions) {
    const selectedKey = localValue as string
    const selectedIcon = selectedKey ? iconOptions[selectedKey] : undefined
    return (
      <div className="space-y-2">
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">{label}</Label>
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

  if (type === "select" && (options || compatOptions)) {
    // Shadcn Select.Item doesn't allow empty string values.
    // We use a sentinel "__none__" internally to represent "".
    const EMPTY_SENTINEL = "__none__"
    const toSelect = (v: string) => v === "" ? EMPTY_SENTINEL : v
    const fromSelect = (v: string) => v === EMPTY_SENTINEL ? "" : v

    const fieldContent = (
      <div className={cn("space-y-2", disabled && "opacity-40 pointer-events-none")}>
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">{label}</Label>
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
        <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">{label}</Label>
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
      <Label className="text-[11px] uppercase font-semibold tracking-wide mb-1">{label}</Label>
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
