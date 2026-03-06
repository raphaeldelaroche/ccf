"use client"

import { CollapsibleSection } from "./CollapsibleSection"
import { AlignmentInspectorField } from "./AlignmentInspectorField"
import type { BlockAlignment } from "@/lib/editor/block-alignment"

interface SectionInspectorProps {
  block: { id: string; type: string; props: Record<string, string | boolean> }
  onUpdateProp: (propName: string, value: string | boolean) => void
}

/**
 * Inspector panel for the Section custom block.
 * Currently only exposes block alignment.
 * Extend with additional CollapsibleSections as the block gains features
 * (background, padding, inner blocks, etc.).
 */
export function SectionInspector({ block, onUpdateProp }: SectionInspectorProps) {
  const alignment = (block.props.blockAlignment as BlockAlignment) || "default"

  return (
    <div>
      <CollapsibleSection title="Disposition" defaultOpen>
        <AlignmentInspectorField
          value={alignment}
          blockType={block.type}
          onChange={(value) => onUpdateProp("blockAlignment", value)}
        />
      </CollapsibleSection>
    </div>
  )
}
