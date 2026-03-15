"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BlockPickerPopover } from "./BlockPickerPopover"
import type { BlockType } from "@/lib/new-editor/block-types"
import { useState } from "react"

interface ActionsMenuPopoverProps {
  onAddBlock: (blockType: BlockType) => void
  canCreatePage: boolean
  isCreatePageOpen: boolean
  setIsCreatePageOpen: (open: boolean) => void
  newPageName: string
  setNewPageName: (name: string) => void
  onCreatePage: () => void
}

export function ActionsMenuPopover({
  onAddBlock,
  canCreatePage,
  isCreatePageOpen,
  setIsCreatePageOpen,
  newPageName,
  setNewPageName,
  onCreatePage,
}: ActionsMenuPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-1">
            {canCreatePage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false)
                    setIsCreatePageOpen(true)
                  }}
                >
                  Nouvelle page
                </Button>
                <Separator className="my-1" />
              </>
            )}

            <BlockPickerPopover onSelect={(blockType) => {
              onAddBlock(blockType)
              setIsOpen(false)
            }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                Ajouter un bloc
              </Button>
            </BlockPickerPopover>
          </div>
        </PopoverContent>
      </Popover>

      {/* Dialog for creating new page */}
      <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
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
    </>
  )
}
