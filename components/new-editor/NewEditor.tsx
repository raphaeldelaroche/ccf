"use client"

import { useState } from "react"
import { BlockCanvas } from "./BlockCanvas"
import { BlockInspector } from "./BlockInspector"
import { JsonEditor } from "./JsonEditor"
import { NewEditorToolbar } from "./NewEditorToolbar"
import { NewEditorSidebar, EditorView } from "./NewEditorSidebar"
import { useEditorState } from "@/lib/new-editor/useEditorState"
import { useKeyboardShortcuts } from "@/lib/new-editor/useKeyboardShortcuts"
import { useUser } from "@/lib/auth/UserContext"
import { canAccessEditor, canAccessJsonEditor } from "@/lib/auth/permissions"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PreviewProvider } from "./PreviewContext"

interface NewEditorProps {
  initialPage?: string
}

export function NewEditor({ initialPage = "home" }: NewEditorProps) {
  const { user } = useUser()
  const [activeView, setActiveView] = useState<EditorView>("visual")

  // Force visual view for editors (they cannot access JSON)
  const handleViewChange = (view: EditorView) => {
    if (view === 'json' && !canAccessJsonEditor(user.role)) {
      // Silently ignore - button is hidden anyway
      return
    }
    setActiveView(view)
  }

  const {
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    selectedBlock,
    currentPage,
    setCurrentPage,
    availablePages,
    isSaving,
    lastSaved,
    isCreatePageOpen,
    setIsCreatePageOpen,
    newPageName,
    setNewPageName,
    savePage,
    handleCreatePage,
    handleAddBlock,
    handleDeleteBlock,
    handleDuplicateBlock,
    handleMoveBlock,
    handleUpdateBlock,
    handleCopyBlock,
    handlePasteBlock,
    handleInsertFromClipboard,
    handleRefreshBlock,
    hasClipboard,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleSetBlocks,
    previewBreakpoint,
    setPreviewBreakpoint,
  } = useEditorState(initialPage)

  useKeyboardShortcuts({
    onSave: savePage,
    onDeleteSelected: () => selectedBlockId && handleDeleteBlock(selectedBlockId),
    onUndo: handleUndo,
    onRedo: handleRedo,
    hasSelection: !!selectedBlockId,
  })

  // Check if user has permission to access the editor (after all hooks)
  if (!canAccessEditor(user.role)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n&apos;avez pas la permission d&apos;accéder à l&apos;éditeur visuel.
            Seuls les rôles Engineer et Editor peuvent modifier les pages.
          </p>
          <Button asChild>
            <Link href="/">Retour à la page d&apos;accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <NewEditorToolbar
        currentPage={currentPage}
        availablePages={availablePages}
        onPageChange={setCurrentPage}
        isCreatePageOpen={isCreatePageOpen}
        setIsCreatePageOpen={setIsCreatePageOpen}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        onCreatePage={handleCreatePage}
        onAddBlock={(blockType) => handleAddBlock(blockType)}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={savePage}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        previewBreakpoint={previewBreakpoint}
        onPreviewBreakpointChange={setPreviewBreakpoint}
      />

      <div className="flex h-[calc(100vh-3.5rem)] mt-14">

        <NewEditorSidebar activeView={activeView} onViewChange={handleViewChange} currentPage={currentPage} />

        {activeView === "visual" ? (
          <PreviewProvider value={{ isPreviewMode: previewBreakpoint !== 'auto' }}>
            {/* Canvas (center) */}
            <div className="flex-1 pl-11 overflow-y-auto">
              <BlockCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onMoveBlock={handleMoveBlock}
                onAddBlockBelow={(afterId, blockType) => handleAddBlock(blockType, afterId)}
                onAddBlockBelowChild={(parentId, position, blockType) =>
                  handleAddBlock(blockType, undefined, parentId, position)
                }
                onDuplicateBlock={handleDuplicateBlock}
                onDeleteBlock={handleDeleteBlock}
                onCopyBlock={handleCopyBlock}
                onPasteBlock={handlePasteBlock}
                onRefreshBlock={handleRefreshBlock}
                onInsertFromClipboard={handleInsertFromClipboard}
                hasClipboard={hasClipboard}
                previewBreakpoint={previewBreakpoint}
              />
            </div>

            {/* Inspector (right) */}
            <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border">
              <BlockInspector
                selectedBlock={selectedBlock}
                onUpdateBlock={handleUpdateBlock}
              />
            </div>
          </PreviewProvider>
        ) : (
          /* JSON Editor (full width) */
          <div className="flex-1 pl-11 overflow-hidden flex flex-col">
            <JsonEditor
              blocks={blocks}
              onSetBlocks={handleSetBlocks}
              onSave={savePage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
