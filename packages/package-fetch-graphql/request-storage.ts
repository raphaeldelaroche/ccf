import { cache } from 'react';
import type { GraphQLRequest } from './types';

/**
 * Store global avec isolation par rendu HTTP
 * Utilise cache() de React pour créer un contexte unique par requête HTTP
 */
class ServerRequestLogger {
  private requestsByRender = new Map<string, GraphQLRequest[]>();

  // Fonction cachée qui crée un ID unique par requête HTTP
  getCurrentRenderId = cache(() => {
    const id = `render-${Date.now()}-${Math.random()}`;
    return id;
  });

  logRequest(request: GraphQLRequest) {
    // Côté serveur uniquement
    if (typeof window !== 'undefined') return;

    const renderId = this.getCurrentRenderId();

    if (!this.requestsByRender.has(renderId)) {
      this.requestsByRender.set(renderId, []);
    }

    this.requestsByRender.get(renderId)!.push(request);

    // Cleanup old renders (plus de 30 secondes)
    const now = Date.now();
    for (const [id] of this.requestsByRender.entries()) {
      const timestamp = parseInt(id.split('-')[1]);
      if (now - timestamp > 30000) {
        this.requestsByRender.delete(id);
      }
    }
  }

  getRequests(): GraphQLRequest[] {
    const renderId = this.getCurrentRenderId();
    const requests = this.requestsByRender.get(renderId) || [];
    return [...requests];
  }
}

export const serverRequestLogger = new ServerRequestLogger();
