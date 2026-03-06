/**
 * PAGE STORAGE
 *
 * Gestion de la persistance des pages avec Redis (Vercel Upstash Redis).
 * Fonctionne en local (avec env vars) comme en production (Vercel).
 */

import { kv } from "./kv-client"
import type { PageData } from "@/types/editor"

export async function listPages(): Promise<string[]> {
  try {
    const keys = await kv.keys("page:*")
    return keys.map((key) => key.replace("page:", ""))
  } catch (error) {
    console.error("Erreur lors de la liste des pages:", error)
    return []
  }
}

export async function listPagesWithMeta(): Promise<Array<{ slug: string; title: string }>> {
  try {
    const keys = await kv.keys("page:*")
    if (keys.length === 0) return []

    const pages = await kv.mget(...keys)
    
    return pages.map((pageStr, index) => {
      const slug = keys[index].replace("page:", "")
      if (!pageStr) return { slug, title: slug }
      
      try {
        const page = JSON.parse(pageStr) as PageData
        return { slug, title: page?.title ?? slug }
      } catch {
        return { slug, title: slug }
      }
    })
  } catch (error) {
    console.error("Erreur lors de la liste des pages avec meta:", error)
    return []
  }
}

export async function loadPage(slug: string): Promise<PageData | null> {
  try {
    const pageStr = await kv.get(`page:${slug}`)
    if (!pageStr) return null;
    return JSON.parse(pageStr) as PageData
  } catch (error) {
    console.error(`Erreur lors du chargement de la page "${slug}":`, error)
    return null
  }
}

export async function savePage(slug: string, pageData: PageData): Promise<void> {
  const dataToSave: PageData = {
    ...pageData,
    slug,
    meta: {
      ...pageData.meta,
      updatedAt: new Date().toISOString(),
    },
  }

  try {
    await kv.set(`page:${slug}`, JSON.stringify(dataToSave))
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de la page "${slug}":`, error)
    throw error
  }
}

export async function createPage(slug: string, title: string): Promise<PageData> {
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

export async function deletePage(slug: string): Promise<void> {
  try {
    await kv.del(`page:${slug}`)
  } catch (error) {
    console.error(`Erreur lors de la suppression de la page "${slug}":`, error)
    throw error
  }
}

export async function pageExists(slug: string): Promise<boolean> {
  try {
    const exists = await kv.exists(`page:${slug}`)
    return exists === 1
  } catch {
    return false
  }
}

export async function renamePage(oldSlug: string, newSlug: string): Promise<void> {
  try {
    const pageData = await loadPage(oldSlug)
    if (!pageData) {
      throw new Error(`Page "${oldSlug}" non trouvée`)
    }

    pageData.slug = newSlug
    await savePage(newSlug, pageData)
    await kv.del(`page:${oldSlug}`)
  } catch (error) {
    console.error(`Erreur lors du renommage de la page "${oldSlug}" en "${newSlug}":`, error)
    throw error
  }
}

export async function exportPage(slug: string): Promise<string> {
  const pageData = await loadPage(slug)
  if (!pageData) {
    throw new Error(`Page "${slug}" non trouvée`)
  }

  return JSON.stringify(pageData, null, 2)
}

export async function importPage(jsonString: string, slug?: string): Promise<PageData> {
  try {
    const pageData = JSON.parse(jsonString) as PageData
    const targetSlug = slug || pageData.slug

    if (!pageData.version || !pageData.blocks) {
      throw new Error("Structure de page invalide")
    }

    const dataToSave = { ...pageData, slug: targetSlug }
    await savePage(targetSlug, dataToSave)

    return dataToSave
  } catch (error) {
    console.error("Erreur lors de l'import de la page:", error)
    throw error
  }
}
