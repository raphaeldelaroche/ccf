import { SEOData, IDType } from './types';
import { SEOFragment } from './fragments';
import { fetchGraphQL } from "@/packages/package-fetch-graphql/fetchGraphQL";

// Classe pour encapsuler les fonctionnalités de récupération SEO
export class SEOFetcher {
  public readonly defaultTitle: string;
  public readonly defaultDescription: string;

  constructor(
    defaultTitle = 'Site Title',
    defaultDescription = 'Site Description'
  ) {
    this.defaultTitle = defaultTitle;
    this.defaultDescription = defaultDescription;
  }

  /**
   * Récupère les données SEO d'une page par ID
   * @param id - Identifiant de la page
   * @param idType - Type d'identifiant (URI par défaut)
   */
  async getPageSEO(id: string, idType: IDType = 'URI'): Promise<SEOData> {
    const query = `
      query GetPageSEO($id: ID!, $idType: PageIdType!) {
        page(id: $id, idType: $idType) {
          ${SEOFragment}
        }
      }
    `;

    try {
      
      const response = await fetchGraphQL<{
        page?: {
          seo: SEOData;
          jsonLd?: string;
        };
      }>(query, { id, idType });
      
      if (!response?.page?.seo) {
        return this.getDefaultSEO();
      }

      const seo = response.page.seo;
      const jsonLd = response.page.jsonLd;
      
      return {
        ...seo,
        jsonLd,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données SEO de page:', error);
      return this.getDefaultSEO();
    }
  }

  /**
   * Méthode pour maintenir la compatibilité avec le code existant
   * Récupère les données SEO d'une page par URI
   */
  async getPageSEOByURI(uri: string): Promise<SEOData> {
    return this.getPageSEO(uri, 'URI');
  }


  /**
   * Récupère les données SEO d'un nœud de contenu par ID
   * Le type de contenu est détecté automatiquement (page, post, etc.)
   * @param id - Identifiant du contenu
   * @param idType - Type d'identifiant (URI par défaut)
   */
  async getContentNodeSEO(
    id: string | number, 
    idType: IDType = 'URI'
  ): Promise<SEOData> {
    const query = `
      query AutoDetectContentNodeSEO($id: ID!, $idType: ContentNodeIdTypeEnum!) {
        contentNode(id: $id, idType: $idType) {
          ${SEOFragment}
        }
      }
    `;

    try {
      
      const response = await fetchGraphQL<{
        contentNode?: {
          seo: SEOData;
          jsonLd?: string;
          __typename: string;
        };
      }>(query, { id: String(id), idType });
      
      if (!response?.contentNode?.seo) {
        return this.getDefaultSEO();
      }

      const seo = response.contentNode.seo;
      const jsonLd = response.contentNode.jsonLd;
      
      return {
        ...seo,
        jsonLd,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données SEO:', error);
      return this.getDefaultSEO();
    }
  }

  /**
   * Récupère les données SEO d'une taxonomie
   * @param id - Identifiant de la taxonomie (par défaut considéré comme un slug)
   * @param taxonomy - Type de taxonomie (Category, Tag, etc.)
   * @param idType - Type d'identifiant (SLUG par défaut pour les termes)
   */
  async getTermSEO(
    id: string | number, 
    taxonomy: string, 
    idType: IDType = 'SLUG'
  ): Promise<SEOData> {
    // uppercase first char
    const formattedTaxonomy = taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1);

    const query = `
      query GetTermSEO($id: ID!, $idType: ${formattedTaxonomy}IdType!) {
        ${taxonomy}(id: $id, idType: $idType) {
          ${SEOFragment}
        }
      }
    `;

    try {
      
      const response = await fetchGraphQL<{
        [key: string]: {
          seo: SEOData;
        };
      }>(query, { id: String(id), idType });
      
      // Récupération dynamique de la propriété correspondant au nom de la taxonomie
      const term = response?.[taxonomy];
      
      if (!term?.seo) {
        return this.getDefaultSEO();
      }

      return term.seo;
    } catch (error) {
      console.error('Erreur lors de la récupération des données SEO de terme:', error);
      return this.getDefaultSEO();
    }
  }

  /**
   * Récupère les données SEO de la page d'accueil
   */
  async getHomeSEO(): Promise<SEOData> {
    return this.getPageSEO('/', 'URI');
  }

  /**
   * Récupère les données SEO par défaut
   */
  getDefaultSEO(): SEOData {
    return {
      title: this.defaultTitle,
      description: this.defaultDescription,
      openGraph: {
        title: this.defaultTitle,
        description: this.defaultDescription
      }
    };
  }
}