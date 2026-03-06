"use client"

/**
 * BLOCK TREE ITEM
 *
 * Représente un item dans l'arborescence des blocs.
 * Affiche le bloc avec ses contrôles (déplacer, supprimer, ajouter).
 */

import React, { useState } from "react"
import type { BlockNode } from "@/types/editor"
import { BLOCK_REGISTRY, getAllowedInnerBlocks } from "@/lib/block-registry"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface BlockTreeItemProps {
  block: BlockNode
  level: number
  isSelected: boolean
  onSelect: (blockId: string) => void
  onAdd: (parentId: string | null, blockType: string) => void
  onDelete: (blockId: string) => void
  onMove: (blockId: string, direction: "up" | "down") => void
  onSaveAsPreset?: (blockId: string) => void
}

export function BlockTreeItem({
  block,
  level,
  isSelected,
  onSelect,
  onAdd,
  onDelete,
  onMove,
  onSaveAsPreset,
}: BlockTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const blockDef = BLOCK_REGISTRY[block.blockType]
  const hasInnerBlocks = block.innerBlocks && block.innerBlocks.length > 0
  const canHaveChildren = getAllowedInnerBlocks(block.blockType).length > 0

  // Récupérer le label du bloc (titre si disponible, sinon nom du type)
  const getBlockLabel = () => {
    if (block.data.title && typeof block.data.title === "string") {
      return block.data.title
    }
    return blockDef?.label || block.blockType
  }

  const allowedBlocks = getAllowedInnerBlocks(block.blockType)

  return (
    <div className="select-none">
      {/* Item principal */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors",
              isSelected && "bg-blue-100 hover:bg-blue-100"
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => onSelect(block.id)}
          >
        {/* Chevron pour expand/collapse */}
        {canHaveChildren && (
          <button
            className="p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-500" />
            )}
          </button>
        )}

        {/* Icône du type de bloc */}
        <span className="text-xs">{blockDef?.icon || "📦"}</span>

        {/* Label du bloc */}
        <span className="flex-1 text-xs font-medium text-gray-700 truncate">
          {getBlockLabel()}
        </span>

        {/* Contrôles (visibles au hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Bouton Ajouter */}
          {allowedBlocks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {allowedBlocks.map((blockType) => {
                  const def = BLOCK_REGISTRY[blockType]
                  return (
                    <DropdownMenuItem
                      key={blockType}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAdd(block.id, blockType)
                      }}
                    >
                      <span className="mr-2">{def?.icon}</span>
                      {def?.label || blockType}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Bouton Déplacer vers le haut */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation()
              onMove(block.id, "up")
            }}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>

          {/* Bouton Déplacer vers le bas */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation()
              onMove(block.id, "down")
            }}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>

          {/* Bouton Supprimer */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm("Êtes-vous sûr de vouloir supprimer ce bloc ?")) {
                onDelete(block.id)
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => onSaveAsPreset?.(block.id)}
          >
            <Save className="h-3 w-3 mr-2" />
            Enregistrer comme preset
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* InnerBlocks (récursif) */}
      {hasInnerBlocks && isExpanded && (
        <div>
          {block.innerBlocks!.map((innerBlock) => (
            <BlockTreeItem
              key={innerBlock.id}
              block={innerBlock}
              level={level + 1}
              isSelected={isSelected}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              onMove={onMove}
              onSaveAsPreset={onSaveAsPreset}
            />
          ))}
        </div>
      )}
    </div>
  )
}
