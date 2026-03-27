/**
 * NEW EDITOR ROUTE
 *
 * Route dynamique qui affiche :
 * - /new-editor (sans paramètre) → Sitemap (liste des pages)
 * - /new-editor?page=slug → Éditeur pour la page spécifiée
 */

import { Suspense } from "react"
import { NewEditor } from "@/components/new-editor/NewEditor"
import { listPagesWithDetails } from "@/lib/page-storage"
import { SitemapClient } from "@/components/sitemap/SitemapClient"
import { SitemapHeader } from "@/components/sitemap/SitemapHeader"
import { NAVIGATION_PAGES } from "@/config/navigation"

export const dynamic = "force-dynamic"

interface NewEditorPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function NewEditorPage({ searchParams }: NewEditorPageProps) {
  const params = await searchParams
  const pageSlug = params.page

  // Si un slug de page est fourni, afficher l'éditeur
  if (pageSlug) {
    return (
      <Suspense>
        <NewEditor />
      </Suspense>
    )
  }

  // Sinon, afficher le Sitemap
  const allPages = await listPagesWithDetails()
  const navSlugs = new Set(NAVIGATION_PAGES.map((p) => p.slug))
  const redisPages = allPages.filter((p) => navSlugs.has(p.slug))
  const redisSlugs = new Set(redisPages.map((p) => p.slug))

  // Static pages (have href in config) not stored in Redis
  const staticEntries = NAVIGATION_PAGES
    .filter((n) => n.href && !redisSlugs.has(n.slug))
    .map((n) => ({ slug: n.slug, title: n.title }))

  const staticHrefs: Record<string, string> = Object.fromEntries(
    NAVIGATION_PAGES
      .filter((n) => n.href && !redisSlugs.has(n.slug))
      .map((n) => [n.slug, n.href!])
  )

  const navOrder = NAVIGATION_PAGES.map((p) => p.slug)
  const pages = [...redisPages, ...staticEntries]
    .sort((a, b) => navOrder.indexOf(a.slug) - navOrder.indexOf(b.slug))

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ── Header ─────────────────────────────────────── */}
        <SitemapHeader />

        {/* ── Stats (future: bloc de KPIs) ───────────────── */}
        {/* <SitemapStats pages={pages} /> */}

        {/* ── Table principale ────────────────────────────── */}
        <section>
          <SitemapClient pages={pages} navSlugs={navSlugs} staticHrefs={staticHrefs} />
        </section>

        {/* ── Sections futures ────────────────────────────── */}
        {/* <SitemapPresets /> */}
        {/* <SitemapActivity /> */}
      </div>
    </div>
  )
}
