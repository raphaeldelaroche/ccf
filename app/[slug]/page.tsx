/**
 * PAGE PUBLIQUE DYNAMIQUE
 *
 * Affiche une page en mode lecture seule basée sur son slug.
 * Rend les blocs de manière récursive via le système de rendu.
 */

import { notFound } from "next/navigation"
import { loadPage } from "@/lib/page-storage"
import { renderBlocks } from "@/lib/render-page-blocks"
import { PublicPageHeader } from "@/components/public/PublicPageHeader"
import type { BlockNode } from "@/lib/new-editor/block-types"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params

  // Charger les données de la page
  const pageData = await loadPage(slug)

  // 404 si la page n'existe pas
  if (!pageData) {
    notFound()
  }

  return (
    <>
      <PublicPageHeader currentSlug={slug} />
      <main className="min-h-screen">
        {/* Rendu des blocs */}
        <div className="flex flex-col">
          {renderBlocks(pageData.blocks as BlockNode[])}
        </div>
      </main>
    </>
  )
}

/**
 * Génération des métadonnées pour SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const pageData = await loadPage(slug)

  if (!pageData) {
    return {
      title: "Page non trouvée",
    }
  }

  return {
    title: pageData.title,
  }
}
