"use client"

/**
 * BLOCK RENDERER
 *
 * Composant récursif qui rend un bloc avec ses innerBlocks.
 * Utilise le BLOCK_REGISTRY pour déterminer comment rendre chaque type de bloc.
 */

import React from "react"
import type { BlockNode } from "@/types/editor"
import { BLOCK_REGISTRY } from "@/lib/block-registry"
import { mapBlockWithInnerBlocks } from "@/lib/block-mapper-recursive"
import { cn } from "@/lib/utils"

interface BlockRendererProps {
  block: BlockNode
  isSelected?: boolean
  onClick?: (blockId: string) => void
  className?: string
}

export function BlockRenderer({
  block,
  isSelected = false,
  onClick,
  className,
}: BlockRendererProps) {
  const blockDef = BLOCK_REGISTRY[block.blockType]

  if (!blockDef) {
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded">
        Type de bloc inconnu : {block.blockType}
      </div>
    )
  }

  // Définir renderInnerBlock en dehors du try/catch (JSX interdit dans try/catch)
  const renderInnerBlock = (innerBlock: BlockNode) => (
    <BlockRenderer block={innerBlock} onClick={onClick} />
  )

  // Calcul pur — pas de JSX ici
  let blockElement: React.ReactElement | null = null
  let renderError: Error | null = null

  try {
    const mappedData = mapBlockWithInnerBlocks(block)
    blockElement = React.cloneElement(
      blockDef.render(block.data, mappedData) as React.ReactElement,
      { renderInnerBlock, innerBlocks: block.innerBlocks } as Record<string, unknown>
    )
  } catch (error) {
    console.error(`Erreur lors du rendu du bloc ${block.id}:`, error)
    renderError = error as Error
  }

  if (renderError) {
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded">
        Erreur lors du rendu du bloc : {renderError.message}
      </div>
    )
  }

  return (
    <div
      data-block-id={block.id}
      data-block-type={block.blockType}
      className={cn(
        "relative block-wrapper",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(block.id)
      }}
    >
      {blockElement}
    </div>
  )
}

/**
 * Rend une liste de blocs
 */
export function BlockListRenderer({
  blocks,
  selectedBlockId,
  onBlockClick,
  className,
}: {
  blocks: BlockNode[]
  selectedBlockId?: string | null
  onBlockClick?: (blockId: string) => void
  className?: string
}) {
  if (blocks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-sm">Aucun bloc. Ajoutez-en un pour commencer.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onClick={onBlockClick}
        />
      ))}
    </div>
  )
}
