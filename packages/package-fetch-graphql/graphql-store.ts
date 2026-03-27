'use client';

import type { GraphQLRequest, GraphQLStoreState } from './types';

type Subscriber = () => void;

const STORAGE_KEY = 'graphql-requests-history';
const MAX_STORED_REQUESTS = 100; // Limite pour éviter de saturer le localStorage

class GraphQLStore {
  private state: GraphQLStoreState = {
    requests: [],
    isMonitoring: true,
  };

  private subscribers = new Set<Subscriber>();

  // Initialiser avec les requêtes serveur depuis le script + historique localStorage
  initFromServer() {
    if (typeof window === 'undefined') return;

    // 1. Récupérer l'historique du localStorage si "Preserve log" est activé
    const preserveLog = localStorage.getItem('graphql-preserve-log') === 'true';
    let historicalRequests: GraphQLRequest[] = [];

    if (preserveLog) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          historicalRequests = JSON.parse(stored);
        }
      } catch (e) {
        console.error('[GraphQLStore] Failed to load stored requests', e);
      }
    }

    // 2. Récupérer les requêtes du rendu serveur actuel
    const scriptTag = document.getElementById('__GRAPHQL_SERVER_REQUESTS__');
    let serverRequests: GraphQLRequest[] = [];

    if (scriptTag?.textContent) {
      try {
        serverRequests = JSON.parse(scriptTag.textContent) as GraphQLRequest[];
      } catch (e) {
        console.error('[GraphQLStore] Failed to parse server GraphQL requests', e);
      }
    }

    // 3. Fusionner : historique + nouvelles requêtes
    this.state.requests = [...historicalRequests, ...serverRequests];

    // 4. Sauvegarder dans localStorage
    this.saveToLocalStorage();

    this.notify();
  }

  // Ajouter une requête client
  addRequest(request: GraphQLRequest) {
    if (!this.state.isMonitoring) return;

    this.state.requests.push(request);
    this.saveToLocalStorage();
    this.notify();
  }

  // Reset (pour navigation client-side)
  reset() {
    this.state.requests = [];
    this.saveToLocalStorage();
    this.notify();
  }

  // Sauvegarder dans localStorage
  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;

    try {
      // Limiter le nombre de requêtes stockées
      const requestsToStore = this.state.requests.slice(-MAX_STORED_REQUESTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requestsToStore));
    } catch (e) {
      console.error('[GraphQLStore] Failed to save to localStorage', e);
    }
  }

  // Récupérer l'état actuel
  getState(): GraphQLStoreState {
    return {
      ...this.state,
      requests: [...this.state.requests]
    };
  }

  // S'abonner aux changements
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notifier les abonnés
  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // Toggle monitoring
  toggleMonitoring() {
    this.state.isMonitoring = !this.state.isMonitoring;
    this.notify();
  }
}

// Singleton instance
export const graphqlStore = new GraphQLStore();
