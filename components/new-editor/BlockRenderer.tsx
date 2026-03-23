"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { BlockNode, BlockType } from "@/lib/new-editor/block-types"
import { BlockPickerPopover } from "./BlockPickerPopover"
import { Blob } from "@/components/blob/blob"
import { ClientBlob } from "./ClientBlob"
import { ClientBlobIterator } from "./ClientBlobIterator"
import { Eyebrow } from "@/components/blob/eyebrow"
import { Title } from "@/components/blob/title"
import { Subtitle } from "@/components/blob/subtitle"
import { Marker } from "@/components/blob/marker"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Copy, Clipboard, Code, Paintbrush, Type } from "lucide-react"
import type { CopyMode } from "@/lib/copy-paste-utils"
import type { BlockType as CopyBlockType } from "@/lib/new-editor/block-types"
import { mapFormDataToBlob } from "@/lib/blob-form-mapper"
import { mapIteratorFormData } from "@/lib/blob-iterator-mapper"
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"
import { BlockParagraph } from "@/components/blocks/BlockParagraph"
import { BlockDivider } from "@/components/blocks/BlockDivider"
import { BlockList } from "@/components/blocks/BlockList"
import { BlockHoverControls } from "./BlockHoverControls"
import { renderIconObject } from "@/lib/render-icon"
import { resolveAppearances } from "@/config/blob-appearances"
import { resolveBackgrounds } from "@/config/blob-backgrounds"
import { BlobBackground } from "@/components/blob/blob-background"
import type { BlobIteratorProps } from "@/components/blob/blob-iterator"
import { cn } from "@/lib/utils"
import { useHoveredBlock } from "./HoveredBlockContext"
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
  onCopyStyle: () => void
  onCopyContent: () => void
  onPaste: () => void
  onRefresh?: (mode: import("@/lib/new-editor/refresh-helpers").RefreshMode) => void
  onInsertBelow?: () => void
  onInsertBelowChild?: (parentId: string, position: number) => void
  hasClipboard: boolean
  clipboardMode: CopyMode | null
  clipboardBlockType: CopyBlockType | null
  canMoveUp: boolean
  canMoveDown: boolean
  // Pour le rendu récursif des innerBlocks
  onSelectChild?: (childId: string) => void
  onMoveChild?: (childId: string, direction: "up" | "down") => void
  onAddBelowChild?: (parentId: string, position: number, blockType: BlockType) => void
  onDuplicateChild?: (childId: string) => void
  onDeleteChild?: (childId: string) => void
  onCopyChild?: (childId: string) => void
  onCopyStyleChild?: (childId: string) => void
  onCopyContentChild?: (childId: string) => void
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
  onCopyStyle,
  onCopyContent,
  onPaste,
  onRefresh,
  onInsertBelow,
  onInsertBelowChild,
  hasClipboard,
  clipboardMode,
  clipboardBlockType,
  canMoveUp,
  canMoveDown,
  onSelectChild,
  onMoveChild,
  onAddBelowChild,
  onDuplicateChild,
  onDeleteChild,
  onCopyChild,
  onCopyStyleChild,
  onCopyContentChild,
  onPasteChild,
  onRefreshChild,
}: BlockRendererProps) {
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
      const { blobProps, appearance, background, header, marker, figure, actions, content } =
        mapFormDataToBlob(formData)

      const appearanceConfig = resolveAppearances(appearance)
      const backgrounds = resolveBackgrounds(background)

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
          onCopyStyle={() => onCopyStyleChild?.(childBlock.id)}
          onCopyContent={() => onCopyContentChild?.(childBlock.id)}
          onPaste={() => onPasteChild?.(childBlock.id)}
          onRefresh={(mode) => onRefreshChild?.(childBlock.id, mode)}
          onInsertBelow={() => onInsertBelowChild?.(block.id, index + 1)}
          onInsertBelowChild={onInsertBelowChild}
          hasClipboard={hasClipboard}
          clipboardMode={clipboardMode}
          clipboardBlockType={clipboardBlockType}
          canMoveUp={index > 0}
          canMoveDown={index < (block.innerBlocks?.length || 0) - 1}
          onSelectChild={onSelectChild}
          onMoveChild={onMoveChild}
          onAddBelowChild={onAddBelowChild}
          onDuplicateChild={onDuplicateChild}
          onDeleteChild={onDeleteChild}
          onCopyChild={onCopyChild}
          onCopyStyleChild={onCopyStyleChild}
          onCopyContentChild={onCopyContentChild}
          onPasteChild={onPasteChild}
          onRefreshChild={onRefreshChild}
        />
      ))

      return (
        <ClientBlob {...blobProps} className={cn(appearanceConfig.blobClassName, blobProps.className)}>
          <BlobBackground backgrounds={backgrounds} />
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
          {marker && (marker.content || marker.icon || marker.image) && (
            <Marker
              variant={marker.style}
              rounded={marker.rounded}
              className={cn(marker.className, appearanceConfig.markerClassName)}
            >
              {marker.type === "text" && marker.content && <span>{marker.content}</span>}
              {marker.type === "icon" && marker.icon && renderIconObject(marker.icon.iconObject)}
              {marker.type === "image" && marker.image && (
                <Image src={marker.image} alt="" fill className="object-cover" />
              )}
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
                <Button key={i} asChild variant={btn.variant} data-theme={btn.theme} className={btn.theme ? `theme-${btn.theme}` : undefined}>
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
        </ClientBlob>
      )
    }

    if (block.blockType === "blobIterator") {
      const {
        iteratorLayout,
        iteratorGapX,
        iteratorGapY,
        swiperOptions,
        swiperSlideWidth,
        swiperResponsiveConfig,
        iteratorAppearance,
        iteratorBackground,
        sharedBlobProps,
        sharedAppearance,
        sharedBackground,
        items
      } = mapIteratorFormData(block.data)

      const sharedAppearanceConfig = resolveAppearances(sharedAppearance)
      const sharedBackgrounds = resolveBackgrounds(sharedBackground)

      return (
        <ClientBlobIterator
          containerLayout={iteratorLayout as BlobIteratorProps["containerLayout"]}
          gapX={iteratorGapX as BlobIteratorProps["gapX"]}
          gapY={iteratorGapY as BlobIteratorProps["gapY"]}
          swiperOptions={swiperOptions}
          swiperSlideWidth={swiperSlideWidth}
          swiperResponsiveConfig={swiperResponsiveConfig}
          appearance={iteratorAppearance}
          background={iteratorBackground}
        >
          {items.map((itemData, index) => {
            const { blobProps, appearance, background, header, marker, figure, actions, content, innerBlocks: itemInnerBlocks, itemId } = itemData

            // Fusionner les props partagées avec les props de l'item
            const mergedBlobProps = {
              ...sharedBlobProps,
              ...blobProps,
            }

            const itemAppearanceConfig = resolveAppearances(appearance, sharedAppearanceConfig)
            const itemBackgrounds = background && background.length > 0 ? resolveBackgrounds(background) : sharedBackgrounds

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
                onCopyStyle={() => onCopyStyleChild?.(childBlock.id)}
                onCopyContent={() => onCopyContentChild?.(childBlock.id)}
                onPaste={() => onPasteChild?.(childBlock.id)}
                onRefresh={(mode) => onRefreshChild?.(childBlock.id, mode)}
                onInsertBelow={() => onInsertBelowChild?.(itemId, childIndex + 1)}
                onInsertBelowChild={onInsertBelowChild}
                hasClipboard={hasClipboard}
                clipboardMode={clipboardMode}
                clipboardBlockType={clipboardBlockType}
                canMoveUp={childIndex > 0}
                canMoveDown={childIndex < (itemInnerBlocks?.length || 0) - 1}
                onSelectChild={onSelectChild}
                onMoveChild={onMoveChild}
                onAddBelowChild={onAddBelowChild}
                onDuplicateChild={onDuplicateChild}
                onDeleteChild={onDeleteChild}
                onCopyChild={onCopyChild}
                onCopyStyleChild={onCopyStyleChild}
                onCopyContentChild={onCopyContentChild}
                onPasteChild={onPasteChild}
                onRefreshChild={onRefreshChild}
              />
            ))

            return (
              <ClientBlob
                key={index}
                {...mergedBlobProps}
                className={cn(itemAppearanceConfig.blobClassName, mergedBlobProps.className)}
              >
                <BlobBackground backgrounds={itemBackgrounds} />
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
                {marker && (marker.content || marker.icon || marker.image) && (
                  <Marker
                    variant={marker.style}
                    rounded={marker.rounded}
                    className={cn(marker.className, itemAppearanceConfig.markerClassName)}
                  >
                    {marker.type === "text" && marker.content && <span>{marker.content}</span>}
                    {marker.type === "icon" && marker.icon && renderIconObject(marker.icon.iconObject)}
                    {marker.type === "image" && marker.image && (
                      <Image src={marker.image} alt="" fill className="object-cover" />
                    )}
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
                      <Button key={i} asChild variant={btn.variant} data-theme={btn.theme} className={btn.theme ? `theme-${btn.theme}` : undefined}>
                        <Link {...btn.linkProps}>{btn.label}</Link>
                      </Button>
                    ))}
                  </Blob.Actions>
                )}
              </ClientBlob>
            )
          })}
        </ClientBlobIterator>
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
          appearance={(block.data.appearance as string | string[]) || undefined}
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

  const { hoveredBlockId, setHoveredBlockId } = useHoveredBlock()
  const isBlockHovered = hoveredBlockId === block.id

  const [waveKey, setWaveKey] = useState(0)
  const [waveRect, setWaveRect] = useState<DOMRect | null>(null)
  const [controlsRect, setControlsRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevSelected = useRef(false)

  useEffect(() => {
    if (isSelected && !prevSelected.current && wrapperRef.current) {
      setWaveRect(wrapperRef.current.getBoundingClientRect())
      setWaveKey((k) => k + 1)
    }
    prevSelected.current = isSelected
  }, [isSelected])

  // Update controls position when hovered, track scroll/resize
  useEffect(() => {
    if (!isBlockHovered || !wrapperRef.current) {
      return
    }

    const update = () => {
      const rect = wrapperRef.current?.getBoundingClientRect()
      if (rect) setControlsRect(rect)
    }

    update()

    const scrollContainer = wrapperRef.current.closest('[data-editor-scroll]')
    scrollContainer?.addEventListener('scroll', update, { passive: true })
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })

    return () => {
      setControlsRect(null)
      scrollContainer?.removeEventListener('scroll', update)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [isBlockHovered])

  const handleMouseOver = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setHoveredBlockId(block.id)
  }, [block.id, setHoveredBlockId])

  const handleMouseLeave = useCallback(() => {
    if (hoveredBlockId === block.id) {
      setHoveredBlockId(null)
    }
  }, [hoveredBlockId, block.id, setHoveredBlockId])

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
          className={cn(
            "relative rounded-sm transition-shadow duration-150",
            isBlockHovered && "ring-1 ring-blue-300/50"
          )}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
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
          {isBlockHovered && controlsRect && createPortal(
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
              isVisible
              hasClipboard={hasClipboard}
              anchorRect={controlsRect}
            />,
            document.body
          )}
          {renderBlockContent()}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copier
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyStyle}>
          <Paintbrush className="h-4 w-4 mr-2" />
          Copier le style
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyContent}>
          <Type className="h-4 w-4 mr-2" />
          Copier le contenu
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyJSON}>
          <Code className="h-4 w-4 mr-2" />
          Copier JSON
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onPaste}
          disabled={!hasClipboard || (clipboardMode !== "full" && clipboardBlockType !== block.blockType)}
        >
          {clipboardMode === "style" ? (
            <><Paintbrush className="h-4 w-4 mr-2" />Coller le style</>
          ) : clipboardMode === "content" ? (
            <><Type className="h-4 w-4 mr-2" />Coller le contenu</>
          ) : (
            <><Clipboard className="h-4 w-4 mr-2" />Coller</>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
