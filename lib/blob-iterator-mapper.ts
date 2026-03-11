/**
 * BLOB ITERATOR FORM DATA MAPPER
 *
 * Maps form data from the iterator playground to BlobIterator component props.
 * Gère le système d'héritage inversé : par défaut tout est partagé,
 * seuls les champs listés dans itemFields sont gérés individuellement.
 */

import type { BlobComposableProps } from "@/lib/blob-compose"
import { mapFormDataToBlob, type BlobFormData, type MappedBlobData } from "@/lib/blob-form-mapper"
import type { SwiperOptions } from "swiper/types"
import type { BlockNode } from "@/lib/new-editor/block-types"
import type { FormDataValue } from "@/types/editor"

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

  // Items (array of BlockNode) - toujours des BlockNode complets maintenant
  items?: BlockNode[]

  // Allow any other FormDataValue
  [key: string]: FormDataValue | BlockNode[] | undefined
}

export interface MappedIteratorData {
  // Props pour BlobIterator
  iteratorLayout: string
  iteratorGapX: string;
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
  const sharedProps: Partial<BlobComposableProps> = {}
  const itemFields = parseJsonField<string[]>(formData.itemFields, [])

  // Helper: un champ est partagé s'il n'est pas dans itemFields
  const isShared = (key: string) => !itemFields.includes(key)

  // Layout props
  if (isShared("size") && formData.size) {
    sharedProps.size = formData.size as BlobComposableProps["size"]
  }

  if (isShared("theme") && formData.theme) {
    sharedProps.theme = formData.theme
  }

  if (isShared("layout") && formData.layout) {
    sharedProps.layout = formData.layout as BlobComposableProps["layout"]
  }

  if (isShared("direction") && formData.direction) {
    sharedProps.direction = formData.direction as BlobComposableProps["direction"]
  }

  if (isShared("align") && formData.align) {
    sharedProps.align = formData.align as BlobComposableProps["align"]
  }

  if (isShared("markerPosition") && formData.markerPosition) {
    sharedProps.marker = formData.markerPosition as BlobComposableProps["marker"]
  }

  // Spacing props
  if (isShared("paddingX") && formData.paddingX) {
    sharedProps.paddingX = formData.paddingX as string
  }

  if (isShared("paddingY") && formData.paddingY) {
    sharedProps.paddingY = formData.paddingY as string
  }

  if (isShared("gapX") && formData.gapX) {
    sharedProps.gapX = formData.gapX as string
  }

  // Figure props
  if (isShared("figureWidth") && formData.figureWidth) {
    sharedProps.figureWidth = formData.figureWidth as string
  }

  if (isShared("figureBleed") && formData.figureBleed) {
    sharedProps.figureBleed = formData.figureBleed as string
  }

  // Actions position
  if (isShared("actions") && formData.actions) {
    sharedProps.actions = formData.actions as BlobComposableProps["actions"]
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
 * Si un champ est dans itemFields → valeur de l'item.
 * Sinon → valeur partagée (depuis formData global).
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

  // Helper: si le champ est dans itemFields, utiliser la valeur de l'item, sinon la valeur globale
  const getFieldValue = (fieldKey: string): FormDataValue | undefined => {
    if (itemFields.includes(fieldKey)) {
      return actualData[fieldKey]
    }
    const value = formData[fieldKey]
    // Si c'est le champ items qui contient des BlockNode, on ne le retourne pas ici
    if (fieldKey === "items") return undefined
    return value as FormDataValue | undefined
  }

  // Convertir actualData en BlobFormData
  const itemFormData: BlobFormData = {
    ...actualData,

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
    gapX: getFieldValue("gapX") as string | undefined, gapY: getFieldValue("gapY") as string | undefined,

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

  return {
    iteratorLayout: formData.iteratorLayout || "grid-auto",
    iteratorGapX: formData.iteratorGapX ?? "md",
    iteratorGapY: formData.iteratorGapY ?? "md",
    swiperOptions,
    sharedBlobProps,
    sharedAppearance,
    items,
  }
}
