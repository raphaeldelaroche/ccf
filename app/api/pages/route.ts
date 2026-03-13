/**
 * API Routes pour la gestion des pages
 * GET /api/pages - Liste toutes les pages
 * POST /api/pages - Crée une nouvelle page
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { listPagesWithMeta, createPage } from "@/lib/page-storage"
import { requireCreatePage } from "@/lib/auth/api-auth"

const CreatePageRequestSchema = z.object({
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  title: z.string().min(1, "Le titre est requis"),
})

export async function GET() {
  try {
    const pages = await listPagesWithMeta()
    return NextResponse.json({ pages })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des pages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Check permissions
  const authCheck = requireCreatePage(request)
  if (!authCheck.authorized) {
    return authCheck.error
  }

  try {
    const body = await request.json()

    const parsed = CreatePageRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation échouée", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { slug, title } = parsed.data
    const pageData = await createPage(slug, title)
    return NextResponse.json(pageData)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création de la page" }, { status: 500 })
  }
}
