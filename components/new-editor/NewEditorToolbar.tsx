"use client"

import { Save, Undo2, Redo2, Grid, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BlockType } from "@/lib/new-editor/block-types"
import Link from "next/link"
import { useUser } from "@/lib/auth/UserContext"
import { canCreatePage, canEditPage, canSaveChanges, canAccessResponsivePreview } from "@/lib/auth/permissions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge } from "@/components/auth/RoleBadge"
import { BreakpointPreviewSelector } from "./BreakpointPreviewSelector"
import { ActionsMenuPopover } from "./ActionsMenuPopover"

interface NewEditorToolbarProps {
  currentPage: string
  availablePages: string[]
  onPageChange: (page: string) => void
  isCreatePageOpen: boolean
  setIsCreatePageOpen: (open: boolean) => void
  newPageName: string
  setNewPageName: (name: string) => void
  onCreatePage: () => void
  onAddBlock: (blockType: BlockType) => void
  isSaving: boolean
  lastSaved: Date | null
  onSave: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  previewBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'
  onPreviewBreakpointChange: (breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto') => void
  onToggleInspector: () => void
  isInspectorCollapsed: boolean
}

export function NewEditorToolbar({
  currentPage,
  availablePages,
  onPageChange,
  isCreatePageOpen,
  setIsCreatePageOpen,
  newPageName,
  setNewPageName,
  onCreatePage,
  onAddBlock,
  isSaving,
  lastSaved,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  previewBreakpoint,
  onPreviewBreakpointChange,
  onToggleInspector,
  isInspectorCollapsed,
}: NewEditorToolbarProps) {
  const { user } = useUser()
  const userCanCreatePage = canCreatePage(user.role)
  const userCanEdit = canEditPage(user.role)
  const userCanSave = canSaveChanges(user.role)
  const userCanAccessPreview = canAccessResponsivePreview(user.role)

  return (
    <div className="fixed top-0 left-0 right-0 h-14 border-b border-border bg-background z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">

        <div className="flex items-center gap-2">
          <Link href="/">
            <Grid className="h-5 w-5 mr-2 text-primary" />
          </Link>
          <div className="font-bold">xView</div>
        </div>

        {/* Sélecteur de page */}
        <Select value={currentPage} onValueChange={onPageChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner une page" />
          </SelectTrigger>
          <SelectContent>
            {availablePages.map((page) => (
              <SelectItem key={page} value={page}>
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Menu actions (Nouvelle page + Ajouter bloc) */}
        {userCanEdit && (
          <ActionsMenuPopover
            onAddBlock={onAddBlock}
            canCreatePage={userCanCreatePage}
            isCreatePageOpen={isCreatePageOpen}
            setIsCreatePageOpen={setIsCreatePageOpen}
            newPageName={newPageName}
            setNewPageName={setNewPageName}
            onCreatePage={onCreatePage}
          />
        )}

        {/* Undo / Redo */}
        {userCanEdit && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} title="Annuler (⌘Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} title="Rétablir (⌘⇧Z)">
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Séparateur vertical */}
        {userCanAccessPreview && <div className="h-6 w-px bg-border" />}

        {/* Sélecteur de breakpoint - Engineers only */}
        {userCanAccessPreview && (
          <BreakpointPreviewSelector
            value={previewBreakpoint}
            onChange={onPreviewBreakpointChange}
          />
        )}
      </div>

      {/* Sauvegarde */}
      <div className="flex items-center gap-2">
        {/* Toggle Inspector */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleInspector}
                className="h-8 w-8"
              >
                {isInspectorCollapsed ? (
                  <PanelRightOpen className="h-4 w-4" />
                ) : (
                  <PanelRightClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isInspectorCollapsed ? "Afficher l'inspecteur" : "Masquer l'inspecteur"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <RoleBadge />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={onSave}
                  disabled={isSaving || !userCanSave}
                  variant="default"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {!userCanSave ? (
                <p>Vous n&apos;avez pas la permission de sauvegarder</p>
              ) : lastSaved ? (
                <p>Dernière sauvegarde : {lastSaved.toLocaleTimeString()}</p>
              ) : (
                <p>Sauvegarder les modifications (⌘S)</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
