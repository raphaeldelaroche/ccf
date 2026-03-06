"use client"

import { createReactBlockSpec } from "@blocknote/react"
import { NodeSelection } from "prosemirror-state"
import {
  blockAlignmentProp,
  getAlignmentClass,
  isAlignmentLocked,
  type BlockAlignment,
} from "@/lib/editor/block-alignment"
import { useBlockSelection } from "@/components/editor/block-selection-context"
import { AlignmentToolbar } from "@/components/editor/AlignmentToolbar"

/**
 * Inner render component — extracted so React hooks are called
 * inside a proper React component (uppercase name).
 */
function SectionBlockRenderer({
  block,
  editor,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  block: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any
}) {
  const { selectedBlock, setSelectedBlock, selectedIdRef } = useBlockSelection()
  const alignment = (block.props.blockAlignment as BlockAlignment) || "default"
  const isSelected = selectedBlock?.id === block.id
  const locked = isAlignmentLocked("section")

  const handleMouseDown = (e: React.MouseEvent) => {
    const pmView = editor._tiptapEditor?.view
    if (!pmView) return

    if (selectedIdRef.current !== block.id) {
      setSelectedBlock({
        id: block.id,
        type: "section",
        props: block.props as Record<string, string | boolean>,
      })
    }

    let nodePos: number | null = null
    pmView.state.doc.descendants(
      (node: { attrs: { id: string } }, pos: number) => {
        if (nodePos !== null) return false
        if (node.attrs.id === block.id) {
          nodePos = pos
          return false
        }
      }
    )
    if (nodePos === null) return

    e.preventDefault()
    const selection = NodeSelection.create(pmView.state.doc, nodePos)
    pmView.dispatch(pmView.state.tr.setSelection(selection))
    pmView.focus()
  }

  const handleAlignmentChange = (value: BlockAlignment) => {
    editor.updateBlock(block.id, {
      type: "section",
      props: { blockAlignment: value },
    })
    setSelectedBlock({
      id: block.id,
      type: "section",
      props: { ...block.props, blockAlignment: value } as Record<string, string | boolean>,
    })
  }

  return (
    <div
      className="relative group"
      data-block-alignment={alignment}
      onMouseDown={handleMouseDown}
    >
      {isSelected && !locked && (
        <AlignmentToolbar
          value={alignment}
          onChange={handleAlignmentChange}
        />
      )}

      <div
        className={`
          ${getAlignmentClass(alignment)}
          min-h-[200px] rounded-lg bg-gray-200
          flex items-center justify-center
          transition-all duration-200
          border-2 border-dashed border-gray-300
        `}
      >
        <span className="text-sm text-gray-500 select-none">
          Section · {alignment}
        </span>
      </div>
    </div>
  )
}

export const sectionBlock = createReactBlockSpec(
  {
    type: "section" as const,
    propSchema: {
      blockAlignment: { ...blockAlignmentProp, default: "full" as const },
    },
    content: "none",
  },
  {
    render: (props) => <SectionBlockRenderer block={props.block} editor={props.editor} />,
  }
)
