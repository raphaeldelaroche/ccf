/**
 * BLOB FORM DATA MAPPER
 *
 * Maps form data from the blob toolbar to Blob component props.
 *
 * INCERTITUDES ET QUESTIONS DE MAPPING :
 *
 * 1. **Background, Separator** :
 *    - Ces propriétés n'ont pas d'équivalent direct dans les props de Blob
 *    - Ce sont probablement des props de niveau page/section
 *    - Marquées comme "unmapped" pour inspection
 */

import type { BlobComposableProps } from "@/lib/blob-compose"
import { iconOptions, type IconData } from "@/lib/blob-fields"

// Re-export IconData pour faciliter les imports
export type { IconData }

type FormDataValue = string | boolean | string[] | Array<Record<string, unknown>>

export interface BlobFormData {
  [key: string]: FormDataValue | undefined

  // Textes
  title?: string
  emphasisText?: string
  eyebrow?: string
  eyebrowTheme?: string
  subtitle?: string

  // Marker
  markerType?: string
  markerContent?: string
  markerIcon?: string
  markerPosition?: string
  markerStyle?: string
  markerSize?: string
  markerTheme?: string
  markerRounded?: string

  // Figure/Media
  figureType?: string
  figureWidth?: string
  figureBleed?: string
  image?: string
  video?: string

  // Buttons
  buttons?: Array<{
    label?: string
    linkType?: string
    internalHref?: string
    externalHref?: string
    customAction?: string
    variant?: string
    theme?: string
    opensInNewTab?: boolean
  }>

  // Content
  showContent?: boolean | string
  contentText?: string
  contentPosition?: string
  fontSize?: string

  // Layout
  size?: string
  layout?: string
  direction?: string
  align?: string
  paddingX?: string
  paddingY?: string
  gutter?: string
  actions?: string

  // Style
  appearance?: string
  theme?: string
  backgroundType?: string
  backgroundColor?: string
  backgroundImage?: string
  backgroundStyle?: string

  // Separator (non mappé au composant Blob)
  showSeparator?: boolean
  separatorType?: string
  separatorPosition?: string
  separatorColor?: string

  // SEO
  titleAs?: string
  eyebrowAs?: string
}

export interface MappedBlobData {
  // Props mappées vers Blob
  blobProps: BlobComposableProps & {
    className?: string
  }

  // Apparence (wrapper styling)
  appearance?: string

  // Données pour reconstruction des sous-composants
  header?: {
    eyebrow?: {
      text: string
      theme?: string
      as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    }
    title?: {
      text: string
      as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
      emphasisText?: string
    }
    subtitle?: {
      text: string
    }
  }

  marker?: {
    type: "text" | "icon"
    content?: string
    icon?: IconData
    style?: string
    size?: string
    theme?: string
    rounded?: string
  }

  figure?: {
    type: "image" | "video"
    src: string
  }

  actions?: Array<{
    label: string
    href?: string
    variant?: string
    theme?: string
    opensInNewTab?: boolean
  }>

  content?: {
    enabled: boolean
    fontSize?: string
    text: string
  }

  // Props non mappées (pour debugging)
  unmapped: {
    backgroundType?: string
    backgroundColor?: string
    backgroundImage?: string
    backgroundStyle?: string
    showSeparator?: boolean
    separatorType?: string
    separatorPosition?: string
    separatorColor?: string
  }

  // Incertitudes détectées
  uncertainties: Array<{
    field: string
    reason: string
    value: unknown
  }>
}

/**
 * Mappe les données du formulaire vers les props du composant Blob
 */
export function mapFormDataToBlob(formData: BlobFormData): MappedBlobData {
  const uncertainties: Array<{ field: string; reason: string; value: unknown }> = []

  // ── Layout & Direction mapping ──
  const layout = formData.layout
  const direction = formData.direction || "default"

  // ── Marker mapping ──
  let marker: string | undefined
  if (formData.markerType && formData.markerType !== "none") {
    marker = formData.markerPosition
  }

  // ── Figure Width mapping ──
  // Le formulaire utilise des fractions (1/2, 1/3, etc.) qui seront converties en classes CSS (1-2, 1-3)
  let figureWidth: string | undefined
  if (formData.figureWidth && formData.figureType && formData.figureType !== "none") {
    figureWidth = formData.figureWidth
  }

  // ── Spacing mapping ──
  const paddingX = (!formData.paddingX || formData.paddingX === "auto")
    ? formData.size
    : (formData.paddingX !== "none" ? formData.paddingX : undefined)
  const paddingY = (!formData.paddingY || formData.paddingY === "auto")
    ? formData.size
    : (formData.paddingY !== "none" ? formData.paddingY : undefined)
  // "auto" signifie que gutter = size, donc on utilise la valeur de size
  const gutter = formData.gutter === "auto"
    ? formData.size
    : (formData.gutter && formData.gutter !== "none" ? formData.gutter : undefined)

  // ── Figure Bleed mapping ──
  const figureBleed = formData.figureBleed && formData.figureType && formData.figureType !== "none"
    ? formData.figureBleed
    : undefined

  // ── Blob Props ──
  const blobProps: BlobComposableProps = {
    layout: layout as BlobComposableProps["layout"],
    direction: direction as BlobComposableProps["direction"],
    marker: marker as BlobComposableProps["marker"],
    actions: (formData.actions || "after") as BlobComposableProps["actions"],
    align: formData.align as BlobComposableProps["align"],
    figureWidth: figureWidth as BlobComposableProps["figureWidth"],
    size: formData.size as BlobComposableProps["size"],
    gutter: gutter as BlobComposableProps["gutter"],
    paddingX: paddingX as BlobComposableProps["paddingX"],
    paddingY: paddingY as BlobComposableProps["paddingY"],
    figureBleed: figureBleed as BlobComposableProps["figureBleed"],
    theme: formData.theme,
  }

  // ── Header data ──
  const header = (formData.title || formData.eyebrow || formData.subtitle) ? {
    ...(formData.eyebrow && {
      eyebrow: {
        text: formData.eyebrow,
        theme: formData.eyebrowTheme,
        as: formData.eyebrowAs as "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined,
      }
    }),
    ...(formData.title && {
      title: {
        text: formData.title,
        as: formData.titleAs as "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined,
        emphasisText: formData.emphasisText,
      }
    }),
    ...(formData.subtitle && {
      subtitle: {
        text: formData.subtitle,
      }
    }),
  } : undefined

  // ── Marker data ──
  const markerData = formData.markerType && formData.markerType !== "none" ? {
    type: formData.markerType as "text" | "icon",
    content: formData.markerContent,
    icon: formData.markerIcon && typeof formData.markerIcon === 'string'
      ? iconOptions[formData.markerIcon]
      : undefined,
    style: formData.markerStyle,
    size: formData.markerSize && formData.markerSize !== 'auto' ? formData.markerSize : undefined,
    theme: formData.markerTheme,
    rounded: formData.markerRounded,
  } : undefined

  // ── Figure data ──
  const figure = formData.figureType && formData.figureType !== "none" ? {
    type: formData.figureType as "image" | "video",
    src: (formData.figureType === "image" ? formData.image : formData.video) as string,
  } : undefined

  // ── Actions/Buttons data ──
  const actions = formData.buttons && Array.isArray(formData.buttons) && formData.buttons.length > 0
    ? formData.buttons.map(btn => ({
        label: btn.label || "",
        href: btn.linkType === "internal"
          ? btn.internalHref
          : btn.linkType === "external"
            ? btn.externalHref
            : undefined,
        variant: btn.variant,
        theme: btn.theme,
        opensInNewTab: btn.opensInNewTab,
      }))
    : undefined

  // ── Content data ──
  // showContent is stored as a "true"/"false" string in the BlockNote propSchema,
  // so we must normalize it explicitly — `!!"false"` would be truthy otherwise.
  const showContentEnabled = formData.showContent === true || formData.showContent === "true"
  const content = {
    enabled: showContentEnabled,
    fontSize: formData.fontSize,
    text: formData.contentText || (showContentEnabled ? "Votre contenu ici..." : ""),
  }

  // ── Unmapped props ──
  const unmapped = {
    backgroundType: formData.backgroundType,
    backgroundColor: formData.backgroundColor,
    backgroundImage: formData.backgroundImage,
    backgroundStyle: formData.backgroundStyle,
    showSeparator: formData.showSeparator,
    separatorType: formData.separatorType,
    separatorPosition: formData.separatorPosition,
    separatorColor: formData.separatorColor,
  }

  return {
    blobProps,
    appearance: formData.appearance,
    header,
    marker: markerData,
    figure,
    actions,
    content,
    unmapped,
    uncertainties,
  }
}
