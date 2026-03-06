import React from 'react';
import type { BlockNode } from '@/types/editor';
import type { MappedBlobData, IconData } from '@/lib/blob-form-mapper';
import type { MappedBlobDataWithInnerBlocks } from '@/lib/block-mapper-recursive';
import { Blob } from '@/components/blob/blob';
import { Eyebrow } from '@/components/blob/eyebrow';
import { Title } from '@/components/blob/title';
import { Subtitle } from '@/components/blob/subtitle';
import { Marker } from '@/components/blob/marker';
import { APPEARANCES } from '@/config/blob-appearances';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types Support ──────────────────────────────────────────────────────────

type TitleAs = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
const VALID_TITLE_AS: TitleAs[] = ["div", "h1", "h2", "h3", "h4", "h5", "h6"];

function isValidTitleAs(val: string | undefined): val is TitleAs {
  return !!val && VALID_TITLE_AS.includes(val as TitleAs);
}

type MarkerVariant = "default" | "secondary" | "ghost";

// ─── Fonctions utilitaires ──────────────────────────────────────────────────

function renderIconObject(iconObj: IconData['iconObject']): React.ReactElement | null {
  if (!iconObj) return null;

  const { type, props } = iconObj;
  const { children, ...otherProps } = props;

  const defaultProps: Record<string, string | number> = {};

  if (type === 'svg') {
    defaultProps.xmlns = 'http://www.w3.org/2000/svg';
  }

  if (type === 'path' || type === 'circle' || type === 'rect' || type === 'line') {
    if (!otherProps.fill) defaultProps.fill = 'none';
    if (!otherProps.stroke) defaultProps.stroke = 'currentColor';
    if (!otherProps.strokeLinecap) defaultProps.strokeLinecap = 'round';
    if (!otherProps.strokeLinejoin) defaultProps.strokeLinejoin = 'round';
  }

  const Element = type as keyof React.JSX.IntrinsicElements;

  return React.createElement(
    Element,
    { ...defaultProps, ...otherProps } as React.HTMLAttributes<HTMLElement>,
    children?.map((child, index) => (
      <React.Fragment key={index}>
        {renderIconObject(child)}
      </React.Fragment>
    ))
  );
}

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

function resolveImage(imageSrc: string | undefined) {
  if (!imageSrc) return null;
  return { src: imageSrc, alt: '', width: 1200, height: 675 };
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function BlobBlock({ data, renderInnerBlock, innerBlocks }: {
  data: MappedBlobData | MappedBlobDataWithInnerBlocks;
  renderInnerBlock?: (block: BlockNode) => React.ReactNode;
  innerBlocks?: BlockNode[];
}) {
  const { blobProps, appearance, header, marker, figure, actions, content } = data;

  // Récupérer la configuration d'apparence
  const appearanceConfig = appearance && APPEARANCES[appearance]
    ? APPEARANCES[appearance]
    : APPEARANCES.default;

  const markerChildren = resolveMarkerContent(marker?.type, marker?.icon, marker?.content);
  const resolvedImage = figure?.type === 'image' ? resolveImage(figure.src) : null;

  const markerVariant: MarkerVariant =
    marker?.style === 'secondary' ? 'secondary'
    : marker?.style === 'ghost' ? 'ghost'
    : 'default';

  const safeTitleAs: TitleAs = isValidTitleAs(header?.title?.as) ? header.title.as : 'h2';
  const safeEyebrowAs: TitleAs = isValidTitleAs(header?.eyebrow?.as) ? header.eyebrow.as : 'div';

  // Détermine si on affiche l'image dans Blob.Figure
  const shouldShowImage = figure && resolvedImage;

  return (
    <Blob {...blobProps} className={cn(appearanceConfig.blobClassName, blobProps.className)}>
      {markerChildren && (
        <Marker
          rounded={marker?.rounded === 'rounded-full'}
          variant={markerVariant}
          className={cn(
            [marker?.theme ? `theme-${marker.theme}` : '', marker?.size ? `blob-size-${marker.size}` : ''].filter(Boolean).join(' ') || undefined,
            appearanceConfig.markerClassName
          )}
        >
          {markerChildren}
        </Marker>
      )}

      {shouldShowImage && (
        <Blob.Figure className={cn(appearanceConfig.figureClassName)}>
          <Image
            src={resolvedImage.src}
            alt={resolvedImage.alt}
            width={resolvedImage.width}
            height={resolvedImage.height}
            className="w-full"
          />
        </Blob.Figure>
      )}

      {content?.enabled && !innerBlocks && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          <p className="text-muted-foreground">{content.text}</p>
        </Blob.Content>
      )}

      {innerBlocks && innerBlocks.length > 0 && renderInnerBlock && (
        <Blob.Content className={cn(appearanceConfig.contentClassName)}>
          {innerBlocks.map((innerBlock, index) => (
            <React.Fragment key={index}>
              {renderInnerBlock(innerBlock)}
            </React.Fragment>
          ))}
        </Blob.Content>
      )}

      {header && (
        <Blob.Header className={cn(appearanceConfig.headerClassName)}>
          {header.eyebrow && (
            <Eyebrow
              as={safeEyebrowAs}
              className={header.eyebrow.theme ? `theme-${header.eyebrow.theme}` : undefined}
            >
              {header.eyebrow.text}
            </Eyebrow>
          )}
          {header.title && (
            <Title as={safeTitleAs} emphasisText={header.title.emphasisText}>
              {header.title.text}
            </Title>
          )}
          {header.subtitle && (
            <Subtitle>{header.subtitle.text}</Subtitle>
          )}
        </Blob.Header>
      )}

      {actions && actions.length > 0 && (
        <Blob.Actions className={cn(appearanceConfig.actionsClassName)}>
          {actions.map((btn, i) => {
            const getButtonVariant = () => {
              switch (btn.variant) {
                case 'default': return 'default';
                case 'secondary': return 'secondary';
                case 'outline': return 'outline';
                case 'ghost': return 'ghost';
                case 'link': return 'link';
                default: return 'default';
              }
            };
            const isExternal = btn.opensInNewTab || btn.href?.startsWith('http');
            return isExternal ? (
              <Button key={i} asChild variant={getButtonVariant()} data-theme={btn.theme}>
                <a href={btn.href} target={btn.opensInNewTab ? '_blank' : undefined} rel={btn.opensInNewTab ? 'noopener noreferrer' : undefined}>
                  {btn.label}
                </a>
              </Button>
            ) : (
              <Button key={i} asChild variant={getButtonVariant()} data-theme={btn.theme}>
                <Link href={btn.href ?? '#'}>{btn.label}</Link>
              </Button>
            );
          })}
        </Blob.Actions>
      )}
    </Blob>
  );
}
