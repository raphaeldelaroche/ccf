/**
 * BLOB ITERATOR FORM DATA MAPPER
 *
 * Maps form data from the iterator playground to BlobIterator component props.
 * Gère le système d'héritage inversé : par défaut tout est partagé,
 * seuls les champs listés dans itemFields sont gérés individuellement.
 */

import type { BlobComposableProps, ResponsiveProps, ResponsiveBreakpointProps } from "@/lib/blob-compose"
import { convertResponsiveToString } from "@/lib/blob-compose"
import { mapFormDataToBlob, type BlobFormData, type MappedBlobData } from "@/lib/blob-form-mapper"
import type { SwiperOptions } from "swiper/types"
import type { BlockNode } from "@/lib/new-editor/block-types"
import type { FormDataValue } from "@/types/editor"

/**
 * Helper function to assign form values to responsive breakpoint props in a type-safe way.
 * Uses type assertion to convert FormData values to the specific union types
 * expected by ResponsiveBreakpointProps (e.g., Layout, Direction, SizeValue, etc.)
 */
function setResponsiveValue<K extends keyof ResponsiveBreakpointProps>(
  responsive: ResponsiveProps,
  breakpoint: 'base',
  key: K,
  value: FormDataValue | undefined
): void {
  if (!value) return
  if (!responsive[breakpoint]) {
    responsive[breakpoint] = {}
  }
  // Type assertion: we trust that form values match the expected union types
  // FormDataValue can be string | boolean | arrays, but responsive fields are typically strings
  responsive[breakpoint]![key] = value as ResponsiveBreakpointProps[K]
}

export interface BlobIteratorFormData {
  // Iterator container config
  iteratorLayout?: string
  iteratorGapX?: string; iteratorGapY?: string
  enableSwiper?: boolean
  swiperNavigation?: boolean
  swiperPagination?: boolean
  swiperAutoplay?: boolean
  swiperLoop?: boolean

  // Champs gérés par item (le reste est partagé)
  itemFields?: string[]

  // Shared config (global blob props — tout ce qui n'est pas dans itemFields)
  size?: string
  theme?: string
  layout?: string
  direction?: string
  align?: string
  markerPosition?: string
  appearance?: string

  // Responsive breakpoint values (from BreakpointDialog)
  responsive?: ResponsiveProps

  // Items (array of BlockNode) - toujours des BlockNode complets maintenant
  items?: BlockNode[]

  // Allow any other FormDataValue
  [key: string]: FormDataValue | BlockNode[] | ResponsiveProps | undefined
}

export interface MappedIteratorData {
  // Props pour BlobIterator (always strings in final output)
  iteratorLayout: string
  iteratorGapX: string
  iteratorGapY: string
  swiperOptions?: Partial<SwiperOptions>

  // Props héritées (partagées par tous les blobs)
  sharedBlobProps: Partial<BlobComposableProps> & {
    className?: string
  }
  sharedAppearance?: string

  // Items mappés (données pour chaque blob) avec innerBlocks et itemId
  items: Array<MappedBlobData & { innerBlocks?: BlockNode[]; itemId: string }>
}

/**
 * Construit les props partagées qui seront appliquées à tous les blobs.
 * Un champ est partagé s'il N'EST PAS dans itemFields.
 */
function parseJsonField<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try { return JSON.parse(value) as T } catch { return fallback }
  }
  return fallback
}

function buildSharedBlobProps(formData: BlobIteratorFormData): {
  blobProps: Partial<BlobComposableProps>
  appearance?: string
} {
  const itemFields = parseJsonField<string[]>(formData.itemFields, [])

  // Helper: un champ est partagé s'il n'est pas dans itemFields
  const isShared = (key: string) => !itemFields.includes(key)

  // Build responsive object from base values + responsive overrides
  const responsive: ResponsiveProps = {
    base: {},
    ...(formData.responsive || {}),
  }

  // Add base values to base breakpoint if fields are shared
  if (isShared("size")) {
    setResponsiveValue(responsive, 'base', 'size', formData.size as FormDataValue)
  }
  if (isShared("layout")) {
    setResponsiveValue(responsive, 'base', 'layout', formData.layout as FormDataValue)
  }
  if (isShared("direction")) {
    setResponsiveValue(responsive, 'base', 'direction', formData.direction as FormDataValue)
  }
  if (isShared("align")) {
    setResponsiveValue(responsive, 'base', 'align', formData.align as FormDataValue)
  }
  if (isShared("markerPosition")) {
    setResponsiveValue(responsive, 'base', 'marker', formData.markerPosition as FormDataValue)
  }
  if (isShared("paddingX")) {
    setResponsiveValue(responsive, 'base', 'paddingX', formData.paddingX as FormDataValue)
  }
  if (isShared("paddingY")) {
    setResponsiveValue(responsive, 'base', 'paddingY', formData.paddingY as FormDataValue)
  }
  if (isShared("gapX")) {
    setResponsiveValue(responsive, 'base', 'gapX', formData.gapX as FormDataValue)
  }
  if (isShared("gapY")) {
    setResponsiveValue(responsive, 'base', 'gapY', formData.gapY as FormDataValue)
  }
  if (isShared("figureWidth")) {
    setResponsiveValue(responsive, 'base', 'figureWidth', formData.figureWidth as FormDataValue)
  }
  if (isShared("figureBleed")) {
    setResponsiveValue(responsive, 'base', 'figureBleed', formData.figureBleed as FormDataValue)
  }
  if (isShared("actions")) {
    setResponsiveValue(responsive, 'base', 'actions', formData.actions as FormDataValue)
  }

  const sharedProps: Partial<BlobComposableProps> = {
    responsive,
    theme: isShared("theme") ? formData.theme : undefined,
  }

  return {
    blobProps: sharedProps,
    appearance: isShared("appearance") ? formData.appearance : undefined,
  }
}

/**
 * Construit les options Swiper à partir des champs du formulaire
 */
function buildSwiperOptions(formData: BlobIteratorFormData): Partial<SwiperOptions> | undefined {
  if (!formData.enableSwiper) return undefined

  const options: Partial<SwiperOptions> = {}

  if (formData.swiperNavigation) {
    options.navigation = true
  }

  if (formData.swiperPagination) {
    options.pagination = {
      clickable: true,
    }
  }

  if (formData.swiperAutoplay) {
    options.autoplay = {
      delay: 3000,
      disableOnInteraction: false,
    }
  }

  if (formData.swiperLoop) {
    options.loop = true
  }

  return Object.keys(options).length > 0 ? options : undefined
}

/**
 * Mappe un item individuel (BlockNode) en tenant compte des champs par item.
 * Si un champ est dans itemFields → valeur de l'item (peut inclure responsive).
 * Sinon → valeur partagée (depuis sharedProps).
 * Préserve les innerBlocks et l'ID de l'item.
 */
function mapIteratorItem(
  item: BlockNode,
  sharedProps: Partial<BlobComposableProps>,
  formData: BlobIteratorFormData
): MappedBlobData & { innerBlocks?: BlockNode[]; itemId: string } {
  // Extraire l'ID, les innerBlocks et les données de l'item
  const itemId = item.id;
  const innerBlocks = item.innerBlocks;
  const actualData = item.data;
  const itemFields = parseJsonField<string[]>(formData.itemFields, [])

  // Build responsive object for this item
  const globalResponsive = formData.responsive as ResponsiveProps | undefined
  const itemResponsive = actualData.responsive as ResponsiveProps | undefined

  // Merge global responsive with item responsive (item overrides global)
  const mergedResponsive: ResponsiveProps = {
    base: {},
    ...globalResponsive,
    ...itemResponsive,
  }

  // Helper: si le champ est dans itemFields, utiliser la valeur de l'item
  // Sinon, utiliser la valeur globale
  const getFieldValue = (fieldKey: string): FormDataValue | undefined => {
    if (itemFields.includes(fieldKey)) {
      return actualData[fieldKey] as FormDataValue | undefined
    }
    return formData[fieldKey] as FormDataValue | undefined
  }

  // Convertir en BlobFormData avec les valeurs et le responsive object
  const itemFormData: BlobFormData = {
    // Header fields
    title: getFieldValue("title") as string | undefined,
    emphasisText: getFieldValue("emphasisText") as string | undefined,
    eyebrow: getFieldValue("eyebrow") as string | undefined,
    eyebrowTheme: getFieldValue("eyebrowTheme") as string | undefined,
    subtitle: getFieldValue("subtitle") as string | undefined,

    // Marker fields
    markerType: getFieldValue("markerType") as string | undefined,
    markerContent: getFieldValue("markerContent") as string | undefined,
    markerIcon: getFieldValue("markerIcon") as string | undefined,
    markerPosition: getFieldValue("markerPosition") as string | undefined,
    markerStyle: getFieldValue("markerStyle") as string | undefined,
    markerSize: getFieldValue("markerSize") as string | undefined,
    markerTheme: getFieldValue("markerTheme") as string | undefined,
    markerRounded: getFieldValue("markerRounded") as string | undefined,

    // Figure fields
    figureType: getFieldValue("figureType") as string | undefined,
    figureWidth: getFieldValue("figureWidth") as string | undefined,
    figureBleed: getFieldValue("figureBleed") as string | undefined,
    image: getFieldValue("image") as string | undefined,
    video: getFieldValue("video") as string | undefined,

    // Buttons fields
    actions: getFieldValue("actions") as string | undefined,
    buttons: getFieldValue("buttons") as Array<Record<string, unknown>> | undefined,

    // Content fields
    showContent: getFieldValue("showContent") as boolean | undefined,
    contentType: getFieldValue("contentType") as string | undefined,
    contentText: getFieldValue("contentText") as string | undefined,
    fontSize: getFieldValue("fontSize") as string | undefined,

    // Layout fields
    size: getFieldValue("size") as string | undefined,
    layout: getFieldValue("layout") as string | undefined,
    direction: getFieldValue("direction") as string | undefined,
    align: getFieldValue("align") as string | undefined,

    // Spacing fields
    paddingX: getFieldValue("paddingX") as string | undefined,
    paddingY: getFieldValue("paddingY") as string | undefined,
    gapX: getFieldValue("gapX") as string | undefined,
    gapY: getFieldValue("gapY") as string | undefined,

    // Style fields
    theme: getFieldValue("theme") as string | undefined,
    appearance: getFieldValue("appearance") as string | undefined,
    backgroundType: getFieldValue("backgroundType") as string | undefined,
    backgroundColor: getFieldValue("backgroundColor") as string | undefined,
    backgroundImage: getFieldValue("backgroundImage") as string | undefined,
    backgroundStyle: getFieldValue("backgroundStyle") as string | undefined,

    // Separator fields
    showSeparator: getFieldValue("showSeparator") as boolean | undefined,
    separatorType: getFieldValue("separatorType") as string | undefined,
    separatorPosition: getFieldValue("separatorPosition") as string | undefined,
    separatorColor: getFieldValue("separatorColor") as string | undefined,

    // SEO fields
    titleAs: getFieldValue("titleAs") as string | undefined,
    eyebrowAs: getFieldValue("eyebrowAs") as string | undefined,

    // Responsive object (merged global + item)
    responsive: mergedResponsive,
  }

  // Utiliser le mapper blob existant et préserver les innerBlocks et l'ID
  const mappedBlob = mapFormDataToBlob(itemFormData);

  return {
    ...mappedBlob,
    innerBlocks,
    itemId
  };
}

/**
 * Mappe les données du formulaire iterator vers les props du composant BlobIterator
 */
export function mapIteratorFormData(formData: BlobIteratorFormData): MappedIteratorData {
  const { blobProps: sharedBlobProps, appearance: sharedAppearance } = buildSharedBlobProps(formData)
  const swiperOptions = buildSwiperOptions(formData)

  // Mapper chaque item (items peut être une string JSON depuis Redis)
  // Les items sont toujours des BlockNode complets
  const rawItems = parseJsonField<BlockNode[]>(formData.items, [])
  const items = rawItems.map((item) => mapIteratorItem(item, sharedBlobProps, formData))

  // Convert responsive container props to strings (if responsive mode is active)
  const responsive = formData.responsive as ResponsiveProps | undefined

  // Helper to get container prop as string (responsive or simple)
  const getContainerPropString = (key: "iteratorLayout" | "iteratorGapX" | "iteratorGapY", fallback: string): string => {
    if (responsive) {
      // Try to convert responsive object to string
      const responsiveString = convertResponsiveToString(responsive, key)
      if (responsiveString) {
        return responsiveString
      }
    }

    // Fallback to simple string (backward compatibility)
    return formData[key] as string || fallback
  }

  return {
    iteratorLayout: getContainerPropString("iteratorLayout", "grid-auto"),
    iteratorGapX: getContainerPropString("iteratorGapX", "md"),
    iteratorGapY: getContainerPropString("iteratorGapY", "md"),
    swiperOptions,
    sharedBlobProps,
    sharedAppearance,
    items,
  }
}
