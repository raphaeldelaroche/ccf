import React from 'react';
import type { BlockNode } from '@/lib/new-editor/block-types';
import type { MappedBlobData, IconData } from '@/lib/blob-form-mapper';
import { Blob } from '@/components/blob/blob';
import { Eyebrow } from '@/components/blob/eyebrow';
import { Title } from '@/components/blob/title';
import { Subtitle } from '@/components/blob/subtitle';
import { Marker } from '@/components/blob/marker';
import { resolveAppearances } from '@/config/blob-appearances';
import { resolveBackgrounds, resolveBackgroundClasses } from '@/config/blob-backgrounds';
import { BlobBackground } from '@/components/blob/blob-background';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { renderIconObject } from '@/lib/render-icon';
import Link from 'next/link';
import Image from 'next/image';


// ─── Fonctions utilitaires ──────────────────────────────────────────────────

function resolveMarkerContent(
  markerType: "text" | "icon" | "image" | undefined,
  markerIcon: IconData | undefined,
  markerContent: string | undefined,
  markerImage: string | undefined
): React.ReactNode {
  if (!markerType) return null;
  if (markerType === 'icon' && markerIcon) return renderIconObject(markerIcon.iconObject);
  if (markerType === 'text' && markerContent) return markerContent;
  if (markerType === 'image' && markerImage) return (
    <Image src={markerImage} alt="" fill className="object-cover" />
  );
  return null;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function BlobBlock({ data, renderInnerBlock, innerBlocks }: {
  data: MappedBlobData;
  renderInnerBlock?: (block: BlockNode) => React.ReactNode;
  innerBlocks?: BlockNode[];
}) {
  const { blobProps, appearance, background, header, marker, figure, actions, content } = data;

  // Récupérer la configuration d'apparence
  const appearanceConfig = resolveAppearances(appearance);
  const backgrounds = resolveBackgrounds(background);
  const backgroundClasses = resolveBackgroundClasses(background);

  const markerChildren = resolveMarkerContent(marker?.type, marker?.icon, marker?.content, marker?.image);

  return (
    <Blob {...blobProps} className={cn(appearanceConfig.blobClassName, backgroundClasses, backgrounds.length > 0 && "relative", blobProps.className)}>
      <BlobBackground backgrounds={backgrounds} />
      {markerChildren && (
        <Marker
          rounded={marker?.rounded}
          variant={marker?.style ?? 'default'}
          className={cn(marker?.className, appearanceConfig.markerClassName)}
        >
          {markerChildren}
        </Marker>
      )}

      {figure?.type === 'image' && figure.src && (
        <Blob.Figure className={cn(appearanceConfig.figureClassName)}>
          <Image
            src={figure.src}
            alt={figure.alt}
            width={figure.width}
            height={figure.height}
            className="w-full"
          />
        </Blob.Figure>
      )}

      {figure?.type === 'innerBlocks' && innerBlocks && innerBlocks.length > 0 && renderInnerBlock && (
        <Blob.Figure className={cn(appearanceConfig.figureClassName)}>
          {innerBlocks.map((innerBlock, index) => (
            <React.Fragment key={index}>
              {renderInnerBlock(innerBlock)}
            </React.Fragment>
          ))}
        </Blob.Figure>
      )}

      {header && (
        <Blob.Header className={cn(appearanceConfig.headerClassName)}>
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
          {header.subtitle && (
            <Subtitle>{header.subtitle.text}</Subtitle>
          )}
        </Blob.Header>
      )}

      {content?.enabled && content.contentType !== "innerBlocks" && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          <p>{content.text}</p>
        </Blob.Content>
      )}

      {content?.contentType === "innerBlocks" && innerBlocks && innerBlocks.length > 0 && renderInnerBlock && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          {innerBlocks.map((innerBlock, index) => (
            <React.Fragment key={index}>
              {renderInnerBlock(innerBlock)}
            </React.Fragment>
          ))}
        </Blob.Content>
      )}

      {actions && actions.length > 0 && (
        <Blob.Actions className={cn(appearanceConfig.actionsClassName)}>
          {actions.map((btn, i) => {
            const iconElement = btn.icon ? renderIconObject(btn.icon.iconObject) : null
            const isIconOnly = (!btn.label?.trim()) && btn.icon && btn.iconType !== "none"
            const iconLeft = !isIconOnly && btn.iconType === "left" && iconElement
            const iconRight = !isIconOnly && btn.iconType === "right" && iconElement

            return (
              <Button
                key={i}
                asChild
                variant={btn.variant}
                size={isIconOnly ? "icon-only" : undefined}
                data-theme={btn.theme}
                className={btn.theme ? `theme-${btn.theme}` : undefined}
                aria-label={isIconOnly ? btn.label || "Button" : undefined}
              >
                <Link {...btn.linkProps}>
                  {isIconOnly ? (
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center">{iconElement}</span>
                  ) : (
                    <>
                      {iconLeft && <span className="w-4 h-4 shrink-0">{iconElement}</span>}
                      {btn.label}
                      {iconRight && <span className="w-4 h-4 shrink-0">{iconElement}</span>}
                    </>
                  )}
                </Link>
              </Button>
            )
          })}
        </Blob.Actions>
      )}
    </Blob>
  );
}
