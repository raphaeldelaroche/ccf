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
  { slug: "accueil", title: "Accueil" },
  { slug: "a-propos", title: "À propos", href: "/a-propos" },
  { slug: "methodologie", title: "Méthodologie", href: "/methodologie" },
  { slug: "ressources", title: "Ressources", href: "/ressources" },
  { slug: "contact", title: "Contact", href: "/contact" },
  { slug: "benchmark", title: "Benchmark", href: "/benchmark" },
]
