/**
 * SITEMAP CONFIGURATION
 *
 * Génère automatiquement le sitemap.xml pour le site.
 * Utilise la configuration de navigation et la config SEO pour lister toutes les pages.
 *
 * Le sitemap est accessible à : /sitemap.xml
 */

import { MetadataRoute } from "next"
import { NAVIGATION_PAGES } from "@/config/navigation"
import { getAllSEOSlugs, getPageURL } from "@/lib/seo/get-page-metadata"

/**
 * Génère le sitemap du site
 *
 * @returns Array d'entrées sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://climate-contribution-framework.local"

  // Date de dernière modification (peut être personnalisée par page)
  const lastModified = new Date()

  // Récupérer tous les slugs qui ont une configuration SEO
  const seoSlugs = new Set(getAllSEOSlugs())

  // Générer les entrées du sitemap basées sur la navigation
  const entries: MetadataRoute.Sitemap = NAVIGATION_PAGES.filter((page) => {
    // Ne garder que les pages qui ont une config SEO
    return seoSlugs.has(page.slug)
  }).map((page) => {
    // Déterminer l'URL selon si la page a un href custom ou utilise le slug
    const url = page.href
      ? page.href === "/"
        ? baseUrl
        : `${baseUrl}${page.href}`
      : getPageURL(page.slug, baseUrl)

    return {
      url,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page.slug === "home" ? 1 : 0.8,
    }
  })

  return entries
}
