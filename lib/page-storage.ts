/**
 * PAGE STORAGE
 *
 * Gestion de la persistance des pages dans des fichiers JSON.
 * Utilise le système de fichiers pour stocker les pages dans /data/app/
 */

import fs from "fs/promises"
import path from "path"
import type { PageData } from "@/types/editor"

const DATA_DIR = path.join(process.cwd(), "data", "app")

/**
 * S'assure que le dossier data existe
 */
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

/**
 * Liste toutes les pages disponibles
 * @returns Liste des slugs de pages
 */
export async function listPages(): Promise<string[]> {
  await ensureDataDir()

  try {
    const files = await fs.readdir(DATA_DIR)
    return files
      .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
      .map((file) => file.replace(".json", ""))
  } catch (error) {
    console.error("Erreur lors de la liste des pages:", error)
    return []
  }
}

/**
 * Liste toutes les pages avec leurs métadonnées (slug + title)
 * @returns Liste des pages avec slug et title
 */
export async function listPagesWithMeta(): Promise<Array<{ slug: string; title: string }>> {
  await ensureDataDir()

  try {
    const files = await fs.readdir(DATA_DIR)
    const slugs = files
      .filter((file) => file.endsWith(".json") && file !== ".gitkeep")
      .map((file) => file.replace(".json", ""))

    const pages = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const content = await fs.readFile(path.join(DATA_DIR, `${slug}.json`), "utf-8")
          const data = JSON.parse(content) as { title?: string }
          return { slug, title: data.title ?? slug }
        } catch {
          return { slug, title: slug }
        }
      })
    )

    return pages
  } catch (error) {
    console.error("Erreur lors de la liste des pages:", error)
    return []
  }
}

/**
 * Charge une page depuis un fichier JSON
 * @param slug Le slug de la page
 * @returns Les données de la page ou null si non trouvée
 */
export async function loadPage(slug: string): Promise<PageData | null> {
  await ensureDataDir()

  const filePath = path.join(DATA_DIR, `${slug}.json`)

  try {
    const content = await fs.readFile(filePath, "utf-8")
    const pageData = JSON.parse(content) as PageData
    return pageData
  } catch (error) {
    console.error(`Erreur lors du chargement de la page "${slug}":`, error)
    return null
  }
}

/**
 * Sauvegarde une page dans un fichier JSON
 * @param slug Le slug de la page
 * @param pageData Les données de la page
 */
export async function savePage(slug: string, pageData: PageData): Promise<void> {
  await ensureDataDir()

  const filePath = path.join(DATA_DIR, `${slug}.json`)

  // Mise à jour de updatedAt
  const dataToSave: PageData = {
    ...pageData,
    slug,
    meta: {
      ...pageData.meta,
      updatedAt: new Date().toISOString(),
    },
  }

  try {
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), "utf-8")
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de la page "${slug}":`, error)
    throw error
  }
}

/**
 * Crée une nouvelle page
 * @param slug Le slug de la page
 * @param title Le titre de la page
 * @returns Les données de la nouvelle page
 */
export async function createPage(slug: string, title: string): Promise<PageData> {
  await ensureDataDir()

  const pageData: PageData = {
    version: "1.0",
    slug,
    title,
    blocks: [],
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  await savePage(slug, pageData)
  return pageData
}

/**
 * Supprime une page
 * @param slug Le slug de la page
 */
export async function deletePage(slug: string): Promise<void> {
  await ensureDataDir()

  const filePath = path.join(DATA_DIR, `${slug}.json`)

  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page "${slug}":`, error)
    throw error
  }
}

/**
 * Vérifie si une page existe
 * @param slug Le slug de la page
 */
export async function pageExists(slug: string): Promise<boolean> {
  await ensureDataDir()

  const filePath = path.join(DATA_DIR, `${slug}.json`)

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Renomme une page (change son slug)
 * @param oldSlug L'ancien slug
 * @param newSlug Le nouveau slug
 */
export async function renamePage(oldSlug: string, newSlug: string): Promise<void> {
  await ensureDataDir()

  const oldPath = path.join(DATA_DIR, `${oldSlug}.json`)

  try {
    // Charger les données
    const pageData = await loadPage(oldSlug)
    if (!pageData) {
      throw new Error(`Page "${oldSlug}" non trouvée`)
    }

    // Mettre à jour le slug
    pageData.slug = newSlug

    // Sauvegarder avec le nouveau slug
    await savePage(newSlug, pageData)

    // Supprimer l'ancien fichier
    await fs.unlink(oldPath)
  } catch (error) {
    console.error(`Erreur lors du renommage de la page "${oldSlug}" en "${newSlug}":`, error)
    throw error
  }
}

/**
 * Exporte une page en JSON (pour download)
 * @param slug Le slug de la page
 */
export async function exportPage(slug: string): Promise<string> {
  const pageData = await loadPage(slug)
  if (!pageData) {
    throw new Error(`Page "${slug}" non trouvée`)
  }

  return JSON.stringify(pageData, null, 2)
}

/**
 * Importe une page depuis JSON
 * @param jsonString Le JSON de la page
 * @param slug Le slug de destination (optionnel, sinon utilise le slug du JSON)
 */
export async function importPage(jsonString: string, slug?: string): Promise<PageData> {
  try {
    const pageData = JSON.parse(jsonString) as PageData

    // Utiliser le slug fourni ou celui du JSON
    const targetSlug = slug || pageData.slug

    // Valider la structure minimale
    if (!pageData.version || !pageData.blocks) {
      throw new Error("Structure de page invalide")
    }

    // Sauvegarder
    await savePage(targetSlug, { ...pageData, slug: targetSlug })

    return { ...pageData, slug: targetSlug }
  } catch (error) {
    console.error("Erreur lors de l'import de la page:", error)
    throw error
  }
}
