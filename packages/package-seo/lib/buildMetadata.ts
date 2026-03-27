import type { Metadata } from 'next';
import { SEOData, OpenGraphType, SEOGraphQLResponse } from './types';
import { extractSEOFromData, getDefaultSEO } from './extractSEO';

export interface SEOMetadataOptions {
  /** Titre par défaut si aucune donnée SEO */
  title?: string;
  /** Description par défaut si aucune donnée SEO */
  description?: string;
}

/**
 * Construit les métadonnées Next.js depuis des données SEO
 * Accepte soit des données SEO directes, soit une réponse GraphQL
 * 
 * @param seoOrResponse - Données SEO ou réponse GraphQL
 * @param options - Options de configuration (title/description par défaut)
 * @returns Métadonnées Next.js
 * 
 * @example
 * // Avec réponse GraphQL et options
 * const seoData = await fetchGraphQL(getPageSEO, { slug });
 * return buildSEOMetadata(seoData, {
 *   title: "Site Title",
 *   description: "Site Description"
 * });
 * 
 * @example
 * // Avec données SEO directes (legacy)
 * const seo = extractSEOFromData(data);
 * return buildSEOMetadata(seo);
 */
export function buildSEOMetadata(
  seoOrResponse: SEOData | SEOGraphQLResponse,
  options?: SEOMetadataOptions
): Metadata {
  // Déterminer si c'est une réponse GraphQL ou des données SEO directes
  let seo: SEOData;
  
  if ('page' in seoOrResponse || 'post' in seoOrResponse || 'contentNode' in seoOrResponse) {
    // C'est une réponse GraphQL, on extrait les données
    seo = extractSEOFromData(seoOrResponse as SEOGraphQLResponse) 
      || getDefaultSEO(options?.title, options?.description);
  } else {
    // C'est déjà des données SEOData
    seo = seoOrResponse as SEOData;
  }
  // Métadonnées de base
  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
  };

  // Canonical URL
  if (seo.canonical) {
    metadata.alternates = {
      canonical: seo.canonical,
    };
  }

  // Robots
  if (seo.robots) {
    metadata.robots = seo.robots;
  }

  // OpenGraph
  if (seo.openGraph) {
    // Vérifier que le type est valide, sinon utiliser "website" comme valeur par défaut
    const ogType = validateOpenGraphType(seo.openGraph.type);
    
    metadata.openGraph = {
      title: seo.openGraph.title || seo.title,
      description: seo.openGraph.description || seo.description,
      url: seo.openGraph.url,
      siteName: seo.openGraph.siteName,
      type: ogType,
      images: seo.openGraph.images?.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
      })) || [],
    };
  }

  // Twitter
  if (seo.twitter) {
    metadata.twitter = {
      card: seo.twitter.cardType as 'summary' | 'summary_large_image' | 'app' | 'player',
      title: seo.twitter.title || seo.title,
      description: seo.twitter.description || seo.description,
      images: seo.twitter.image ? [seo.twitter.image] : undefined,
    };
  }

  return metadata;
}

/**
 * Construit des métadonnées Next.js statiques pour les pages hardcodées.
 * Remplit automatiquement les champs par défaut (siteName, OG type, twitter card, etc.)
 * à partir d'un objet SEOData partiel.
 *
 * @param seo - Données SEO partielles (au minimum title + description)
 * @returns Métadonnées Next.js complètes
 *
 * @example
 * export const metadata = buildStaticMetadata({
 *   title: "Contact",
 *   description: "Contactez Atekka pour vos questions d'assurance agricole.",
 *   canonical: "https://www.atekka.fr/contact/",
 * });
 */
export function buildStaticMetadata(seo: Partial<SEOData> & { title: string; description: string }): Metadata {
  const fullSeo: SEOData = {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    robots: seo.robots ?? "index, follow",
    openGraph: {
      title: seo.openGraph?.title ?? seo.title,
      description: seo.openGraph?.description ?? seo.description,
      url: seo.openGraph?.url ?? seo.canonical,
      siteName: seo.openGraph?.siteName ?? "Atekka",
      type: seo.openGraph?.type ?? "website",
      images: seo.openGraph?.images,
    },
    twitter: {
      cardType: seo.twitter?.cardType ?? "summary_large_image",
      title: seo.twitter?.title ?? seo.title,
      description: seo.twitter?.description ?? seo.description,
      image: seo.twitter?.image,
    },
    jsonLd: seo.jsonLd,
  };

  return buildSEOMetadata(fullSeo);
}

// Fonction utilitaire pour valider le type OpenGraph
function validateOpenGraphType(type?: string): OpenGraphType {
  const validTypes: OpenGraphType[] = [
    'article', 'website', 'book', 'profile', 
    'music.song', 'music.album', 'music.playlist', 'music.radio_station',
    'video.movie', 'video.episode', 'video.tv_show', 'video.other'
  ];
  
  if (type && validTypes.includes(type as OpenGraphType)) {
    return type as OpenGraphType;
  }
  
  // Type par défaut
  return 'website';
}