/**
 * SITEMAP PAGE
 *
 * Vue d'ensemble de toutes les pages du projet.
 * Table principale avec édition & suppression.
 * Extensible : section stats, filtres, création… à venir.
 */

import { listPagesWithDetails } from "@/lib/page-storage"
import { SitemapClient } from "@/components/sitemap/SitemapClient"
import { SitemapHeader } from "@/components/sitemap/SitemapHeader"
import { NAVIGATION_PAGES } from "@/config/navigation"

export const dynamic = "force-dynamic"

export default async function SitemapPage() {
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
    <div className="min-h-screen bg-background">
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
