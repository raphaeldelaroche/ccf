/**
 * API Routes pour une page spécifique
 * GET /api/pages/[slug] - Charge une page
 * PUT /api/pages/[slug] - Sauvegarde une page
 * DELETE /api/pages/[slug] - Supprime une page
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { loadPage, savePage, deletePage } from "@/lib/page-storage"
import { validateBlocks } from "@/lib/block-utils"
import { PageSchema } from "@/lib/schemas/page"
import type { PageData } from "@/types/editor"

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
  try {
    const { slug } = await params
    const body = await request.json()

    // 1. Charger la page existante pour fusionner les données manquantes
    const existing = await loadPage(slug)
    if (!existing) {
      return NextResponse.json({ error: "Page non trouvée" }, { status: 404 })
    }

    // 2. Fusionner : le body peut être partiel (ex: seulement { blocks })
    const merged: PageData = {
      ...existing,
      ...body,
      slug, // toujours utiliser le slug de l'URL
      meta: {
        ...existing.meta,
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

    // 4. Validation de structure hiérarchique des blocs (uniquement pour les blocs BlobEditor)
    // Les blocs BlockNote natifs n'ont pas de `blockType` et sont ignorés par validateBlocks.
    const structureErrors = validateBlocks(parsed.data.blocks as PageData["blocks"])
    if (structureErrors.length > 0) {
      return NextResponse.json(
        { error: "Structure de blocs invalide", details: structureErrors },
        { status: 400 }
      )
    }

    // 5. Sauvegarde
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
  try {
    const { slug } = await params
    await deletePage(slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression de la page" }, { status: 500 })
  }
}
