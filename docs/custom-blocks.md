# Créer un nouveau bloc custom

Le système supporte la création de blocs custom indépendants (comme `ButtonTooltip`) qui peuvent être ajoutés n'importe où dans l'éditeur, au même titre que `Blob` et `BlobIterator`.

## Protocole de création en 8 étapes

### Exemple concret

Création d'un bloc `ButtonTooltip` - un répéteur de boutons avec tooltips.

---

## 1. Définir le type de bloc

**Fichier** : `/lib/new-editor/block-types.ts`

```typescript
export type BlockType = 'blob' | 'blobIterator' | 'buttonTooltip';
```

---

## 2. Créer les définitions de champs

**Fichier** : `/lib/button-tooltip-fields.ts` (nouveau)

```typescript
import type { FieldSection } from './blob-fields'

export const buttonTooltipFields: Record<string, FieldSection> = {
  tooltips: {
    label: "Tooltips",
    fields: {
      tooltips: {
        type: "repeater",
        label: "Liste des tooltips",
        fields: {
          label: { type: "text", label: "Label du bouton" },
          content: { type: "textarea", label: "Contenu du tooltip" },
          linkLabel: { type: "text", label: "Label du lien (optionnel)" },
          linkUrl: { type: "text", label: "URL du lien (optionnel)" },
        },
      },
    },
  },
  configuration: {
    label: "Configuration",
    fields: {
      layout: {
        type: "dropdown",
        label: "Disposition",
        options: { horizontal: "Horizontale", vertical: "Verticale" },
      },
      spacing: { /* ... */ },
      align: { /* ... */ },
    },
  },
  buttonStyle: {
    label: "Style des boutons",
    fields: {
      variant: { /* ... */ },
      size: { /* ... */ },
    },
  },
}
```

**Types de champs disponibles** : `text`, `textarea`, `dropdown`, `checkbox`, `repeater`, `multiselect`, `icon`, `image`, `video`

---

## 3. Créer la fonction mapper

**Fichier** : `/lib/button-tooltip-mapper.ts` (nouveau)

```typescript
import type { FormDataValue } from '@/types/editor'

export interface TooltipItem {
  label: string
  content: string
  linkLabel?: string
  linkUrl?: string
}

export interface MappedButtonTooltipData {
  layout: string
  spacing: string
  align: string
  variant: string
  size: string
  tooltips: TooltipItem[]
}

export function mapButtonTooltipFormData(
  formData: ButtonTooltipFormData
): MappedButtonTooltipData {
  const rawTooltips = parseJsonField<any[]>(formData.tooltips, [])

  const tooltips: TooltipItem[] = rawTooltips.map((item) => ({
    label: item?.label || "",
    content: item?.content || "",
    linkLabel: item?.linkLabel || undefined,
    linkUrl: item?.linkUrl || undefined,
  }))

  return {
    layout: formData.layout || "horizontal",
    spacing: formData.spacing || "md",
    align: formData.align || "left",
    variant: formData.variant || "default",
    size: formData.size || "default",
    tooltips,
  }
}
```

---

## 4. Créer le composant React

**Fichier** : `/components/blocks/BlockButtonTooltip.tsx` (nouveau)

```typescript
import { MappedButtonTooltipData } from '@/lib/button-tooltip-mapper'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Button } from '@/components/ui/button'

export function BlockButtonTooltip({ data }: { data: MappedButtonTooltipData }) {
  const { layout, spacing, align, variant, size, tooltips } = data

  return (
    <div className={/* classes basées sur layout, spacing, align */}>
      <TooltipPrimitive.Provider delayDuration={0}>
        {tooltips.map((item, index) => (
          <TooltipPrimitive.Root key={index}>
            <TooltipPrimitive.Trigger asChild>
              <Button variant="outline" size={size as any}>
                {item.label || `Bouton ${index + 1}`}
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipContent>
              <p>{item.content}</p>
              {item.linkLabel && item.linkUrl && (
                <Link href={item.linkUrl}>{item.linkLabel} →</Link>
              )}
            </TooltipContent>
          </TooltipPrimitive.Root>
        ))}
      </TooltipPrimitive.Provider>
    </div>
  )
}
```

---

## 5. Créer l'inspecteur

**Fichier** : `/components/new-editor/ButtonTooltipInspector.tsx` (nouveau)

```typescript
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import { buttonTooltipFields } from "@/lib/button-tooltip-fields"

export function ButtonTooltipInspector({ data, onUpdate }) {
  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  return (
    <div>
      {Object.entries(buttonTooltipFields).map(([sectionKey, section]) => (
        <CollapsibleSection key={sectionKey} title={section.label}>
          <div className="pt-3 space-y-3">
            {Object.entries(section.fields).map(([fieldKey, fieldDef]) => {
              if (fieldDef.type === "repeater") {
                return (
                  <RepeaterInspector
                    key={fieldKey}
                    label={fieldDef.label}
                    value={JSON.stringify(data[fieldKey] || [])}
                    fields={fieldDef.fields}
                    onChange={(v) => handleChange(fieldKey, JSON.parse(v))}
                  />
                )
              }

              return (
                <InspectorField
                  key={fieldKey}
                  label={fieldDef.label}
                  value={data[fieldKey] || ""}
                  type={fieldDef.type}
                  options={fieldDef.options}
                  onChange={(v) => handleChange(fieldKey, v)}
                />
              )
            })}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  )
}
```

---

## 6. Enregistrer le bloc

**Fichier** : `/lib/new-editor/block-registry.ts`

```typescript
import { HelpCircle } from 'lucide-react'
import { buttonTooltipFields } from '@/lib/button-tooltip-fields'

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  // ... blob, blobIterator

  buttonTooltip: {
    label: 'Button Tooltip',
    icon: HelpCircle,
    description: 'Boutons avec tooltips interactifs',
    allowedInnerBlocks: [], // Pas de blocs imbriqués
    sections: buttonTooltipFields,
    initialValues: {
      layout: 'horizontal',
      spacing: 'md',
      align: 'left',
      variant: 'default',
      size: 'default',
      tooltips: '[]',
    },
  },
}
```

---

## 7. Intégrer dans l'inspecteur de l'éditeur

**Fichier** : `/components/new-editor/BlockInspector.tsx`

```typescript
import { ButtonTooltipInspector } from './ButtonTooltipInspector'

export function BlockInspector({ selectedBlock, onUpdateBlock }) {
  // ...
  return (
    <ScrollArea>
      {selectedBlock.blockType === "blob" && <BlobInspector ... />}
      {selectedBlock.blockType === "blobIterator" && <IteratorInspector ... />}
      {selectedBlock.blockType === "buttonTooltip" && (
        <ButtonTooltipInspector
          data={selectedBlock.data}
          onUpdate={handleUpdate}
        />
      )}
    </ScrollArea>
  )
}
```

---

## 8. Intégrer dans les renderers

### Éditeur

**Fichier** : `/components/new-editor/BlockRenderer.tsx`

```typescript
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"

const renderBlockContent = () => {
  // ... cas blob, blobIterator

  if (block.blockType === "buttonTooltip") {
    const mappedData = mapButtonTooltipFormData(block.data)
    return <BlockButtonTooltip data={mappedData} />
  }
}
```

### Pages publiques

**Fichier** : `/lib/render-page-blocks.tsx`

```typescript
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"

export function renderBlock(block: BlockNode): React.ReactNode {
  switch (block.blockType) {
    // ... cas blob, blobIterator

    case "buttonTooltip": {
      const mappedData = mapButtonTooltipFormData(block.data)
      return <BlockButtonTooltip key={block.id} data={mappedData} />
    }
  }
}
```

---

## Résumé des fichiers

### Nouveaux fichiers (4)

- `/lib/[block-name]-fields.ts` - Définitions des champs
- `/lib/[block-name]-mapper.ts` - Transformation FormData → Props
- `/components/blocks/Block[Name].tsx` - Composant React de rendu
- `/components/new-editor/[Name]Inspector.tsx` - Interface d'édition

### Fichiers modifiés (4)

- `/lib/new-editor/block-types.ts` - Ajout du type
- `/lib/new-editor/block-registry.ts` - Enregistrement du bloc
- `/components/new-editor/BlockInspector.tsx` - Routing de l'inspecteur
- `/lib/render-page-blocks.tsx` + `/components/new-editor/BlockRenderer.tsx` - Rendu

---

## Principes clés

- **Champs répéteurs** : Stockent les données en JSON string `"[{...},{...}]"`
- **Mapper** : Transforme les données plates du formulaire en props structurées
- **Inspector** : Utilise `RepeaterInspector` pour les champs de type `repeater`
- **Deux renderers** : Un pour l'éditeur (`BlockRenderer.tsx`), un pour les pages publiques (`render-page-blocks.tsx`)
- **Type safety** : Définir des interfaces TypeScript pour `FormData` et `MappedData`

Le système est conçu pour que chaque partie soit **indépendante** : source unique de vérité (champs), mappers découplés, composants réutilisables.
