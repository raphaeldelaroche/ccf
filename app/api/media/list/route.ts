/**
 * API Route pour lister les fichiers media dans /public
 * GET /api/media/list - Retourne la structure des dossiers et fichiers
 */

import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface MediaFile {
  name: string
  path: string
}

interface MediaStructure {
  folders: Record<string, MediaFile[]>
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".svg", ".gif", ".webp"]

async function scanDirectory(dirPath: string, publicPath: string): Promise<MediaFile[]> {
  const files: MediaFile[] = []

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (IMAGE_EXTENSIONS.includes(ext)) {
          const fullPath = path.join(dirPath, entry.name)
          const relativePath = fullPath.replace(publicPath, "").replace(/\\/g, "/")
          files.push({
            name: entry.name,
            path: relativePath,
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error)
  }

  return files
}

export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), "public")
    const structure: MediaStructure = { folders: {} }

    // Scan racine
    structure.folders.root = await scanDirectory(publicPath, publicPath)

    // Scan sous-dossiers connus
    const knownFolders = [
      "logos",
      "partners-logo",
      "founders-logo",
      "fonts",
    ]

    for (const folder of knownFolders) {
      const folderPath = path.join(publicPath, folder)
      try {
        await fs.access(folderPath)
        structure.folders[folder] = await scanDirectory(folderPath, publicPath)
      } catch {
        // Dossier n'existe pas, on ignore
      }
    }

    // Scanner récursivement tous les dossiers dans /public
    const entries = await fs.readdir(publicPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !knownFolders.includes(entry.name)) {
        const folderPath = path.join(publicPath, entry.name)
        structure.folders[entry.name] = await scanDirectory(folderPath, publicPath)
      }
    }

    return NextResponse.json(structure)
  } catch (error) {
    console.error("Error listing media files:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers media" },
      { status: 500 }
    )
  }
}
