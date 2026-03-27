/**
 * NAVIGATION CONFIG
 *
 * Contrôle quelles pages apparaissent dans :
 * - le menu de navigation public (PublicPageHeader)
 * - la page Sitemap (/new-editor)
 *
 * Deux types d'entrées :
 * - Page Redis (créée dans l'éditeur) : { slug, title }
 *   → lien vers /{slug}
 * - Page statique (fichier dans /app) : { slug, title, href }
 *   → lien vers href (ex: "/about", "/new-editor")
 *
 * Note: Le slug "home" pointe vers "/" (page d'accueil).
 *
 * Pour ajouter une page : ajouter une entrée.
 * Pour la retirer : supprimer ou commenter la ligne.
 */
export const NAVIGATION_PAGES: Array<{ slug: string; title: string; href?: string }> = [
  { slug: "home", title: "Home", href: "/" },
  { slug: "about", title: "About" },
  { slug: "methodology", title: "Methodology" },
  { slug: "resources", title: "Resources" },
  { slug: "contact", title: "Contact" },
  { slug: "self-assessment", title: "Self-Assessment", href: "/self-assessment" },
  { slug: "self-assessment-report", title: "Self-Assessment Report", href: "/self-assessment-report" },
]
