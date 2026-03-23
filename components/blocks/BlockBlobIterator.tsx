import type { MappedIteratorData } from "@/lib/blob-iterator-mapper"
import { BlobIterator, type IteratorLayout } from "@/components/blob/blob-iterator"
import type { SizeValue } from "@/components/blob/blob-grid"
import { BlobBlock } from "./BlockBlob"
import type { BlockNode } from "@/lib/new-editor/block-types"

/**
 * BlockBlobIterator - Renderer pour le composant BlobIterator
 *
 * Utilise les données mappées depuis le formulaire iterator pour
 * rendre un BlobIterator avec tous ses items.
 *
 * @param data - Données mappées depuis mapIteratorFormData
 * @param renderInnerBlock - Fonction pour rendre les blocs imbriqués (optionnel)
 */
export function BlockBlobIterator({
  data,
  renderInnerBlock
}: {
  data: MappedIteratorData;
  renderInnerBlock?: (block: BlockNode) => React.ReactNode;
}) {
  const { iteratorLayout, iteratorGapX, iteratorGapY, swiperOptions, swiperSlideWidth, swiperResponsiveConfig, iteratorAppearance, iteratorBackground, sharedBlobProps, sharedAppearance, sharedBackground, items } = data

  return (
    <BlobIterator
      containerLayout={iteratorLayout as IteratorLayout}
      gapX={iteratorGapX as SizeValue} gapY={iteratorGapY as SizeValue}
      swiperOptions={swiperOptions}
      swiperSlideWidth={swiperSlideWidth}
      swiperResponsiveConfig={swiperResponsiveConfig}
      appearance={iteratorAppearance}
      background={iteratorBackground}
    >
      {items.map((itemData, index) => {
        // Fusionner les props partagées avec les props de l'item
        const mergedData = {
          ...itemData,
          blobProps: {
            ...sharedBlobProps,
            ...itemData.blobProps,
          },
          appearance: sharedAppearance || itemData.appearance,
          background: sharedBackground || itemData.background,
        }

        // Passer les innerBlocks et la fonction de rendu si disponibles
        return (
          <BlobBlock
            key={index}
            data={mergedData}
            innerBlocks={itemData.innerBlocks}
            renderInnerBlock={renderInnerBlock}
          />
        )
      })}
    </BlobIterator>
  )
}
