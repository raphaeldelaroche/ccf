/**
 * ROBOTS.TXT CONFIGURATION
 *
 * Génère automatiquement le fichier robots.txt pour contrôler le crawling.
 *
 * Le fichier est accessible à : /robots.txt
 */

import { MetadataRoute } from "next"

/**
 * Génère le fichier robots.txt
 *
 * @returns Configuration robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://climate-contribution-framework.local"

  // Déterminer si on est en production ou en développement
  const isProduction = process.env.NODE_ENV === "production"

  return {
    rules: {
      userAgent: "*",
      // En production, autoriser tous les crawlers
      // En développement, bloquer les crawlers
      allow: isProduction ? "/" : undefined,
      disallow: isProduction
        ? [
            "/api/", // Bloquer l'API
            "/new-editor", // Bloquer l'éditeur
            "/new-editor/*", // Bloquer toutes les pages de l'éditeur
          ]
        : "/", // En dev, tout bloquer
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
