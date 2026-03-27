/**
 * PAGE D'ACCUEIL
 *
 * Affiche le contenu de la page "home" depuis Redis (page:home).
 * C'est la page principale du site accessible à la racine (/).
 */

import { notFound } from "next/navigation"
import { loadPage } from "@/lib/page-storage"
import { renderBlocks } from "@/lib/render-page-blocks"
import { PublicPageHeader } from "@/components/public/PublicPageHeader"
import type { BlockNode } from "@/lib/new-editor/block-types"
import { Footer } from "@/components/layout/footer"
import { getPageMetadata } from "@/lib/seo/get-page-metadata"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Charger les données de la page "home"
  const pageData = await loadPage("home")

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
export async function generateMetadata() {
  return getPageMetadata("home")
}
