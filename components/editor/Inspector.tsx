"use client"

import { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BlobInspector } from "./BlobInspector"
import { SectionInspector } from "./SectionInspector"
import { useBlockSelection } from "./block-selection-context"
import { autocorrectProps } from "@/lib/blob-compatibility"

interface InspectorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any
}

export function Inspector({ editor }: InspectorProps) {
  // State + refs live in the shared context so blob-block.tsx can update
  // the inspector directly in onMouseDown, without waiting for onSelectionChange.
  const { selectedBlock, setSelectedBlock, propsRef, selectedIdRef } = useBlockSelection()

  useEffect(() => {
    // onSelectionChange remains the fallback for:
    //   • keyboard navigation (Tab, arrow keys)
    //   • inline-content blocks (paragraph, heading, …)
    //   • any block that doesn't call setSelectedBlock itself
    // selectedIdRef lets us compare without capturing stale state in the closure.
    const unsubscribe = editor.onSelectionChange(() => {
      try {
        // getSelection() catches blocks with content: "none" (e.g. blob)
        const selection = editor.getSelection()
        if (selection?.blocks?.length > 0) {
          const block = selection.blocks[0]
          if (selectedIdRef.current !== block.id) {
            setSelectedBlock({ id: block.id, type: block.type, props: block.props })
          }
          return
        }

        // Fallback: getTextCursorPosition for inline-content blocks
        const cursorBlock = editor.getTextCursorPosition()?.block
        if (cursorBlock) {
          if (selectedIdRef.current !== cursorBlock.id) {
            setSelectedBlock({ id: cursorBlock.id, type: cursorBlock.type, props: cursorBlock.props })
          }
        } else {
          setSelectedBlock(null)
        }
      } catch (error) {
        console.error("Error getting selected block:", error)
        setSelectedBlock(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [editor, setSelectedBlock, selectedIdRef])

  // Props that must trigger a React re-render when changed.
  // Two categories — all are select/checkbox fields, never free-text inputs,
  // so the keystroke optimisation is not impacted:
  //   1. Structural: affect compatibility state (disabled options, etc.)
  //   2. Gating: control conditional rendering of other fields in BlobInspector
  //      (e.g. figureType "image" shows the image URL field)
  const RERENDER_PROPS = [
    // structural
    "layout", "direction", "markerPosition", "actions",
    // gating
    "figureType", "markerType", "contentType", "backgroundType",
  ]

  const handleUpdateProp = (propName: string, value: string | boolean) => {
    if (!selectedBlock) return

    const updatedProps: Record<string, unknown> = { ...propsRef.current, [propName]: value }

    // After any prop change, revalidate all constrained props against the
    // compatibility matrix. If a value is now invalid, correct it silently.
    const patch = autocorrectProps(updatedProps)
    if (Object.keys(patch).length > 0) {
      Object.assign(updatedProps, patch)
    }

    // Trigger a re-render when:
    //   • there are autocorrected props (inspector fields need to reflect corrections)
    //   • the new value is a string boolean ("true"/"false") — these gate conditional
    //     field visibility in BlobInspector (showContent, showSeparator, …).
    //   • the changed prop is structural (affects compatibility state of other fields).
    //     Text inputs never produce these values, so the keystroke optimisation is preserved.
    const isStringBoolean = value === "true" || value === "false"
    const triggersRerender = RERENDER_PROPS.includes(propName)
    if (Object.keys(patch).length > 0 || isStringBoolean || triggersRerender) {
      setSelectedBlock({ ...selectedBlock, props: updatedProps as Record<string, string | boolean> })
    }

    // Update the ref immediately — no React re-render for normal prop changes
    propsRef.current = updatedProps as Record<string, string | boolean>

    // Push the change to the editor (preview updates)
    editor.updateBlock(selectedBlock.id, {
      type: selectedBlock.type,
      props: propsRef.current,
    })
  }

  return (
    <div className="w-80 h-full border-l">
      <div className="border-b bg-background px-4 py-3">
        <h2 className="font-semibold">Inspector</h2>
        {selectedBlock && (
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedBlock.type === "blob" ? "Blob Block" : selectedBlock.type === "section" ? "Section Block" : selectedBlock.type}
          </p>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-122px)]">
        <div className="">
          {selectedBlock ? (
            selectedBlock.type === "blob" ? (
              <BlobInspector
                block={selectedBlock}
                onUpdateProp={handleUpdateProp}
              />
            ) : selectedBlock.type === "section" ? (
              <SectionInspector
                block={selectedBlock}
                onUpdateProp={handleUpdateProp}
              />
            ) : (
              <div className="rounded-lg border bg-background p-3">
                <p className="text-sm text-muted-foreground">
                  Block type: {selectedBlock.type}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Inspector not available for this block type
                </p>
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground p-4">No block selected</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
