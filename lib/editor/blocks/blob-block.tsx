import React from "react"
import { createReactBlockSpec } from "@blocknote/react"
import { NodeSelection } from "prosemirror-state"
import { BlobBlock as BlobBlockComponent } from "@/components/blocks/BlockBlob"
import { mapFormDataToBlob } from "@/lib/blob-form-mapper"
import { useBlockSelection } from "@/components/editor/block-selection-context"
import type { FormDataValue } from "@/types/editor"
import { SIZES, COLORS, TAGS } from "@/lib/blob-fields"

/**
 * Custom BlockNote block for Blob
 *
 * This block includes ALL 40+ fields from the Blob system:
 * - Header (title, emphasisText, eyebrow, subtitle)
 * - Marker (type, content, icon, position, style, size, theme, rounded)
 * - Figure (type, width, bleed, image, video)
 * - Buttons (actions, buttons array)
 * - Content (showContent, contentType, contentText, fontSize)
 * - Layout (size, layout, direction, align)
 * - Spacing (paddingX, paddingY, gutter)
 * - Style (appearance, theme, backgroundType, backgroundColor, backgroundImage, backgroundStyle)
 * - Separator (showSeparator, separatorType, separatorPosition, separatorColor)
 * - SEO (titleAs, eyebrowAs)
 */
export const blobBlock = createReactBlockSpec(
  {
    type: "blob" as const,
    propSchema: {
      // ─── Header ───────────────────────────────────────────────────
      title: { default: "" },
      emphasisText: { default: "" },
      eyebrow: { default: "" },
      eyebrowTheme: { default: "blue", values: [...COLORS] },
      subtitle: { default: "" },

      // ─── Marker ───────────────────────────────────────────────────
      markerType: { default: "none", values: ["none", "text", "icon"] },
      markerContent: { default: "" },
      markerIcon: { default: "" }, // Will store icon name
      markerPosition: { default: "left", values: ["top", "left", "right"] },
      markerStyle: { default: "default", values: ["default", "ghost", "secondary"] },
      markerSize: { default: "auto", values: ["auto", ...SIZES] },
      markerTheme: { default: "blue", values: [...COLORS] },
      markerRounded: { default: "rounded-square", values: ["rounded-square", "rounded-full"] },

      // ─── Figure ───────────────────────────────────────────────────
      figureType: { default: "none", values: ["none", "image", "video"] },
      figureWidth: { default: "", values: ["", "1/2", "1/3", "2/3", "1/4", "3/4"] },
      figureBleed: { default: "none", values: ["none", "full"] },
      image: { default: "" }, // Image URL or path
      video: { default: "" }, // Video URL or path

      // ─── Buttons ──────────────────────────────────────────────────
      actions: { default: "", values: ["", "after", "before"] },
      // Note: buttons array will be stored as JSON string for now
      buttons: { default: "[]" },

      // ─── Content ──────────────────────────────────────────────────
      showContent: { default: "false", values: ["true", "false"] },
      contentType: { default: "text", values: ["text", "innerBlocks"] },
      contentText: { default: "" },
      fontSize: { default: "md", values: [...SIZES] },

      // ─── Layout ───────────────────────────────────────────────────
      size: { default: "md", values: [...SIZES] },
      layout: { default: "stack", values: ["stack", "row", "bar"] },
      direction: { default: "", values: ["", "reverse"] },
      align: { default: "left", values: ["left", "center", "right"] },

      // ─── Spacing ──────────────────────────────────────────────────
      paddingX: { default: "auto", values: ["auto", ...SIZES] },
      paddingY: { default: "auto", values: ["auto", ...SIZES] },
      gutter: { default: "auto", values: ["auto", ...SIZES] },

      // ─── Style ────────────────────────────────────────────────────
      appearance: {
        default: "default",
        values: ["default", "card", "cardElevated", "glassmorphism", "outlined", "minimal"]
      },
      theme: { default: "blue", values: [...COLORS] },
      backgroundType: { default: "none", values: ["color", "image", "custom", "none"] },
      backgroundColor: { default: "blue", values: [...COLORS] },
      backgroundImage: { default: "" },
      backgroundStyle: { default: "style1", values: ["style1", "style2"] },

      // ─── Separator ────────────────────────────────────────────────
      showSeparator: { default: "false", values: ["true", "false"] },
      separatorType: { default: "line", values: ["line", "dot", "wave"] },
      separatorPosition: { default: "afterTitle", values: ["afterTitle", "afterSubtitle"] },
      separatorColor: { default: "blue", values: [...COLORS] },

      // ─── SEO ──────────────────────────────────────────────────────
      titleAs: { default: "div", values: [...TAGS] },
      eyebrowAs: { default: "div", values: [...TAGS] },
    },
    content: "none", // Blob handles its own content
  },
  {
    render: ({ block, editor }) => {
      // Context — lets us update the inspector directly without waiting for
      // the onSelectionChange → setState → re-render cycle.
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { setSelectedBlock, selectedIdRef } = useBlockSelection()

      // Convert BlockNote props to MappedBlobData format
      const props = block.props as Record<string, FormDataValue>

      // buttons is stored as a JSON string in the propSchema — parse it before
      // passing to mapFormDataToBlob which expects an Array.
      const propsForMapper = {
        ...props,
        buttons: (() => {
          try {
            const parsed = JSON.parse((props.buttons as string) || "[]")
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })(),
      }

      // Use the existing mapper from blob-form-mapper
      const mappedData = mapFormDataToBlob(propsForMapper)

      // "content: none" blocks are ProseMirror atoms. On a first click the
      // browser gives focus to the editor but ProseMirror places the cursor
      // around the atom — getSelection() doesn't return the blob yet, so the
      // inspector stays empty until a second click.
      //
      // Fix: in onMouseDown we do two things in the same event:
      //   1. Call setSelectedBlock immediately → inspector renders in the next
      //      React frame, before ProseMirror has even processed the click.
      //   2. Dispatch a NodeSelection → gives BlockNote the selection outline.
      const handleMouseDown = (e: React.MouseEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pmView = (editor as any)._tiptapEditor?.view
        if (!pmView) return

        // Step 1 — update inspector immediately (skip onSelectionChange latency)
        if (selectedIdRef.current !== block.id) {
          setSelectedBlock({
            id: block.id,
            type: "blob",
            props: block.props as Record<string, string | boolean>,
          })
        }

        // Step 2 — force a NodeSelection so BlockNote shows its selection outline
        let nodePos: number | null = null
        pmView.state.doc.descendants((node: { attrs: { id: string } }, pos: number) => {
          if (nodePos !== null) return false
          if (node.attrs.id === block.id) {
            nodePos = pos
            return false
          }
        })
        if (nodePos === null) return

        e.preventDefault()
        const selection = NodeSelection.create(pmView.state.doc, nodePos)
        pmView.dispatch(pmView.state.tr.setSelection(selection))
        pmView.focus()
      }

      // Render using the actual Blob component
      return (
        <div onMouseDown={handleMouseDown}>
          <BlobBlockComponent data={mappedData} />
        </div>
      )
    },
  }
)
