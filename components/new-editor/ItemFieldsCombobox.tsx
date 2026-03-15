"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface ItemFieldOption {
  value: string
  label: string
  section?: string
}

interface ItemFieldsComboboxProps {
  options: ItemFieldOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function ItemFieldsCombobox({
  options,
  value,
  onChange,
  placeholder = "Sélectionner des champs...",
}: ItemFieldsComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  // Group options by section
  const sections = React.useMemo(() => {
    const grouped = new Map<string, ItemFieldOption[]>()

    options.forEach((option) => {
      const section = option.section || "Autres"
      if (!grouped.has(section)) {
        grouped.set(section, [])
      }
      grouped.get(section)!.push(option)
    })

    return Array.from(grouped.entries())
  }, [options])

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const removeOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-9 py-2"
          >
            <span className="text-sm text-muted-foreground truncate">
              {value.length > 0
                ? `${value.length} champ${value.length > 1 ? "s" : ""} sélectionné${value.length > 1 ? "s" : ""}`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un champ..." />
            <CommandList>
              <CommandEmpty>Aucun champ trouvé.</CommandEmpty>
              {sections.map(([section, sectionOptions]) => (
                <CommandGroup key={section} heading={section}>
                  {sectionOptions.map((option) => {
                    const isSelected = value.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          toggleOption(option.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected badges */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs px-2 py-0.5"
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeOption(option.value)}
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
