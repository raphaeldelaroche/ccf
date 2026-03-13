/**
 * API Routes pour une page spécifique
 * GET /api/pages/[slug] - Charge une page
 * PUT /api/pages/[slug] - Sauvegarde une page
 * DELETE /api/pages/[slug] - Supprime une page
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { loadPage, savePage, deletePage } from "@/lib/page-storage"
import { PageSchema } from "@/lib/schemas/page"
import type { PageData } from "@/types/editor"
import { requireEditPage, requireDeletePage, requireSaveChanges } from "@/lib/auth/api-auth"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const pageData = await loadPage(slug)

    if (!pageData) {
      return NextResponse.json({ error: "Page non trouvée" }, { status: 404 })
    }

    return NextResponse.json(pageData)
  } catch {
    return NextResponse.json({ error: "Erreur lors du chargement de la page" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Check permissions
  const authCheck = requireSaveChanges(request)
  if (!authCheck.authorized) {
    return authCheck.error
  }

  try {
    const { slug } = await params
    const body = await request.json()

    // 1. Charger la page existante (ou initialiser pour un upsert)
    const existing = await loadPage(slug)

    // 2. Fusionner : le body peut être partiel (ex: seulement { blocks })
    const merged: PageData = {
      version: "1.0",
      blocks: [],
      ...(existing ?? {}),
      ...body,
      slug, // toujours utiliser le slug de l'URL
      meta: {
        createdAt: new Date().toISOString(),
        ...(existing?.meta ?? {}),
        ...(body.meta ?? {}),
        updatedAt: new Date().toISOString(),
      },
    }

    // 3. Validation Zod sur la donnée complète fusionnée
    const parsed = PageSchema.safeParse(merged)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation échouée", details: parsed.error.issues },
        { status: 400 }
      )
    }

    // 4. Sauvegarde
    await savePage(slug, parsed.data as PageData)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation échouée", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Erreur lors de la sauvegarde de la page" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Check permissions
  const authCheck = requireDeletePage(request)
  if (!authCheck.authorized) {
    return authCheck.error
  }

  try {
    const { slug } = await params
    await deletePage(slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression de la page" }, { status: 500 })
  }
}

/**
 * PATCH /api/pages/[slug]
 * Renomme une page : { title?, newSlug? }
 * - title seul → met à jour le titre sans changer la clé Redis
 * - newSlug → migre la clé Redis vers le nouveau slug (+ met à jour le titre si fourni)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // Check permissions
  const authCheck = requireEditPage(request)
  if (!authCheck.authorized) {
    return authCheck.error
  }

  try {
    const { slug } = await params
    const body = await request.json()
    const { title, newSlug } = body as { title?: string; newSlug?: string }

    const existing = await loadPage(slug)
    if (!existing) {
      return NextResponse.json({ error: "Page non trouvée" }, { status: 404 })
    }

    const targetSlug = newSlug?.trim() || slug

    // Valider le nouveau slug si fourni
    if (newSlug && !/^[a-z0-9-]+$/.test(newSlug)) {
      return NextResponse.json(
        { error: "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets" },
        { status: 400 }
      )
    }

    // Mettre à jour le titre si fourni
    if (title) existing.title = title.trim()

    if (newSlug && newSlug !== slug) {
      // Migre vers le nouveau slug (supprime l'ancien, crée le nouveau)
      existing.slug = newSlug
      await savePage(newSlug, existing)
      const { kv } = await import("@/lib/kv-client")
      await kv.del(`page:${slug}`)
    } else {
      await savePage(targetSlug, existing)
    }

    return NextResponse.json({ success: true, slug: targetSlug })
  } catch {
    return NextResponse.json({ error: "Erreur lors du renommage de la page" }, { status: 500 })
  }
}
