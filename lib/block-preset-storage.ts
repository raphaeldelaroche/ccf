/**
 * BLOCK PRESET STORAGE
 *
 * Gestion de la persistance des presets de blocs dans des fichiers JSON.
 */

import fs from "fs/promises"
import path from "path"
import type { BlockPreset, BlockPresetListItem } from "@/types/block-preset"
import type { BlockNode } from "@/types/editor"

const PRESETS_DIR = path.join(process.cwd(), "data", "blocks")

/**
 * S'assure que le dossier presets existe
 */
async function ensurePresetsDir() {
  try {
    await fs.access(PRESETS_DIR)
  } catch {
    await fs.mkdir(PRESETS_DIR, { recursive: true })
  }
}

/**
 * Liste tous les presets disponibles
 */
export async function listBlockPresets(): Promise<BlockPresetListItem[]> {
  await ensurePresetsDir()

  try {
    const files = await fs.readdir(PRESETS_DIR)
    const presets: BlockPresetListItem[] = []

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(PRESETS_DIR, file), "utf-8")
        const preset: BlockPreset = JSON.parse(content)
        presets.push({
          slug: preset.slug,
          name: preset.name,
          description: preset.description,
          blockType: preset.blockType,
          tags: preset.tags,
          useCase: preset.useCase,
        })
      }
    }

    return presets
  } catch (error) {
    console.error("Erreur lors de la liste des presets:", error)
    return []
  }
}

/**
 * Charge un preset par son slug
 */
export async function loadBlockPreset(slug: string): Promise<BlockPreset | null> {
  await ensurePresetsDir()

  const filePath = path.join(PRESETS_DIR, `${slug}.json`)

  try {
    const content = await fs.readFile(filePath, "utf-8")
    return JSON.parse(content) as BlockPreset
  } catch (error) {
    console.error(`Erreur lors du chargement du preset "${slug}":`, error)
    return null
  }
}

/**
 * Sauvegarde un preset
 */
export async function saveBlockPreset(preset: BlockPreset): Promise<void> {
  await ensurePresetsDir()

  const filePath = path.join(PRESETS_DIR, `${preset.slug}.json`)

  const dataToSave: BlockPreset = {
    ...preset,
    meta: {
      ...preset.meta,
      updatedAt: new Date().toISOString(),
    },
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), "utf-8")
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du preset "${preset.slug}":`, error)
    throw error
  }
}

/**
 * Crée un preset à partir d'un bloc
 */
export async function createBlockPreset(
  block: BlockNode,
  name: string,
  slug: string,
  description?: string,
  useCase?: string,
  tags?: string[]
): Promise<BlockPreset> {
  await ensurePresetsDir()

  // Créer le template en retirant l'ID
  const { ...template } = block

  const preset: BlockPreset = {
    slug,
    name,
    description,
    useCase,
    tags,
    blockType: block.blockType,
    template,
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  await saveBlockPreset(preset)
  return preset
}

/**
 * Supprime un preset
 */
export async function deleteBlockPreset(slug: string): Promise<void> {
  await ensurePresetsDir()

  const filePath = path.join(PRESETS_DIR, `${slug}.json`)

  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error(`Erreur lors de la suppression du preset "${slug}":`, error)
    throw error
  }
}

/**
 * Vérifie si un preset existe
 */
export async function presetExists(slug: string): Promise<boolean> {
  await ensurePresetsDir()

  const filePath = path.join(PRESETS_DIR, `${slug}.json`)

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Instancie un bloc à partir d'un preset (génère un nouvel ID)
 */
export function instantiateBlockFromPreset(preset: BlockPreset): BlockNode {
  return {
    id: crypto.randomUUID(),
    ...preset.template,
  }
}
