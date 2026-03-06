"use client"

/**
 * BLOB EDITOR
 *
 * Composant principal de l'éditeur de pages.
 * Orchestre tous les sous-composants et gère l'état global.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { BlockNode, PageData } from "@/types/editor"
import type { FormDataValue } from "@/types/editor"
import { BlockTree } from "./BlockTree"
import { BlockInspector } from "./BlockInspector"
import { BlockCanvas } from "./BlockCanvas"
import { SaveBlockPresetDialog } from "./SaveBlockPresetDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Loader2 } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createBlock, insertBlock, deleteBlock, moveBlock, updateBlock, findBlock } from "@/lib/block-utils"
import { useToast } from "@/hooks/use-toast"

export function BlobEditor() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // État de l'éditeur
  const [blocks, setBlocks] = useState<BlockNode[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState<string>("")
  const [pages, setPages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Dialog pour créer une nouvelle page
  const [showNewPageDialog, setShowNewPageDialog] = useState(false)
  const [newPageSlug, setNewPageSlug] = useState("")
  const [newPageTitle, setNewPageTitle] = useState("")

  // Dialog pour sauvegarder un bloc comme preset
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false)
  const [blockToSaveAsPreset, setBlockToSaveAsPreset] = useState<BlockNode | null>(null)

  // Charger la liste des pages au montage
  const loadPagesList = useCallback(async () => {
    try {
      const response = await fetch("/api/pages")
      const data = await response.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error("Erreur lors du chargement des pages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des pages",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    loadPagesList()
  }, [loadPagesList])

  // Charger la page depuis l'URL au montage
  useEffect(() => {
    const pageSlug = searchParams.get("page")
    if (pageSlug) {
      loadPage(pageSlug)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Charger une page
  const loadPage = async (slug: string) => {
    try {
      const response = await fetch(`/api/pages/${slug}`)
      if (!response.ok) {
        throw new Error("Page non trouvée")
      }

      const pageData: PageData = await response.json()
      setBlocks(pageData.blocks)
      setPageTitle(pageData.title)
      setCurrentPage(slug)
      setSelectedBlockId(null)
      setLastSaved(new Date(pageData.meta?.updatedAt || Date.now()))
      router.replace(`?page=${slug}`, { scroll: false })

      toast({
        title: "Page chargée",
        description: `La page "${pageData.title}" a été chargée`,
      })
    } catch (error) {
      console.error("Erreur lors du chargement de la page:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la page",
        variant: "destructive",
      })
    }
  }

  // Sauvegarder la page courante
  const savePage = async () => {
    if (!currentPage) {
      toast({
        title: "Erreur",
        description: "Aucune page sélectionnée",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const pageData: PageData = {
        version: "1.0",
        slug: currentPage,
        title: pageTitle,
        blocks,
      }

      const response = await fetch(`/api/pages/${currentPage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      setLastSaved(new Date())
      toast({
        title: "Sauvegarde réussie",
        description: "La page a été sauvegardée avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la page",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Créer une nouvelle page
  const handleCreatePage = async () => {
    if (!newPageSlug || !newPageTitle) {
      toast({
        title: "Erreur",
        description: "Le slug et le titre sont requis",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newPageSlug, title: newPageTitle }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création")
      }

      await loadPagesList()
      await loadPage(newPageSlug)
      setShowNewPageDialog(false)
      setNewPageSlug("")
      setNewPageTitle("")

      toast({
        title: "Page créée",
        description: `La page "${newPageTitle}" a été créée`,
      })
    } catch (error) {
      console.error("Erreur lors de la création de la page:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la page",
        variant: "destructive",
      })
    }
  }

  // Gestion des blocs
  const handleAddBlock = useCallback(
    (parentId: string | null, blockType: string) => {
      const newBlock = createBlock(blockType)
      setBlocks((prev) => insertBlock(prev, parentId, newBlock))
      setSelectedBlockId(newBlock.id)
    },
    []
  )

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => deleteBlock(prev, blockId))
    setSelectedBlockId(null)
  }, [])

  const handleMoveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    setBlocks((prev) => moveBlock(prev, blockId, direction))
  }, [])

  const handleUpdateBlock = useCallback(
    (blockId: string, data: Partial<Record<string, FormDataValue>>) => {
      setBlocks((prev) =>
        updateBlock(prev, blockId, (block) => {
          block.data = { ...block.data, ...data } as Record<string, FormDataValue>
        })
      )
    },
    []
  )

  const handleSelectBlock = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
  }, [])

  const handleSaveAsPreset = useCallback((blockId: string) => {
    const block = findBlock(blocks, blockId)
    if (block) {
      setBlockToSaveAsPreset(block)
      setShowSavePresetDialog(true)
    }
  }, [blocks])

  // Bloc sélectionné
  const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null
    return findBlock(blocks, selectedBlockId)
  }, [blocks, selectedBlockId])

  // Auto-save indicator
  const saveIndicator = useMemo(() => {
    if (isSaving) return "Enregistrement..."
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      if (seconds < 60) return "Enregistré à l'instant"
      if (seconds < 3600) return `Enregistré il y a ${Math.floor(seconds / 60)}min`
      return `Enregistré à ${lastSaved.toLocaleTimeString()}`
    }
    return "Non enregistré"
  }, [isSaving, lastSaved])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-3 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">Blob Editor</h1>

        <div className="flex-1 flex items-center gap-2">
          <Select value={currentPage || ""} onValueChange={loadPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner une page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page} value={page}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setShowNewPageDialog(true)}>
            Nouvelle page
          </Button>

          {currentPage && (
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Titre de la page"
              className="max-w-xs"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{saveIndicator}</span>
          <Button onClick={savePage} disabled={!currentPage || isSaving} size="sm">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      {currentPage ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Block Tree */}
          <div className="flex-shrink-0">
            <BlockTree
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
              onMoveBlock={handleMoveBlock}
              onSaveAsPreset={handleSaveAsPreset}
            />
          </div>

          {/* Center - Canvas */}
          <div className="flex-1">
            <BlockCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onBlockClick={handleSelectBlock}
            />
          </div>

          {/* Right Sidebar - Inspector */}
          <div className="w-80 flex-shrink-0">
            <BlockInspector block={selectedBlock} onUpdateBlock={handleUpdateBlock} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Sélectionnez ou créez une page pour commencer</p>
            <Button onClick={() => setShowNewPageDialog(true)}>Créer une nouvelle page</Button>
          </div>
        </div>
      )}

      {/* New Page Dialog */}
      <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle page</DialogTitle>
            <DialogDescription>
              Entrez le slug et le titre de la nouvelle page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (identifiant unique)</Label>
              <Input
                id="slug"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="ma-nouvelle-page"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Ma Nouvelle Page"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPageDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePage}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Block Preset Dialog */}
      <SaveBlockPresetDialog
        block={blockToSaveAsPreset}
        open={showSavePresetDialog}
        onOpenChange={setShowSavePresetDialog}
        onSaved={() => {
          toast({
            title: "Succès",
            description: "Le preset a été sauvegardé avec succès",
          })
        }}
      />
    </div>
  )
}
