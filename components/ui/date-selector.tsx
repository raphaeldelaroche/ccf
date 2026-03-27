"use client"

import * as React from "react"
import { Input } from "./input"

interface DateSelectorProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
  placeholder?: string
  required?: boolean
}

/**
 * DateSelector - Composant de sélection de date simple
 * Utilise un input HTML type="date" natif
 */
export default function DateSelector({
  id,
  name,
  value,
  onChange,
  error,
  className,
  placeholder,
  required,
}: DateSelectorProps) {
  return (
    <div className="space-y-2">
      <Input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
