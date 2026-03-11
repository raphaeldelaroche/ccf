"use client"

import { useState, useEffect, useCallback } from "react"
import { BlockNode } from "@/lib/new-editor/block-types"
import { Button } from "@/components/ui/button"
import { CheckCheck, AlertCircle } from "lucide-react"

interface JsonEditorProps {
  blocks: BlockNode[]
  onSetBlocks: (blocks: BlockNode[]) => void
  onSave: () => void
}

export function JsonEditor({ blocks, onSetBlocks, onSave }: JsonEditorProps) {
  const [localJson, setLocalJson] = useState(() => JSON.stringify(blocks, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Sync when blocks change externally (e.g. undo/redo from toolbar)
  useEffect(() => {
    const canonical = JSON.stringify(blocks, null, 2)
    if (!isDirty) {
      setLocalJson(canonical)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  const handleChange = (value: string) => {
    setLocalJson(value)
    setIsDirty(true)
    setParseError(null)
  }

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(localJson)
      if (!Array.isArray(parsed)) {
        setParseError("La valeur racine doit être un tableau de blocs.")
        return
      }
      onSetBlocks(parsed as BlockNode[])
      setIsDirty(false)
      setParseError(null)
      onSave()
    } catch (e) {
      setParseError((e as SyntaxError).message)
    }
  }, [localJson, onSetBlocks, onSave])

  // ⌘S / Ctrl+S applies + saves
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleApply()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleApply])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 flex-shrink-0">
        <span className="text-xs text-muted-foreground font-mono">
          {blocks.length} bloc{blocks.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          {parseError && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              {parseError}
            </span>
          )}
          <Button
            size="sm"
            variant={isDirty ? "default" : "secondary"}
            onClick={handleApply}
            className="h-7 text-xs gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Appliquer
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <textarea
        className="flex-1 w-full resize-none font-mono text-sm p-4 bg-background text-foreground outline-none leading-relaxed"
        value={localJson}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  )
}
