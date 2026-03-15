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

import type { BlobComposableProps, ResponsiveProps, ResponsiveBreakpointProps } from "@/lib/blob-compose"
import { iconOptions, type IconData } from "@/lib/blob-fields"

// Re-export IconData pour faciliter les imports
export type { IconData }

type FormDataValue = string | boolean | string[] | Array<Record<string, unknown>> | ResponsiveProps

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
  headerPaddingX?: string
  headerPaddingY?: string
  gapX?: string; gapY?: string
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

  // Responsive
  responsive?: ResponsiveProps
}

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'link';

const VALID_BUTTON_VARIANTS: ButtonVariant[] = ['default', 'secondary', 'outline', 'ghost', 'link'];

function toButtonVariant(val: string | undefined): ButtonVariant {
  return VALID_BUTTON_VARIANTS.includes(val as ButtonVariant) ? (val as ButtonVariant) : 'default';
}

export type TitleAs = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const VALID_TITLE_AS: TitleAs[] = ["div", "h1", "h2", "h3", "h4", "h5", "h6"];

function toTitleAs(val: string | undefined, fallback: TitleAs): TitleAs {
  return VALID_TITLE_AS.includes(val as TitleAs) ? (val as TitleAs) : fallback;
}

export type MarkerVariant = "default" | "secondary" | "ghost";

const VALID_MARKER_VARIANTS: MarkerVariant[] = ["default", "secondary", "ghost"];

function toMarkerVariant(val: string | undefined): MarkerVariant {
  return VALID_MARKER_VARIANTS.includes(val as MarkerVariant) ? (val as MarkerVariant) : "default";
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
      /** Classe CSS pré-calculée depuis theme (ex: "theme-blue") */
      className?: string
      as: TitleAs
    }
    title?: {
      text: string
      as: TitleAs
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
    style: MarkerVariant
    size?: string
    theme?: string
    rounded: boolean
    /** Classes CSS pré-calculées depuis theme + size (ex: "theme-blue blob-size-md") */
    className: string
  }

  figure?: {
    type: "image" | "video"
    src: string
    alt: string
    width: number
    height: number
  }

  actions?: Array<{
    label: string
    variant: ButtonVariant
    theme?: string
    /** Props de lien pré-calculées (href, target, rel) */
    linkProps: {
      href: string
      target?: '_blank'
      rel?: 'noopener noreferrer'
    }
  }>

  content?: {
    enabled: boolean
    fontSize?: string
    text: string
    showContent?: boolean
    contentType?: string
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
  // paddingX/paddingY "auto" → use size value (e.g., size=lg → paddingX=lg)
  const paddingX = (!formData.paddingX || formData.paddingX === "auto")
    ? formData.size
    : formData.paddingX
  const paddingY = (!formData.paddingY || formData.paddingY === "auto")
    ? formData.size
    : formData.paddingY
  // headerPadding "auto" → undefined (use default from token)
  const headerPaddingX = (!formData.headerPaddingX || formData.headerPaddingX === "auto")
    ? undefined
    : formData.headerPaddingX
  const headerPaddingY = (!formData.headerPaddingY || formData.headerPaddingY === "auto")
    ? undefined
    : formData.headerPaddingY
  // gap "auto" → undefined (use default gap from the size token)
  const gapX = (!formData.gapX || formData.gapX === "auto") ? undefined : formData.gapX
  const gapY = (!formData.gapY || formData.gapY === "auto") ? undefined : formData.gapY

  // ── Figure Bleed mapping ──
  const figureBleed = formData.figureBleed && formData.figureType && formData.figureType !== "none"
    ? formData.figureBleed
    : undefined

  // ── Blob Props (responsive object) ──
  // Build base values from legacy fields
  // Note: Using 'as ResponsiveBreakpointProps' because formData values are strings validated by the form,
  // and TypeScript can't statically verify they match the literal union types
  const baseValues = {
    layout,
    direction,
    marker,
    actions: formData.actions || "after",
    align: formData.align,
    figureWidth,
    size: formData.size,
    gapX,
    gapY,
    paddingX,
    paddingY,
    headerPaddingX,
    headerPaddingY,
    figureBleed,
  } as ResponsiveBreakpointProps

  // Helper: filter out undefined keys from an object to avoid spread operator issues
  const cleanBaseValues = Object.fromEntries(
    Object.entries(baseValues).filter(([_, v]) => v !== undefined)
  )

  const cleanBase = formData.responsive?.base
    ? Object.fromEntries(
        Object.entries(formData.responsive.base).filter(([_, v]) => v !== undefined)
      )
    : {}

  // Merge responsive overrides, but only defined values
  // Priority: formData.responsive.base > baseValues (from legacy fields)
  // This ensures that when user selects "auto" (which deletes the key),
  // the value is removed, but when a value exists in responsive.base, it takes precedence
  const responsive: ResponsiveProps = {
    base: {
      ...cleanBaseValues,
      ...cleanBase,
    },
    sm: formData.responsive?.sm,
    md: formData.responsive?.md,
    lg: formData.responsive?.lg,
    xl: formData.responsive?.xl,
    "2xl": formData.responsive?.["2xl"],
  }

  const blobProps: BlobComposableProps = {
    responsive,
    theme: formData.theme,
  }

  // ── Header data ──
  const header = (formData.title || formData.eyebrow || formData.subtitle) ? {
    ...(formData.eyebrow && {
      eyebrow: {
        text: formData.eyebrow,
        theme: formData.eyebrowTheme,
        className: formData.eyebrowTheme ? `theme-${formData.eyebrowTheme}` : undefined,
        as: toTitleAs(formData.eyebrowAs, 'div'),
      }
    }),
    ...(formData.title && {
      title: {
        text: formData.title,
        as: toTitleAs(formData.titleAs, 'h2'),
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
    style: toMarkerVariant(formData.markerStyle),
    size: formData.markerSize && formData.markerSize !== 'auto' ? formData.markerSize : undefined,
    theme: formData.markerTheme,
    rounded: formData.markerRounded === 'rounded-full',
    className: [
      formData.markerTheme ? `theme-${formData.markerTheme}` : '',
      formData.markerSize && formData.markerSize !== 'auto' ? `blob-size-${formData.markerSize}` : '',
    ].filter(Boolean).join(' '),
  } : undefined

  // ── Figure data ──
  const figure = formData.figureType && formData.figureType !== "none" ? {
    type: formData.figureType as "image" | "video",
    src: (formData.figureType === "image" ? formData.image : formData.video) as string,
    alt: '',
    width: 1920,
    height: 1080,
  } : undefined

  // ── Actions/Buttons data ──
  // buttons peut être un tableau (depuis l'éditeur) ou une string JSON (depuis Redis)
  const rawButtons = (() => {
    if (!formData.buttons) return []
    if (Array.isArray(formData.buttons)) return formData.buttons
    if (typeof formData.buttons === "string") {
      try { const p = JSON.parse(formData.buttons); return Array.isArray(p) ? p : [] } catch { return [] }
    }
    return []
  })()
  const actions = rawButtons.length > 0
    ? rawButtons.map(btn => {
        const href = btn.linkType === "internal"
          ? btn.internalHref
          : btn.linkType === "external"
            ? btn.externalHref
            : undefined
        const opensInNewTab = btn.opensInNewTab === true || btn.opensInNewTab === "true"
        return {
          label: btn.label || "",
          variant: toButtonVariant(btn.variant),
          theme: btn.theme,
          linkProps: {
            href: href ?? '#',
            target: opensInNewTab ? '_blank' as const : undefined,
            rel: opensInNewTab ? 'noopener noreferrer' as const : undefined,
          },
        }
      })
    : undefined

  // ── Content data ──
  // showContent is stored as a "true"/"false" string in the BlockNote propSchema,
  // so we must normalize it explicitly — `!!"false"` would be truthy otherwise.
  const showContentEnabled = formData.showContent === true || formData.showContent === "true"
  // Text content is only active when contentType is "text" (or unset, for backwards compat).
  // When contentType is "innerBlocks", the text content must not render.
  const isTextContent = !formData.contentType || formData.contentType === "text"
  // Si contentText existe, on considère que le contenu doit être affiché (pour les items d'iterator)
  const hasContentText = Boolean(formData.contentText && formData.contentText.trim())
  const content = {
    enabled: (showContentEnabled || hasContentText) && isTextContent,
    fontSize: formData.fontSize,
    text: formData.contentText || (showContentEnabled && isTextContent ? "Votre contenu ici..." : ""),
    // Expose showContent et contentType pour gérer les innerBlocks
    showContent: showContentEnabled,
    contentType: formData.contentType as string | undefined,
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
