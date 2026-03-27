/**
 * SEO METADATA UTILITIES
 *
 * Utilitaires centralisés pour récupérer les métadonnées SEO des pages.
 *
 * Usage dans generateMetadata() :
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const { slug } = await params
 *   return getPageMetadata(slug)
 * }
 * ```
 */

import { Metadata } from "next"
import { PAGE_SEO_CONFIG, DEFAULT_SEO } from "@/config/seo-pages"

/**
 * Récupère les métadonnées SEO pour une page donnée
 *
 * @param slug - Le slug de la page (ex: "home", "about", "methodology")
 * @returns Les métadonnées Next.js Metadata pour la page
 *
 * @example
 * ```typescript
 * const metadata = getPageMetadata("about")
 * // Returns full Metadata object with title, description, openGraph, etc.
 * ```
 */
export function getPageMetadata(slug: string): Metadata {
  // Normaliser le slug (enlever les slashes)
  const normalizedSlug = slug.replace(/^\/|\/$/g, "") || "home"

  // Retourner la config SEO si elle existe, sinon le fallback
  return PAGE_SEO_CONFIG[normalizedSlug] || DEFAULT_SEO
}

/**
 * Vérifie si une page a une configuration SEO définie
 *
 * @param slug - Le slug de la page
 * @returns true si la page a une config SEO, false sinon
 */
export function hasPageSEO(slug: string): boolean {
  const normalizedSlug = slug.replace(/^\/|\/$/g, "") || "home"
  return normalizedSlug in PAGE_SEO_CONFIG
}

/**
 * Récupère tous les slugs qui ont une configuration SEO
 *
 * @returns Array de slugs
 */
export function getAllSEOSlugs(): string[] {
  return Object.keys(PAGE_SEO_CONFIG)
}

/**
 * Construit une URL absolue pour une page
 *
 * @param slug - Le slug de la page
 * @param baseUrl - L'URL de base du site (optionnel, utilise NEXT_PUBLIC_SITE_URL par défaut)
 * @returns URL absolue
 */
export function getPageURL(slug: string, baseUrl?: string): string {
  const base =
    baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://climate-contribution-framework.local"

  const normalizedSlug = slug.replace(/^\/|\/$/g, "")

  // La home pointe vers la racine
  if (normalizedSlug === "home" || normalizedSlug === "") {
    return base
  }

  return `${base}/${normalizedSlug}`
}
