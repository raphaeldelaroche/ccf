/**
 * NAVIGATION CONFIG
 *
 * Contrôle quelles pages apparaissent dans :
 * - le menu de navigation public (PublicPageHeader)
 * - la page Sitemap (/sitemap)
 *
 * Deux types d'entrées :
 * - Page Redis (créée dans l'éditeur) : { slug, title }
 *   → lien vers /{slug}
 * - Page statique (fichier dans /app) : { slug, title, href }
 *   → lien vers href (ex: "/about", "/new-editor")
 *
 * Pour ajouter une page : ajouter une entrée.
 * Pour la retirer : supprimer ou commenter la ligne.
 */
export const NAVIGATION_PAGES: Array<{ slug: string; title: string; href?: string }> = [
  { slug: "home", title: "Home" },
  { slug: "about", title: "About" },
  { slug: "methodology", title: "Methodology" },
  { slug: "resources", title: "Resources" },
  { slug: "contact", title: "Contact" },
  { slug: "benchmark", title: "Benchmark", href: "/benchmark" },
  { slug: "benchmark-report", title: "Benchmark Report", href: "/benchmark-report" },
]
