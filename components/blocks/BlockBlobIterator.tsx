import type { MappedIteratorData } from "@/lib/blob-iterator-mapper"
import { BlobIterator, type IteratorLayout } from "@/components/blob/blob-iterator"
import type { SizeValue } from "@/components/blob/blob-grid"
import { BlobBlock } from "./BlockBlob"

/**
 * BlockBlobIterator - Renderer pour le composant BlobIterator
 *
 * Utilise les données mappées depuis le formulaire iterator pour
 * rendre un BlobIterator avec tous ses items.
 *
 * @param data - Données mappées depuis mapIteratorFormData
 */
export function BlockBlobIterator({ data }: { data: MappedIteratorData }) {
  const { iteratorLayout, iteratorGutter, swiperOptions, sharedBlobProps, sharedAppearance, items } = data

  return (
    <BlobIterator
      containerLayout={iteratorLayout as IteratorLayout}
      gutter={iteratorGutter as SizeValue}
      swiperOptions={swiperOptions}
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
        }

        return <BlobBlock key={index} data={mergedData} />
      })}
    </BlobIterator>
  )
}
