"use client"

import { Plus, Save, FileText, Undo2, Redo2, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BlockPickerPopover } from "./BlockPickerPopover"
import type { BlockType } from "@/lib/new-editor/block-types"
import Link from "next/link"
import { useUser } from "@/lib/auth/UserContext"
import { canCreatePage, canEditPage, canSaveChanges, canAccessResponsivePreview } from "@/lib/auth/permissions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleBadge } from "@/components/auth/RoleBadge"
import { BreakpointPreviewSelector } from "./BreakpointPreviewSelector"

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
}: NewEditorToolbarProps) {
  const { user } = useUser()
  const userCanCreatePage = canCreatePage(user.role)
  const userCanEdit = canEditPage(user.role)
  const userCanSave = canSaveChanges(user.role)
  const userCanAccessPreview = canAccessResponsivePreview(user.role)

  return (
    <div className="fixed top-0 left-0 right-0 h-14 border-b border-border bg-background z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2">
          <Link href="/">
            <Grid className="h-5 w-5 mr-2 text-primary" />
          </Link>
          <div className="font-bold">xView</div>
        </div>

        {/* Sélecteur de page + création */}
        <div className="flex gap-2">
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

          {userCanCreatePage && (
            <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Nouvelle page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle page</DialogTitle>
                  <DialogDescription>
                    Entrez le nom de la nouvelle page. Les espaces seront remplacés par des tirets.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageName">Nom de la page</Label>
                    <Input
                      id="pageName"
                      placeholder="ma-nouvelle-page"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onCreatePage()
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatePageOpen(false)
                      setNewPageName("")
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={onCreatePage} disabled={!newPageName.trim()}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Ajout de blocs */}
        {userCanEdit && (
          <div className="flex gap-2">
            <BlockPickerPopover onSelect={onAddBlock}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un bloc
              </Button>
            </BlockPickerPopover>
          </div>
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
      <div className="flex items-center gap-4">
        <RoleBadge />
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Sauvegardé {lastSaved.toLocaleTimeString()}
          </span>
        )}
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
            {!userCanSave && (
              <TooltipContent>
                <p>Vous n&apos;avez pas la permission de sauvegarder</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
