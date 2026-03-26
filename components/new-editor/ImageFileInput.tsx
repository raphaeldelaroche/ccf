"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, FolderOpen } from "lucide-react"

interface ImageFileInputProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

export function ImageFileInput({ value, onChange, label }: ImageFileInputProps) {
  const [fileName, setFileName] = useState<string | null>(
    value ? value.split('/').pop() || null : null
  )
  const [subFolder, setSubFolder] = useState<string>(
    value ? value.replace(/^\//, '').split('/').slice(0, -1).join('/') : ''
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Extraire le nom du fichier
      const name = file.name
      setFileName(name)

      // Générer le chemin avec sous-dossier si spécifié
      const path = subFolder ? `/${subFolder}/${name}` : `/${name}`
      onChange(path)
    }
  }

  const handleSubFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const folder = e.target.value.replace(/^\//, '').replace(/\/$/, '') // Nettoyer les slashes
    setSubFolder(folder)

    // Mettre à jour le chemin si un fichier est déjà sélectionné
    if (fileName) {
      const path = folder ? `/${folder}/${fileName}` : `/${fileName}`
      onChange(path)
    }
  }

  const handleClear = () => {
    setFileName(null)
    setSubFolder('')
    onChange(null)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {!value ? (
        <div className="space-y-2">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Sous-dossier (ex: logos/partners)"
                value={subFolder}
                onChange={handleSubFolderChange}
                className="h-8 text-sm flex-1"
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="h-8 text-sm cursor-pointer file:mr-2 file:h-6 file:px-2 file:border-0 file:bg-muted file:text-sm file:font-medium"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
            <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{value}</p>
              <p className="text-xs text-muted-foreground">
                Placez <code className="px-1 py-0.5 bg-background rounded">{fileName}</code> dans{' '}
                <code className="px-1 py-0.5 bg-background rounded">
                  /public{subFolder ? `/${subFolder}` : ''}
                </code>
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Sous-dossier (ex: logos/partners)"
                value={subFolder}
                onChange={handleSubFolderChange}
                className="h-8 text-sm flex-1"
              />
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="h-8 text-sm cursor-pointer file:mr-2 file:h-6 file:px-2 file:border-0 file:bg-muted file:text-sm file:font-medium"
            />
          </div>
        </div>
      )}
    </div>
  )
}
