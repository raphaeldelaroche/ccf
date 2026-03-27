import { SEOData, SEOGraphQLResponse } from './types';

/**
 * Extrait les données SEO depuis une réponse GraphQL
 * Compatible avec différentes structures de données (page, post, contentNode, etc.)
 * 
 * @param data - La réponse GraphQL contenant les données SEO
 * @returns Les données SEO extraites ou null si non disponibles
 * 
 * @example
 * const pageData = await fetchGraphQL(getPageBySlug, { slug });
 * const seo = extractSEOFromData(pageData);
 */
export function extractSEOFromData(data: SEOGraphQLResponse): SEOData | null {
  // Essaie différentes structures possibles
  const node = data?.contentNode || data?.page || data?.post;
  
  if (!node?.seo) return null;
  
  return {
    title: node.seo.title,
    description: node.seo.description,
    canonical: node.seo.canonical,
    robots: node.seo.robots,
    openGraph: node.seo.openGraph,
    twitter: node.seo.twitter,
    jsonLd: node.jsonLd,
  };
}

/**
 * Retourne des métadonnées SEO par défaut
 * Utile comme fallback quand les données SEO ne sont pas disponibles
 * 
 * @param title - Titre par défaut du site
 * @param description - Description par défaut du site
 * @returns Un objet SEOData avec les valeurs par défaut
 * 
 * @example
 * const seo = extractSEOFromData(pageData) || getDefaultSEO(
 *   "Mon Site",
 *   "Description de mon site"
 * );
 */
export function getDefaultSEO(
  title = 'Site Title',
  description = 'Site Description'
): SEOData {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}
