"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import { BlockPickerPopover } from "./BlockPickerPopover"
import { usePreview } from "./PreviewContext"
import { Blob } from "@/components/blob/blob"
import { BlobIterator } from "@/components/blob/blob-iterator"
import { Eyebrow } from "@/components/blob/eyebrow"
import { Title } from "@/components/blob/title"
import { Subtitle } from "@/components/blob/subtitle"
import { Marker } from "@/components/blob/marker"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Copy, Clipboard, Code } from "lucide-react"
import { mapFormDataToBlob } from "@/lib/blob-form-mapper"
import { mapIteratorFormData } from "@/lib/blob-iterator-mapper"
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"
import { BlockParagraph } from "@/components/blocks/BlockParagraph"
import { BlockDivider } from "@/components/blocks/BlockDivider"
import { BlockList } from "@/components/blocks/BlockList"
import { BlockHoverControls } from "./BlockHoverControls"
import { renderIconObject } from "@/lib/render-icon"
import { resolveAppearance } from "@/config/blob-appearances"
import type { BlobIteratorProps } from "@/components/blob/blob-iterator"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface BlockRendererProps {
  block: BlockNode
  isSelected: boolean
  selectedBlockId?: string | null
  onSelect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddBelow: (blockType: BlockType) => void
  onDuplicate: () => void
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  onRefresh?: (mode: import("@/lib/new-editor/refresh-helpers").RefreshMode) => void
  onInsertBelow?: () => void
  onInsertBelowChild?: (parentId: string, position: number) => void
  hasClipboard: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  // Pour le rendu récursif des innerBlocks
  onSelectChild?: (childId: string) => void
  onMoveChild?: (childId: string, direction: "up" | "down") => void
  onAddBelowChild?: (parentId: string, position: number, blockType: BlockType) => void
  onDuplicateChild?: (childId: string) => void
  onDeleteChild?: (childId: string) => void
  onCopyChild?: (childId: string) => void
  onPasteChild?: (childId: string) => void
  onRefreshChild?: (childId: string, mode: import("@/lib/new-editor/refresh-helpers").RefreshMode) => void
}

export function BlockRenderer({
  block,
  isSelected,
  selectedBlockId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  onDuplicate,
  onDelete,
  onCopy,
  onPaste,
  onRefresh,
  onInsertBelow,
  onInsertBelowChild,
  hasClipboard,
  canMoveUp,
  canMoveDown,
  onSelectChild,
  onMoveChild,
  onAddBelowChild,
  onDuplicateChild,
  onDeleteChild,
  onCopyChild,
  onPasteChild,
  onRefreshChild,
}: BlockRendererProps) {
  const { isPreviewMode } = usePreview()

  // Rendu du bloc selon son type
  const renderBlockContent = () => {
    if (block.blockType === "blob") {
      const formData = {
        ...block.data,
        buttons: (() => {
          try {
            const parsed = JSON.parse((block.data.buttons as string) || "[]")
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })(),
      }
      const { blobProps, appearance, header, marker, figure, actions, content } =
        mapFormDataToBlob(formData)

      const appearanceConfig = resolveAppearance(appearance)

      // Rendu récursif des innerBlocks si présents
      const innerBlocks = block.innerBlocks?.map((childBlock, index) => (
        <BlockRenderer
          key={childBlock.id}
          block={childBlock}
          isSelected={selectedBlockId === childBlock.id}
          selectedBlockId={selectedBlockId}
          onSelect={() => onSelectChild?.(childBlock.id)}
          onMoveUp={() => onMoveChild?.(childBlock.id, "up")}
          onMoveDown={() => onMoveChild?.(childBlock.id, "down")}
          onAddBelow={(blockType) => onAddBelowChild?.(block.id, index + 1, blockType)}
          onDuplicate={() => onDuplicateChild?.(childBlock.id)}
          onDelete={() => onDeleteChild?.(childBlock.id)}
          onCopy={() => onCopyChild?.(childBlock.id)}
          onPaste={() => onPasteChild?.(childBlock.id)}
          onRefresh={(mode) => onRefreshChild?.(childBlock.id, mode)}
          onInsertBelow={() => onInsertBelowChild?.(block.id, index + 1)}
          onInsertBelowChild={onInsertBelowChild}
          hasClipboard={hasClipboard}
          canMoveUp={index > 0}
          canMoveDown={index < (block.innerBlocks?.length || 0) - 1}
          onSelectChild={onSelectChild}
          onMoveChild={onMoveChild}
          onAddBelowChild={onAddBelowChild}
          onDuplicateChild={onDuplicateChild}
          onDeleteChild={onDeleteChild}
          onCopyChild={onCopyChild}
          onPasteChild={onPasteChild}
          onRefreshChild={onRefreshChild}
        />
      ))

      return (
        <Blob {...blobProps} useContainerQueries={isPreviewMode} className={cn(appearanceConfig.blobClassName, blobProps.className)}>
          {header && (header.eyebrow || header.title || header.subtitle) && (
            <Blob.Header className={cn(appearanceConfig.headerClassName)}>
              {header.eyebrow && (
                <Eyebrow as={header.eyebrow.as} className={header.eyebrow.className}>
                  {header.eyebrow.text}
                </Eyebrow>
              )}
              {header.title && (
                <Title as={header.title.as} emphasisText={header.title.emphasisText}>
                  {header.title.text}
                </Title>
              )}
              {header.subtitle && <Subtitle>{header.subtitle.text}</Subtitle>}
            </Blob.Header>
          )}
          {marker && (marker.content || marker.icon) && (
            <Marker
              variant={marker.style}
              rounded={marker.rounded}
              className={cn(marker.className, appearanceConfig.markerClassName)}
            >
              {marker.type === "text" && marker.content && <span>{marker.content}</span>}
              {marker.type === "icon" && marker.icon && renderIconObject(marker.icon.iconObject)}
            </Marker>
          )}
          {figure && figure.src && (
            <Blob.Figure className={cn(appearanceConfig.figureClassName)}>
              {figure.type === "image" && (
                <Image
                  src={figure.src}
                  alt={figure.alt}
                  width={figure.width}
                  height={figure.height}
                  className="w-full h-full object-cover"
                />
              )}
              {figure.type === "video" && (
                <video src={figure.src} className="w-full h-full" controls />
              )}
            </Blob.Figure>
          )}
          {content?.enabled && content.text && (
            <Blob.Content className={cn(appearanceConfig.contentClassName)}>
              <p>{content.text}</p>
            </Blob.Content>
          )}
          {actions && actions.length > 0 && (
            <Blob.Actions className={cn(appearanceConfig.actionsClassName)}>
              {actions.map((btn, i) => (
                <Button key={i} asChild variant={btn.variant} data-theme={btn.theme}>
                  <Link {...btn.linkProps}>{btn.label}</Link>
                </Button>
              ))}
            </Blob.Actions>
          )}
          {/* Rendu des innerBlocks */}
          {(block.data.showContent === true || block.data.showContent === "true") &&
            block.data.contentType === "innerBlocks" && (
              <Blob.Content className={cn(appearanceConfig.contentClassName)}>
                {innerBlocks && innerBlocks.length > 0 ? (
                  <div className="space-y-4">{innerBlocks}</div>
                ) : (
                  <BlockPickerPopover
                    onSelect={(blockType) => onAddBelowChild?.(block.id, 0, blockType)}
                    onPaste={hasClipboard && onInsertBelowChild ? () => onInsertBelowChild(block.id, 0) : undefined}
                    hasClipboard={hasClipboard}
                    side="bottom"
                    align="center"
                  >
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-full border-2 border-dashed border-muted-foreground/30 rounded-md py-4 text-sm text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors"
                    >
                      + Ajouter un bloc imbriqué
                    </button>
                  </BlockPickerPopover>
                )}
              </Blob.Content>
            )}
        </Blob>
      )
    }

    if (block.blockType === "blobIterator") {
      const {
        iteratorLayout,
        iteratorGapX,
        iteratorGapY,
        swiperOptions,
        sharedBlobProps,
        sharedAppearance,
        items
      } = mapIteratorFormData(block.data)

      const sharedAppearanceConfig = resolveAppearance(sharedAppearance)

      return (
        <BlobIterator
          containerLayout={iteratorLayout as BlobIteratorProps["containerLayout"]}
          gapX={iteratorGapX as BlobIteratorProps["gapX"]}
          gapY={iteratorGapY as BlobIteratorProps["gapY"]}
          swiperOptions={swiperOptions}
        >
          {items.map((itemData, index) => {
            const { blobProps, appearance, header, marker, figure, actions, content, innerBlocks: itemInnerBlocks, itemId } = itemData

            // Fusionner les props partagées avec les props de l'item
            const mergedBlobProps = {
              ...sharedBlobProps,
              ...blobProps,
            }

            const itemAppearanceConfig = resolveAppearance(appearance, sharedAppearanceConfig)

            // Rendu récursif des innerBlocks de l'item si présents
            // IMPORTANT: utiliser itemId (ID de l'item) comme parentId, pas block.id (ID de l'iterator)
            const innerBlocksRendered = itemInnerBlocks?.map((childBlock, childIndex) => (
              <BlockRenderer
                key={childBlock.id}
                block={childBlock}
                isSelected={selectedBlockId === childBlock.id}
                selectedBlockId={selectedBlockId}
                onSelect={() => onSelectChild?.(childBlock.id)}
                onMoveUp={() => onMoveChild?.(childBlock.id, "up")}
                onMoveDown={() => onMoveChild?.(childBlock.id, "down")}
                onAddBelow={(blockType) => onAddBelowChild?.(itemId, childIndex + 1, blockType)}
                onDuplicate={() => onDuplicateChild?.(childBlock.id)}
                onDelete={() => onDeleteChild?.(childBlock.id)}
                onCopy={() => onCopyChild?.(childBlock.id)}
                onPaste={() => onPasteChild?.(childBlock.id)}
                onRefresh={(mode) => onRefreshChild?.(childBlock.id, mode)}
                onInsertBelow={() => onInsertBelowChild?.(itemId, childIndex + 1)}
                onInsertBelowChild={onInsertBelowChild}
                hasClipboard={hasClipboard}
                canMoveUp={childIndex > 0}
                canMoveDown={childIndex < (itemInnerBlocks?.length || 0) - 1}
                onSelectChild={onSelectChild}
                onMoveChild={onMoveChild}
                onAddBelowChild={onAddBelowChild}
                onDuplicateChild={onDuplicateChild}
                onDeleteChild={onDeleteChild}
                onCopyChild={onCopyChild}
                onPasteChild={onPasteChild}
                onRefreshChild={onRefreshChild}
              />
            ))

            return (
              <Blob
                key={index}
                {...mergedBlobProps}
                useContainerQueries={isPreviewMode}
                className={cn(itemAppearanceConfig.blobClassName, mergedBlobProps.className)}
              >
                {header && (header.eyebrow || header.title || header.subtitle) && (
                  <Blob.Header className={cn(itemAppearanceConfig.headerClassName)}>
                    {header.eyebrow && (
                      <Eyebrow
                        as={header.eyebrow.as}
                        className={header.eyebrow.className}
                      >
                        {header.eyebrow.text}
                      </Eyebrow>
                    )}
                    {header.title && (
                      <Title as={header.title.as} emphasisText={header.title.emphasisText}>
                        {header.title.text}
                      </Title>
                    )}
                    {header.subtitle && <Subtitle>{header.subtitle.text}</Subtitle>}
                  </Blob.Header>
                )}
                {marker && (marker.content || marker.icon) && (
                  <Marker
                    variant={marker.style}
                    rounded={marker.rounded}
                    className={cn(marker.className, itemAppearanceConfig.markerClassName)}
                  >
                    {marker.type === "text" && marker.content && <span>{marker.content}</span>}
                    {marker.type === "icon" && marker.icon && renderIconObject(marker.icon.iconObject)}
                  </Marker>
                )}
                {figure && figure.src && (
                  <Blob.Figure className={cn(itemAppearanceConfig.figureClassName)}>
                    {figure.type === "image" && (
                      <Image
                        src={figure.src}
                        alt={figure.alt}
                        width={figure.width}
                        height={figure.height}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {figure.type === "video" && (
                      <video src={figure.src} className="w-full h-full" controls />
                    )}
                  </Blob.Figure>
                )}
                {content?.enabled && content.text && (
                  <Blob.Content className={cn(itemAppearanceConfig.contentClassName)}>
                    <p>{content.text}</p>
                  </Blob.Content>
                )}
                {/* Rendu des innerBlocks de l'item */}
                {content?.showContent && content?.contentType === "innerBlocks" && (
                  <Blob.Content className={cn(itemAppearanceConfig.contentClassName)}>
                    {innerBlocksRendered && innerBlocksRendered.length > 0 ? (
                      <div className="space-y-4">{innerBlocksRendered}</div>
                    ) : (
                      <BlockPickerPopover
                        onSelect={(blockType) => onAddBelowChild?.(itemId, 0, blockType)}
                        onPaste={hasClipboard && onInsertBelowChild ? () => onInsertBelowChild(itemId, 0) : undefined}
                        hasClipboard={hasClipboard}
                        side="bottom"
                        align="center"
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border-2 border-dashed border-muted-foreground/30 rounded-md py-4 text-sm text-muted-foreground hover:border-muted-foreground/60 hover:text-muted-foreground/80 transition-colors"
                        >
                          + Ajouter un bloc imbriqué à l&apos;item
                        </button>
                      </BlockPickerPopover>
                    )}
                  </Blob.Content>
                )}
                {actions && actions.length > 0 && (
                  <Blob.Actions className={cn(itemAppearanceConfig.actionsClassName)}>
                    {actions.map((btn, i) => (
                      <Button key={i} asChild variant={btn.variant} data-theme={btn.theme}>
                        <Link {...btn.linkProps}>{btn.label}</Link>
                      </Button>
                    ))}
                  </Blob.Actions>
                )}
              </Blob>
            )
          })}
        </BlobIterator>
      )
    }

    if (block.blockType === "buttonTooltip") {
      const mappedData = mapButtonTooltipFormData(block.data)
      return <BlockButtonTooltip data={mappedData} />
    }

    if (block.blockType === "paragraph") {
      return (
        <BlockParagraph
          text={(block.data.text as string) || ""}
          appearance={(block.data.appearance as string) || undefined}
        />
      )
    }

    if (block.blockType === "divider") {
      return (
        <BlockDivider
          orientation={(block.data.orientation as "horizontal" | "vertical") || "horizontal"}
          label={(block.data.label as string) || undefined}
          spacingBefore={(block.data.spacingBefore as string) || undefined}
          spacingAfter={(block.data.spacingAfter as string) || undefined}
        />
      )
    }

    if (block.blockType === "list") {
      const items = Array.isArray(block.data.items)
        ? (block.data.items as Array<{title: string; subtitle?: string}>)
        : (() => { try { return JSON.parse((block.data.items as string) || "[]") } catch { return [] } })()
      return <BlockList items={items} icon={(block.data.icon as string) || "arrowRight"} />
    }

    return <div className="p-4 bg-muted text-sm">Type de bloc inconnu: {block.blockType}</div>
  }

  const [isHovered, setIsHovered] = useState(false)
  const [waveKey, setWaveKey] = useState(0)
  const [waveRect, setWaveRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevSelected = useRef(false)

  useEffect(() => {
    if (isSelected && !prevSelected.current && wrapperRef.current) {
      setWaveRect(wrapperRef.current.getBoundingClientRect())
      setWaveKey((k) => k + 1)
    }
    prevSelected.current = isSelected
  }, [isSelected])

  // Fonction pour copier le JSON du bloc
  const handleCopyJSON = async () => {
    try {
      const jsonString = JSON.stringify(block, null, 2)
      await navigator.clipboard.writeText(jsonString)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={wrapperRef}
          className={cn("relative")}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          {waveKey > 0 && waveRect && createPortal(
            <div
              key={waveKey}
              className="block-select-wave pointer-events-none rounded-sm"
              style={{
                position: "fixed",
                top: waveRect.top,
                left: waveRect.left,
                width: waveRect.width,
                height: waveRect.height,
                zIndex: 9999,
              }}
            />,
            document.body
          )}
          <BlockHoverControls
            block={block}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onAddBelow={onAddBelow}
            onInsertBelow={onInsertBelow}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onRefresh={onRefresh}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            isVisible={isHovered}
            hasClipboard={hasClipboard}
          />
          {renderBlockContent()}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copier
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyJSON}>
          <Code className="h-4 w-4 mr-2" />
          Copier JSON
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste} disabled={!hasClipboard}>
          <Clipboard className="h-4 w-4 mr-2" />
          Coller
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
