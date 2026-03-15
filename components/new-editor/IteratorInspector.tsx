"use client"

import { useState, useMemo } from "react"
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { BlobInspector } from "./BlobInspector"
import { ItemBlobInspector } from "./ItemBlobInspector"
import { RepeaterInspector } from "./RepeaterInspector"
import { BreakpointTabs } from "./BreakpointTabs"
import { ItemFieldsCombobox } from "./ItemFieldsCombobox"
import { SIZES, generateItemFieldsOptions } from "@/lib/blob-fields"
import type { FormDataValue } from "@/types/editor"
import type { BlockNode } from "@/lib/new-editor/block-types"
import { useUser } from "@/lib/auth/UserContext"
import { canEditField } from "@/lib/auth/field-permissions"
import {
  type Breakpoint,
  type ResponsiveProps,
  getBreakpointsWithOverrides
} from "@/lib/responsive-utils"
import type { ResponsiveBreakpointProps } from "@/lib/blob-compose"


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
  const { user } = useUser()
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>("base")
  const [copiedBreakpointValues, setCopiedBreakpointValues] = useState<ResponsiveBreakpointProps | null>(null)

  const itemFields = parseJsonField<string[]>(data.itemFields, DEFAULT_ITEM_FIELDS)
  // Les items peuvent être BlockNode (nouveau format) ou Record plat (legacy)
  const rawItems = parseJsonField<Array<BlockNode | Record<string, FormDataValue>>>(data.items, [])

  const responsiveData = useMemo(
    () => (data.responsive as ResponsiveProps) || {},
    [data.responsive]
  )
  const overrides = useMemo(() => getBreakpointsWithOverrides(responsiveData), [responsiveData])

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

  // Check permissions - all fields in "Conteneur" and "Champs des items" are layout-style
  const canEditLayoutFields = canEditField(user.role, 'select')
  const canSeeResponsive = user.role === 'engineer' || user.role === 'reviewer'

  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  const handleResponsiveChange = (key: string, value: string | boolean) => {
    const newResponsive = { ...responsiveData }

    if (!newResponsive[activeBreakpoint]) {
      newResponsive[activeBreakpoint] = {}
    }

    // If value is empty/undefined, remove it from the breakpoint
    if (value === "" || value === undefined || value === null || value === "auto") {
      const breakpointData = { ...newResponsive[activeBreakpoint] }
      delete breakpointData[key as keyof typeof breakpointData]

      // If breakpoint is now empty, remove it entirely (except base)
      if (Object.keys(breakpointData).length === 0 && activeBreakpoint !== "base") {
        delete newResponsive[activeBreakpoint]
      } else {
        newResponsive[activeBreakpoint] = breakpointData
      }
    } else {
      newResponsive[activeBreakpoint] = {
        ...newResponsive[activeBreakpoint],
        [key]: value
      }
    }

    onUpdate({ responsive: newResponsive })
  }

  const handleResetBreakpoint = (breakpoint: Breakpoint) => {
    if (breakpoint === "base") return

    const newResponsive = { ...responsiveData }
    delete newResponsive[breakpoint]
    onUpdate({ responsive: newResponsive })
  }

  const handleCopyBreakpoint = (breakpoint: Breakpoint) => {
    const breakpointData = responsiveData[breakpoint] || {}
    setCopiedBreakpointValues(breakpointData)
  }

  const handlePasteBreakpoint = (breakpoint: Breakpoint) => {
    if (!copiedBreakpointValues) return

    const newResponsive = { ...responsiveData }
    newResponsive[breakpoint] = { ...copiedBreakpointValues }
    onUpdate({ responsive: newResponsive })
  }

  const handleItemFieldsChange = (newItemFields: string[]) => {
    const current = [...itemFields]

    // Détecter les champs retirés
    const removedFields = current.filter(field => !newItemFields.includes(field))

    // Mettre à jour itemFields
    handleChange("itemFields", newItemFields)

    // Nettoyer les champs retirés de tous les items existants
    // pour éviter que les valeurs d'items écrasent les valeurs partagées
    if (removedFields.length > 0 && items.length > 0) {
      const cleanedItems = items.map((item) => {
        const newData = { ...item.data }
        removedFields.forEach(fieldKey => {
          delete newData[fieldKey]
        })
        return { ...item, data: newData }
      })
      handleChange("items", cleanedItems as unknown as FormDataValue)
    }
  }

  const arrayToOptions = (arr: readonly string[]) =>
    Object.fromEntries(arr.map((v) => [v, v]))

  // Helper to get responsive value for iterator fields
  const getIteratorValue = (fieldKey: string, defaultValue: string) => {
    if (canSeeResponsive && responsiveData[activeBreakpoint]?.[fieldKey as keyof typeof responsiveData[typeof activeBreakpoint]]) {
      return responsiveData[activeBreakpoint][fieldKey as keyof typeof responsiveData[typeof activeBreakpoint]] as string
    }
    // Check base breakpoint
    if (canSeeResponsive && activeBreakpoint !== "base" && responsiveData.base?.[fieldKey as keyof typeof responsiveData.base]) {
      return responsiveData.base[fieldKey as keyof typeof responsiveData.base] as string
    }
    // Fallback to legacy direct field
    return (data[fieldKey] as string) || defaultValue
  }

  return (
    <div>
      {/* BreakpointTabs - Engineers/Reviewers only */}
      {canSeeResponsive && (
        <BreakpointTabs
          activeTab={activeBreakpoint}
          onTabChange={setActiveBreakpoint}
          overrides={overrides}
          onResetBreakpoint={handleResetBreakpoint}
          onCopyBreakpoint={handleCopyBreakpoint}
          onPasteBreakpoint={handlePasteBreakpoint}
          hasCopiedValues={copiedBreakpointValues !== null}
        />
      )}

      {/* Configuration du conteneur - Engineers only */}
      {canEditLayoutFields && (
        <CollapsibleSection title="Conteneur" defaultOpen={true}>
          <div className="pt-3 space-y-3">
            <InspectorField
              label="Disposition du conteneur"
              value={getIteratorValue("iteratorLayout", "grid-3")}
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
              onChange={(v) => canSeeResponsive ? handleResponsiveChange("iteratorLayout", v) : handleChange("iteratorLayout", v)}
              currentBreakpoint={canSeeResponsive ? activeBreakpoint : undefined}
              responsiveValues={canSeeResponsive ? responsiveData : undefined}
              fieldKey="iteratorLayout"
            />
            <InspectorField
              label="Espacement horizontal"
              value={getIteratorValue("iteratorGapX", "md")}
              type="select"
              options={{ auto: "Auto (défaut)", none: "Aucun (0)", ...arrayToOptions(SIZES) }}
              onChange={(v) => canSeeResponsive ? handleResponsiveChange("iteratorGapX", v) : handleChange("iteratorGapX", v)}
              currentBreakpoint={canSeeResponsive ? activeBreakpoint : undefined}
              responsiveValues={canSeeResponsive ? responsiveData : undefined}
              fieldKey="iteratorGapX"
            />
            <InspectorField
              label="Espacement vertical"
              value={getIteratorValue("iteratorGapY", "md")}
              type="select"
              options={{ auto: "Auto (défaut)", none: "Aucun (0)", ...arrayToOptions(SIZES) }}
              onChange={(v) => canSeeResponsive ? handleResponsiveChange("iteratorGapY", v) : handleChange("iteratorGapY", v)}
              currentBreakpoint={canSeeResponsive ? activeBreakpoint : undefined}
              responsiveValues={canSeeResponsive ? responsiveData : undefined}
              fieldKey="iteratorGapY"
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Gestion des items - Only on Base tab */}
      {activeBreakpoint === "base" && (
      <CollapsibleSection title="Items">
        <div className="pt-3 space-y-4">
          {/* Champs gérés par item - Engineers only */}
          {canEditLayoutFields && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Champs pour chaque item
              </label>
              <p className="text-xs text-muted-foreground">
                Sélectionnez les champs personnalisables par item. Les autres seront partagés.
              </p>
              <ItemFieldsCombobox
                options={Object.entries(generateItemFieldsOptions())
                  .filter(([key]) => !key.startsWith("section:"))
                  .map(([value, label]) => {
                    // Déterminer la section basée sur les clés précédentes
                    const allEntries = Object.entries(generateItemFieldsOptions())
                    const currentIndex = allEntries.findIndex(([k]) => k === value)
                    let section = "Autres"

                    for (let i = currentIndex - 1; i >= 0; i--) {
                      const [key, label] = allEntries[i]
                      if (key.startsWith("section:")) {
                        section = label
                        break
                      }
                    }

                    return { value, label, section }
                  })}
                value={itemFields}
                onChange={handleItemFieldsChange}
                placeholder="Tous les champs sont partagés"
              />
            </div>
          )}

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
      )}

      {/* Champs partagés — délégués à BlobInspector */}
      {/* Les champs dans itemFields sont gérés par item, innerBlocks est toujours masqué ici
          car géré via le canvas pour les items */}
      <BlobInspector
        data={data as Record<string, unknown>}
        onUpdate={onUpdate as (updates: Record<string, unknown>) => void}
        hiddenFields={[...itemFields, "innerBlocks"]}
        externalActiveBreakpoint={canSeeResponsive ? activeBreakpoint : undefined}
        hideBreakpointTabs={true}
      />
    </div>
  )
}
