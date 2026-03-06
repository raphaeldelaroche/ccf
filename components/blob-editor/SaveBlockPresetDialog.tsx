"use client"

/**
 * SAVE BLOCK PRESET DIALOG
 *
 * Dialog pour sauvegarder un bloc comme preset réutilisable
 */

import React, { useState } from "react"
import type { BlockNode } from "@/types/editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface SaveBlockPresetDialogProps {
  block: BlockNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function SaveBlockPresetDialog({
  block,
  open,
  onOpenChange,
  onSaved,
}: SaveBlockPresetDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [useCase, setUseCase] = useState("")
  const [tags, setTags] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Générer le slug automatiquement à partir du nom
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const handleSave = async () => {
    if (!block || !name || !slug) {
      toast({
        title: "Erreur",
        description: "Le nom est requis",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/block-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block,
          name,
          slug,
          description: description || undefined,
          useCase: useCase || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      toast({
        title: "Preset sauvegardé",
        description: `Le bloc "${name}" a été sauvegardé comme preset`,
      })

      // Reset form
      setName("")
      setDescription("")
      setUseCase("")
      setTags("")
      onOpenChange(false)
      onSaved?.()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du preset:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le preset",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enregistrer comme preset</DialogTitle>
          <DialogDescription>
            Sauvegardez ce bloc comme preset réutilisable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="preset-name">
              Nom du preset <span className="text-red-500">*</span>
            </Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hero avec image"
            />
            {slug && (
              <p className="text-xs text-gray-500">
                Slug : <code className="bg-gray-100 px-1 rounded">{slug}</code>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="preset-description">Description</Label>
            <Textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Section hero avec titre, sous-titre et image"
              rows={3}
            />
          </div>

          {/* Use Case */}
          <div className="space-y-2">
            <Label htmlFor="preset-usecase">Pour quoi est-il fait ?</Label>
            <Input
              id="preset-usecase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Landing page hero, About section, etc."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="preset-tags">Tags (séparés par virgules)</Label>
            <Input
              id="preset-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="hero, marketing, landing"
            />
          </div>

          {/* Block Type Info */}
          {block && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600">
                Type de bloc : <strong>{block.blockType}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!name || isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
