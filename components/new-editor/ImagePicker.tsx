"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Loader2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface MediaFile {
  name: string
  path: string
}

interface MediaStructure {
  folders: Record<string, MediaFile[]>
}

interface ImagePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

const FOLDER_LABELS: Record<string, string> = {
  root: "Racine",
  logos: "Logos",
  "partners-logo": "Logos Partenaires",
  "founders-logo": "Logos Fondateurs",
}

export function ImagePicker({ value, onChange, label = "Image" }: ImagePickerProps) {
  // Mode: "search" for browsing, "selected" for editing selected image
  const [mode, setMode] = useState<"search" | "selected">(
    value ? "selected" : "search"
  )

  // Media files state
  const [mediaStructure, setMediaStructure] = useState<MediaStructure | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("root")

  // Load media files
  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/media/list")
        if (!response.ok) throw new Error("Erreur lors du chargement des images")
        const data = await response.json()
        setMediaStructure(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    if (mode === "search") {
      loadMedia()
    }
  }, [mode])

  // Filtered images based on search query
  const filteredImages = React.useMemo(() => {
    if (!mediaStructure) return []
    const folderImages = mediaStructure.folders[selectedFolder] || []
    if (!searchQuery.trim()) return folderImages

    const query = searchQuery.toLowerCase()
    return folderImages.filter((img) =>
      img.name.toLowerCase().includes(query)
    )
  }, [mediaStructure, selectedFolder, searchQuery])

  // Handle image selection
  const handleSelectImage = (imagePath: string) => {
    onChange(imagePath)
    setMode("selected")
    setSearchQuery("")
  }

  // Remove selected image
  const handleRemoveImage = () => {
    onChange(null)
    setMode("search")
    setSearchQuery("")
  }

  // Change image (back to search mode)
  const handleChangeImage = () => {
    setMode("search")
    setSearchQuery("")
  }

  // SELECTED MODE: Show selected image with preview
  if (mode === "selected" && value) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-[11px] uppercase font-semibold tracking-wide">{label}</Label>}

        <div className="border rounded-md p-3 space-y-3">
          {/* Preview */}
          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
            <Image
              src={value}
              alt="Selected image"
              fill
              className="object-contain"
            />
          </div>

          {/* Path */}
          <div className="text-xs text-muted-foreground font-mono truncate">
            {value}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChangeImage}
              className="flex-1"
            >
              Changer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // SEARCH MODE: Browse and select images
  return (
    <div className="space-y-2">
      {label && <Label className="text-[11px] uppercase font-semibold tracking-wide">{label}</Label>}

      <div className="border rounded-md p-3 space-y-3">
        {/* Folder selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dossier</Label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mediaStructure &&
                Object.keys(mediaStructure.folders).map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {FOLDER_LABELS[folder] || folder}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-sm text-destructive py-4 text-center">
            {error}
          </div>
        )}

        {/* Images grid */}
        {!loading && !error && filteredImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filteredImages.map((img) => (
              <button
                key={img.path}
                type="button"
                onClick={() => handleSelectImage(img.path)}
                className="group relative aspect-square border rounded-md overflow-hidden hover:border-primary hover:shadow-sm transition-all bg-muted"
              >
                <Image
                  src={img.path}
                  alt={img.name}
                  fill
                  className="object-contain p-1"
                />
                <div className="absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm px-1 py-0.5 text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Aucune image trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
