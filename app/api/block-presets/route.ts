/**
 * API Routes pour les presets de blocs
 * GET /api/block-presets - Liste tous les presets
 * POST /api/block-presets - Crée un nouveau preset
 */

import { NextResponse } from "next/server"
import { listBlockPresets, createBlockPreset } from "@/lib/block-preset-storage"
import { CreateBlockPresetRequestSchema } from "@/lib/schemas/preset"
import type { BlockNode } from "@/types/editor"

export async function GET() {
  try {
    const presets = await listBlockPresets()
    return NextResponse.json({ presets })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des presets" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation Zod
    const parsed = CreateBlockPresetRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation échouée", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { block, name, slug, description, useCase, tags } = parsed.data

    const preset = await createBlockPreset(
      block as unknown as BlockNode,
      name,
      slug,
      description,
      useCase,
      tags
    )

    return NextResponse.json(preset)
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du preset" },
      { status: 500 }
    )
  }
}
