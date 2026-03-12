/**
 * SITEMAP PAGE
 *
 * Vue d'ensemble de toutes les pages du projet.
 * Table principale avec édition & suppression.
 * Extensible : section stats, filtres, création… à venir.
 */

import { listPagesWithDetails } from "@/lib/page-storage"
import { SitemapClient } from "@/components/sitemap/SitemapClient"
import { LayoutGrid } from "lucide-react"
import { NAVIGATION_PAGES } from "@/config/navigation"

export const dynamic = "force-dynamic"

export default async function SitemapPage() {
  const pages = await listPagesWithDetails()
  const navSlugs = new Set(NAVIGATION_PAGES.map((p) => p.slug))

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ── Header ─────────────────────────────────────── */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
              <LayoutGrid className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Sitemap</h1>
              <p className="text-muted-foreground text-sm">
                Gérez l&apos;ensemble des pages de votre projet.
              </p>
            </div>
          </div>
        </header>

        {/* ── Table principale ────────────────────────────── */}
        <section>
          <SitemapClient pages={pages} navSlugs={navSlugs} />
        </section>
      </div>
    </div>
  )
}
