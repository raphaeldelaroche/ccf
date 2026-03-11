import React from 'react';
import type { BlockNode } from '@/lib/new-editor/block-types';
import type { MappedBlobData, IconData } from '@/lib/blob-form-mapper';
import { Blob } from '@/components/blob/blob';
import { Eyebrow } from '@/components/blob/eyebrow';
import { Title } from '@/components/blob/title';
import { Subtitle } from '@/components/blob/subtitle';
import { Marker } from '@/components/blob/marker';
import { resolveAppearance } from '@/config/blob-appearances';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { renderIconObject } from '@/lib/render-icon';
import Link from 'next/link';
import Image from 'next/image';


// ─── Fonctions utilitaires ──────────────────────────────────────────────────

function resolveMarkerContent(
  markerType: "text" | "icon" | undefined,
  markerIcon: IconData | undefined,
  markerContent: string | undefined
): React.ReactNode {
  if (!markerType) return null;
  if (markerType === 'icon' && markerIcon) return renderIconObject(markerIcon.iconObject);
  if (markerType === 'text' && markerContent) return markerContent;
  return null;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function BlobBlock({ data, renderInnerBlock, innerBlocks }: {
  data: MappedBlobData;
  renderInnerBlock?: (block: BlockNode) => React.ReactNode;
  innerBlocks?: BlockNode[];
}) {
  const { blobProps, appearance, header, marker, figure, actions, content } = data;

  // Récupérer la configuration d'apparence
  const appearanceConfig = resolveAppearance(appearance);

  const markerChildren = resolveMarkerContent(marker?.type, marker?.icon, marker?.content);

  return (
    <Blob {...blobProps} className={cn(appearanceConfig.blobClassName, blobProps.className)}>
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

      {content?.enabled && !innerBlocks && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          <p>{content.text}</p>
        </Blob.Content>
      )}

      {innerBlocks && innerBlocks.length > 0 && renderInnerBlock && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          <div className="space-y-4">
            {innerBlocks.map((innerBlock, index) => (
              <React.Fragment key={index}>
                {renderInnerBlock(innerBlock)}
              </React.Fragment>
            ))}
          </div>
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
    </Blob>
  );
}
