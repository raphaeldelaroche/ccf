"use client"

import { useState } from "react"
import { BlockCanvas } from "./BlockCanvas"
import { BlockInspector } from "./BlockInspector"
import { JsonEditor } from "./JsonEditor"
import { NewEditorToolbar } from "./NewEditorToolbar"
import { NewEditorSidebar, EditorView } from "./NewEditorSidebar"
import { useEditorState } from "@/lib/new-editor/useEditorState"
import { useKeyboardShortcuts } from "@/lib/new-editor/useKeyboardShortcuts"

interface NewEditorProps {
  initialPage?: string
}

export function NewEditor({ initialPage = "home" }: NewEditorProps) {
  const [activeView, setActiveView] = useState<EditorView>("visual")

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
    hasClipboard,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleSetBlocks,
  } = useEditorState(initialPage)

  useKeyboardShortcuts({
    onSave: savePage,
    onDeleteSelected: () => selectedBlockId && handleDeleteBlock(selectedBlockId),
    onUndo: handleUndo,
    onRedo: handleRedo,
    hasSelection: !!selectedBlockId,
  })

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
      />

      <div className="flex h-[calc(100vh-3.5rem)] mt-14">

        <NewEditorSidebar activeView={activeView} onViewChange={setActiveView} currentPage={currentPage} />

        {activeView === "visual" ? (
          <>
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
                onInsertFromClipboard={handleInsertFromClipboard}
                hasClipboard={hasClipboard}
              />
            </div>

            {/* Inspector (right) */}
            <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-border">
              <BlockInspector
                selectedBlock={selectedBlock}
                onUpdateBlock={handleUpdateBlock}
              />
            </div>
          </>
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
