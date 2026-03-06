import React from "react";
import type { MappedBlobData } from "@/lib/blob-form-mapper";
import type { FormDataValue, BlockNode } from "@/types/editor";
import type { BlockDefinition } from "@/lib/block-definition";

const CONTAINER_CLASSES: Record<string, string> = {
  center: "px-4 [&>div]:max-w-4xl [&>div]:mx-auto",
  wide:   "px-4 [&>div]:max-w-7xl [&>div]:mx-auto",
  full:   "w-full",
};

interface SectionBlockProps {
  formData: Record<string, FormDataValue>;
  mappedData: MappedBlobData;
  innerBlocks?: BlockNode[];
  renderInnerBlock?: (block: BlockNode) => React.ReactNode;
}

export const SectionBlockDefinition: BlockDefinition = {
  extraSections: {
    section: {
      label: "Section",
      fields: {
        containerWidth: {
          type: "dropdown",
          label: "Largeur du container",
          options: {
            center: "Centré",
            wide:   "Large",
            full:   "Pleine largeur",
          },
        },
      },
    },
  },
  initialValues: {
    paddingY: "8xl",
    align: "center",
  },
  render: (formData, mappedData) => (
    <SectionBlock formData={formData} mappedData={mappedData as MappedBlobData} />
  ),
};


export function SectionBlock({ formData, innerBlocks, renderInnerBlock }: SectionBlockProps): React.ReactElement {
  const containerWidth = (formData.containerWidth as string) || "center";
  const containerClass = CONTAINER_CLASSES[containerWidth] ?? CONTAINER_CLASSES.center;

  return (
    <section className={`py-8 border-b ${containerClass}`}>
      {innerBlocks && innerBlocks.length > 0 && renderInnerBlock
        ? innerBlocks.map((block) => (
            <React.Fragment key={block.id}>
              {renderInnerBlock(block)}
            </React.Fragment>
          ))
        : null}
    </section>
  );
}

// Alias pour compatibilité
export { SectionBlock as BlockBlobSection }