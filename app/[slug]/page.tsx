/**
 * PAGE PUBLIQUE DYNAMIQUE
 *
 * Affiche une page en mode lecture seule basée sur son slug.
 * Rend les blocs de manière récursive via le système de rendu.
 *
 * Note: Le slug "home" redirige vers / (page d'accueil).
 */

import { notFound, redirect } from "next/navigation"
import { loadPage } from "@/lib/page-storage"
import { renderBlocks } from "@/lib/render-page-blocks"
import { PublicPageHeader } from "@/components/public/PublicPageHeader"
import type { BlockNode } from "@/lib/new-editor/block-types"
import { Footer } from "@/components/layout/footer"
import { getPageMetadata } from "@/lib/seo/get-page-metadata"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params

  // Rediriger /home vers / (page d'accueil)
  if (slug === "home") {
    redirect("/")
  }

  // Charger les données de la page
  const pageData = await loadPage(slug)

  // 404 si la page n'existe pas
  if (!pageData) {
    notFound()
  }

  return (
    <>
      <PublicPageHeader />
      <main>
        {/* Rendu des blocs */}
        <div className="flex flex-col">
          {renderBlocks(pageData.blocks as BlockNode[])}
        </div>
      </main>
      <Footer />
    </>
  )
}

/**
 * Génération des métadonnées pour SEO
 * Utilise la configuration centralisée dans config/seo-pages.ts
 */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return getPageMetadata(slug)
}
