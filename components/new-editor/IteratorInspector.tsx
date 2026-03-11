"use client"

import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { BlobInspector } from "./BlobInspector"
import { ItemBlobInspector } from "./ItemBlobInspector"
import { RepeaterInspector } from "./RepeaterInspector"
import { SIZES, generateItemFieldsOptions } from "@/lib/blob-fields"
import type { FormDataValue } from "@/types/editor"
import type { BlockNode } from "@/lib/new-editor/block-types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"


interface IteratorInspectorProps {
  blockId: string
  data: Record<string, FormDataValue>
  onUpdate: (updates: Record<string, FormDataValue>) => void
}

// Valeurs par défaut selon blob-iterator-definition.ts
const DEFAULT_ITEM_FIELDS = [
  "title",
  "emphasisText",
  "eyebrow",
  "eyebrowTheme",
  "subtitle",
  "markerContent",
  "markerIcon",
  "image",
  "video",
  "buttons",
  "contentText",
]

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T
  if (typeof value === "string" && value.length > 0) {
    try { return JSON.parse(value) as T } catch { /* ignore */ }
  }
  return fallback
}

export function IteratorInspector({ blockId, data, onUpdate }: IteratorInspectorProps) {
  const itemFields = parseJsonField<string[]>(data.itemFields, DEFAULT_ITEM_FIELDS)
  // Les items peuvent être BlockNode (nouveau format) ou Record plat (legacy)
  const rawItems = parseJsonField<Array<BlockNode | Record<string, FormDataValue>>>(data.items, [])

  // Convertir en BlockNode si nécessaire (migration à la volée)
  const items: BlockNode[] = rawItems.map((item, index) => {
    // Si c'est déjà un BlockNode, le retourner tel quel
    if ('blockType' in item && 'id' in item) {
      return item as BlockNode
    }
    // Sinon, convertir le format legacy en BlockNode
    return {
      id: `${blockId}-item-${index}`,
      blockType: 'blob' as const,
      data: item as Record<string, FormDataValue>,
      innerBlocks: []
    }
  })

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  const handleItemFieldsChange = (fieldKey: string, checked: boolean) => {
    const current = [...itemFields]
    if (checked && !current.includes(fieldKey)) {
      handleChange("itemFields", [...current, fieldKey])
    } else if (!checked && current.includes(fieldKey)) {
      // Retirer le champ de itemFields
      const newItemFields = current.filter((k) => k !== fieldKey)
      handleChange("itemFields", newItemFields)

      // Nettoyer ce champ de tous les items existants
      // pour éviter que les valeurs d'items écrasent les valeurs partagées
      if (items.length > 0) {
        const cleanedItems = items.map((item) => {
          // Retirer fieldKey de item.data
          const { [fieldKey]: _, ...restData } = item.data
          return { ...item, data: restData }
        })
        handleChange("items", cleanedItems as unknown as FormDataValue)
      }
    }
  }

  const arrayToOptions = (arr: readonly string[]) =>
    Object.fromEntries(arr.map((v) => [v, v]))

  return (
    <div>
      {/* Configuration du conteneur */}
      <CollapsibleSection title="Conteneur" defaultOpen={true}>
        <div className="pt-3 space-y-3">
          <InspectorField
            label="Disposition du conteneur"
            value={(data.iteratorLayout as string) || "grid-3"}
            type="select"
            options={{
              "grid-1": "Grille 1 colonne",
              "grid-2": "Grille 2 colonnes",
              "grid-3": "Grille 3 colonnes",
              "grid-4": "Grille 4 colonnes",
              "grid-5": "Grille 5 colonnes",
              "grid-6": "Grille 6 colonnes",
              "grid-auto": "Grille auto",
              swiper: "Carrousel",
            }}
            onChange={(v) => handleChange("iteratorLayout", v)}
          />
          <InspectorField
            label="Espacement horizontal"
            value={(data.iteratorGapX as string) || "md"}
            type="select"
            options={{ auto: "Auto (défaut)", none: "Aucun (0)", ...arrayToOptions(SIZES) }}
            onChange={(v) => handleChange("iteratorGapX", v)}
          />
          <InspectorField
            label="Espacement vertical"
            value={(data.iteratorGapY as string) || "md"}
            type="select"
            options={{ auto: "Auto (défaut)", none: "Aucun (0)", ...arrayToOptions(SIZES) }}
            onChange={(v) => handleChange("iteratorGapY", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Champs gérés par item */}
      <CollapsibleSection title="Champs des items">
        <div className="pt-3 space-y-1">
          <p className="text-xs text-muted-foreground mb-3">
            Sélectionnez les champs qui seront personnalisables pour chaque item.
            Les autres champs seront partagés par tous les items.
          </p>
          {Object.entries(generateItemFieldsOptions()).map(([key, label]) => {
            const isHeader = key.startsWith("section:")

            if (isHeader) {
              return (
                <div
                  key={key}
                  className="text-xs font-semibold text-muted-foreground mt-3 mb-1 pointer-events-none select-none"
                >
                  {label}
                </div>
              )
            }

            return (
              <div key={key} className="flex items-center space-x-2 py-0.5">
                <Checkbox
                  id={`itemField-${key}`}
                  checked={itemFields.includes(key)}
                  onCheckedChange={(checked) =>
                    handleItemFieldsChange(key, checked === true)
                  }
                />
                <Label
                  htmlFor={`itemField-${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Gestion des items */}
      <CollapsibleSection title="Items">
        <div className="pt-3">
          <RepeaterInspector
            label="Items"
            value={JSON.stringify(items)}
            fields={{}}
            popoverWidth="w-80"
            emptyMessage="Aucun item. Cliquez sur « Ajouter » pour commencer."
            getLabel={(row, i) => {
              const item = row as unknown as BlockNode
              return (item.data?.title as string)?.trim() || `Item ${i + 1}`
            }}
            buildNewRow={() => {
              // Créer un BlockNode complet avec ID au format ${iteratorId}-item-${timestamp}
              const itemId = `${blockId}-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
              const itemData: Record<string, FormDataValue> = {}

              // Initialiser tous les champs de itemFields (sauf innerBlocks)
              itemFields.forEach((f) => {
                if (f !== "innerBlocks") {
                  itemData[f] = ""
                }
              })

              // Créer le BlockNode complet
              const newItem: BlockNode = {
                id: itemId,
                blockType: "blob",
                data: itemData,
                innerBlocks: []
              }

              // Cast en RepeaterRow pour satisfaire TypeScript
              return newItem as unknown as Record<string, string>
            }}
            renderContent={(row, idx, _update) => {
              const item = row as unknown as BlockNode
              return (
                <ItemBlobInspector
                  item={item.data}
                  sharedData={data}
                  itemFields={itemFields}
                  onUpdate={(field, value) => {
                    // Mettre à jour item.data[field] et reconstruire l'item complet
                    const updatedData = { ...item.data, [field]: value }
                    const updatedItem = { ...item, data: updatedData }

                    // Mettre à jour l'item complet dans la liste
                    const updatedItems = items.map((it, i) =>
                      i === idx ? updatedItem : it
                    )
                    // Cast en FormDataValue car BlockNode[] n'est pas directement assignable
                    handleChange("items", updatedItems as unknown as FormDataValue)
                  }}
                />
              )
            }}
            onChange={(v) => handleChange("items", JSON.parse(v))}
          />
        </div>
      </CollapsibleSection>

      {/* Champs partagés — délégués à BlobInspector */}
      {/* Les champs dans itemFields sont gérés par item, innerBlocks est toujours masqué ici
          car géré via le canvas pour les items */}
      <BlobInspector data={data as Record<string, unknown>} onUpdate={onUpdate as (updates: Record<string, unknown>) => void} hiddenFields={[...itemFields, "innerBlocks"]} />
    </div>
  )
}
