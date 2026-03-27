// Ajoutez cette définition de type dans votre fichier src/package-seo/lib/types.ts

export type IDType = 
  | 'DATABASE_ID' 
  | 'ID' 
  | 'URI' 
  | 'SLUG' 
  | 'NAME' 
  | 'TITLE';

export type OpenGraphType = 
  | 'article' 
  | 'website' 
  | 'book' 
  | 'profile' 
  | 'music.song' 
  | 'music.album' 
  | 'music.playlist' 
  | 'music.radio_station' 
  | 'video.movie' 
  | 'video.episode' 
  | 'video.tv_show' 
  | 'video.other';

export interface SEOImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface OpenGraph {
  title: string;
  description: string;
  url?: string;
  siteName?: string;
  type?: OpenGraphType;
  images?: SEOImage[];
}

export interface Twitter {
  cardType?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraph;
  twitter?: Twitter;
  jsonLd?: string;
}

export type ContentType = 'page' | 'post' | 'workCategory';

/**
 * Type pour la réponse GraphQL contenant des données SEO
 * Compatible avec page, post, ou tout autre contentNode
 */
export interface SEOGraphQLResponse {
  page?: {
    seo?: {
      title: string;
      description: string;
      canonical?: string;
      robots?: string;
      openGraph?: OpenGraph;
      twitter?: Twitter;
    };
    jsonLd?: string;
  };
  post?: {
    seo?: {
      title: string;
      description: string;
      canonical?: string;
      robots?: string;
      openGraph?: OpenGraph;
      twitter?: Twitter;
    };
    jsonLd?: string;
  };
  contentNode?: {
    seo?: {
      title: string;
      description: string;
      canonical?: string;
      robots?: string;
      openGraph?: OpenGraph;
      twitter?: Twitter;
    };
    jsonLd?: string;
  };
}

export interface FetchGraphQLFunction {
  <T = unknown>(
    query: string, 
    variables?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<T>;
}