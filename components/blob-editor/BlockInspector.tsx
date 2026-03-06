"use client"

/**
 * BLOCK INSPECTOR
 *
 * Sidebar droite affichant les options du bloc sélectionné.
 * Réutilise ControlsSidebar pour afficher les champs du bloc.
 */

import React, { useEffect, useState } from "react"
import type { BlockNode } from "@/types/editor"
import type { FormDataValue } from "@/types/editor"
import type { BlockPresetListItem, BlockPreset } from "@/types/block-preset"
import { BLOCK_REGISTRY } from "@/lib/block-registry"
import { ControlsSidebar } from "@/components/blob-editor/ControlsSidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockInspectorProps {
  block: BlockNode | null
  onUpdateBlock: (blockId: string, data: Partial<Record<string, FormDataValue>>) => void
}

export function BlockInspector({ block, onUpdateBlock }: BlockInspectorProps) {
  const [presets, setPresets] = useState<BlockPresetListItem[]>([])

  const blockType = block?.blockType

  // Charger les presets filtrés par type de bloc courant
  useEffect(() => {
    if (!blockType) return
    fetch("/api/block-presets")
      .then((r) => r.json())
      .then((data: { presets: BlockPresetListItem[] }) => {
        setPresets(
          (data.presets ?? []).filter((p) => p.blockType === blockType)
        )
      })
      .catch(() => setPresets([]))
  }, [blockType])

  // Appliquer un preset sur le bloc courant
  const handleQuickFill = async (slug: string) => {
    if (!block) return
    try {
      const res = await fetch(`/api/block-presets/${slug}`)
      if (!res.ok) return
      const preset: BlockPreset = await res.json()
      onUpdateBlock(block.id, preset.template.data as Record<string, FormDataValue>)
    } catch {
      // silently ignore
    }
  }

  // Effacer les données du bloc
  const handleClear = () => {
    if (!block) return
    const empty = Object.fromEntries(Object.keys(block.data).map((k) => [k, ""])) as Record<string, FormDataValue>
    onUpdateBlock(block.id, empty)
  }

  if (!block) {
    return (
      <div className="flex flex-col h-full border-l border-gray-200 bg-white">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Inspecteur</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-400 text-center">
            Sélectionnez un bloc pour <br />
            afficher ses options
          </p>
        </div>
      </div>
    )
  }

  const blockDef = BLOCK_REGISTRY[block.blockType]

  if (!blockDef) {
    return (
      <div className="flex flex-col h-full border-l border-gray-200 bg-white">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Inspecteur</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-red-500 text-center">
            Type de bloc inconnu : {block.blockType}
          </p>
        </div>
      </div>
    )
  }

  const handleUpdateField = (fieldId: string, value: FormDataValue) => {
    onUpdateBlock(block.id, { [fieldId]: value })
  }

  return (
    <div className="flex flex-col border-l h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{blockDef.icon}</span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700">{blockDef.label}</h3>
            {blockDef.description && (
              <p className="text-[10px] text-gray-500">{blockDef.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <ScrollArea className="h-72 flex-1">
        <ControlsSidebar
          sections={blockDef.sections}
          formData={block.data}
          onUpdateField={handleUpdateField}
          onQuickFill={handleQuickFill}
          onClear={handleClear}
          presets={presets.map((p) => ({ id: p.slug, label: p.name }))}
          compatibility={undefined}
        />
      </ScrollArea>
    </div>
  )
}
