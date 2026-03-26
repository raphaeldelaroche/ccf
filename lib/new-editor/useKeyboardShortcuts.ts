"use client"

import { useEffect } from "react"

interface UseKeyboardShortcutsOptions {
  onSave: () => void
  onDeleteSelected: () => void
  onUndo: () => void
  onRedo: () => void
  onCopy?: () => void
  onCopyStyle?: () => void
  onPaste?: () => void
  hasSelection: boolean
  hasClipboard?: boolean
}

export function useKeyboardShortcuts({
  onSave,
  onDeleteSelected,
  onUndo,
  onRedo,
  onCopy,
  onCopyStyle,
  onPaste,
  hasSelection,
  hasClipboard,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore si le focus est dans un champ de saisie
      const tag = (e.target as HTMLElement)?.tagName
      const isEditable = (e.target as HTMLElement)?.isContentEditable
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || isEditable) return

      // Cmd+S / Ctrl+S → sauvegarde manuelle
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        onSave()
        return
      }

      // Cmd+Z / Ctrl+Z → undo
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault()
        onUndo()
        return
      }

      // Cmd+Shift+Z / Ctrl+Shift+Z → redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault()
        onRedo()
        return
      }

      // Cmd+C / Ctrl+C → copier le bloc sélectionné
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "c" && hasSelection && onCopy) {
        e.preventDefault()
        onCopy()
        return
      }

      // Cmd+Shift+C / Ctrl+Shift+C → copier le style du bloc sélectionné
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c" && hasSelection && onCopyStyle) {
        e.preventDefault()
        onCopyStyle()
        return
      }

      // Cmd+V / Ctrl+V → coller dans le bloc sélectionné
      if ((e.metaKey || e.ctrlKey) && e.key === "v" && hasSelection && hasClipboard && onPaste) {
        e.preventDefault()
        onPaste()
        return
      }

      // Backspace / Delete → supprime le bloc sélectionné
      if ((e.key === "Backspace" || e.key === "Delete") && hasSelection) {
        e.preventDefault()
        onDeleteSelected()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSave, onDeleteSelected, onUndo, onRedo, onCopy, onCopyStyle, onPaste, hasSelection, hasClipboard])
}
