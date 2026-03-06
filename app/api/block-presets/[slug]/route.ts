/**
 * API Routes pour un preset spécifique
 * GET /api/block-presets/[slug] - Charge un preset
 * DELETE /api/block-presets/[slug] - Supprime un preset
 */

import { NextResponse } from "next/server"
import { loadBlockPreset, deleteBlockPreset } from "@/lib/block-preset-storage"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const preset = await loadBlockPreset(slug)

    if (!preset) {
      return NextResponse.json({ error: "Preset non trouvé" }, { status: 404 })
    }

    return NextResponse.json(preset)
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement du preset" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await deleteBlockPreset(slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du preset" },
      { status: 500 }
    )
  }
}
