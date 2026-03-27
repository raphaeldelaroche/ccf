// Exporter les composants
export { JsonLd } from './components/JsonLd';

// Exporter les utilitaires
export { SEOFetcher } from './lib/fetchSEO';
export { buildSEOMetadata, buildStaticMetadata } from './lib/buildMetadata';
export type { SEOMetadataOptions } from './lib/buildMetadata';
export { extractSEOFromData, getDefaultSEO } from './lib/extractSEO';

// Exporter les fragments GraphQL
export { SEOFragment } from './lib/fragments';

// Exporter les types
export type { 
  SEOData, 
  ContentType, 
  OpenGraph, 
  OpenGraphType, 
  Twitter, 
  SEOImage,
  IDType,
  SEOGraphQLResponse
} from './lib/types';