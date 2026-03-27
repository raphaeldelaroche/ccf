/**
 * Fragment GraphQL réutilisable pour les champs SEO
 * À inclure dans vos queries pour récupérer automatiquement tous les champs SEO
 * 
 * @example
 * import { SEOFragment } from "@/packages/package-seo";
 * 
 * const query = `
 *   query GetPage($slug: ID!) {
 *     page(id: $slug, idType: URI) {
 *       title
 *       ${SEOFragment}
 *     }
 *   }
 * `;
 */
export const SEOFragment = `
  seo {
    title
    description
    canonical
    robots
    openGraph {
      title
      description
      url
      siteName
      type
      images {
        url
        width
        height
        alt
      }
    }
    twitter {
      cardType
      title
      description
      image
    }
  }
  jsonLd
`;
