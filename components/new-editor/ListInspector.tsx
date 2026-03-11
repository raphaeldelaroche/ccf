"use client"

import { CollapsibleSection } from "./CollapsibleSection"
import { InspectorField } from "./InspectorField"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { iconOptions } from "@/lib/blob-fields"
import type { FormDataValue } from "@/types/editor"

interface ListItem {
  title: string
  subtitle?: string
}

interface ListInspectorProps {
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

function parseItems(value: unknown): ListItem[] {
  if (Array.isArray(value)) return value as ListItem[]
  if (typeof value === "string" && value.length > 0) {
    try { return JSON.parse(value) } catch { /* ignore */ }
  }
  return []
}

export function ListInspector({ data, onUpdate }: ListInspectorProps) {
  const items = parseItems(data.items)

  const commit = (next: ListItem[]) => onUpdate({ items: next as unknown as FormDataValue })

  const addItem = () => commit([...items, { title: "", subtitle: "" }])
  const removeItem = (i: number) => commit(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof ListItem, value: string) =>
    commit(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div>
      <CollapsibleSection title="Style" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Icône"
            value={(data.icon as string) || "arrowRight"}
            type="icon"
            iconOptions={iconOptions}
            onChange={(v) => onUpdate({ icon: v })}
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Items" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-1">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1 space-y-1">
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  placeholder="Titre"
                  className="h-8 text-sm"
                />
                <Input
                  value={item.subtitle || ""}
                  onChange={(e) => updateItem(i, "subtitle", e.target.value)}
                  placeholder="Sous-titre (optionnel)"
                  className="h-8 text-sm"
                />
              </div>
              <button
                onClick={() => removeItem(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-1"
            onClick={addItem}
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter un item
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  )
}
