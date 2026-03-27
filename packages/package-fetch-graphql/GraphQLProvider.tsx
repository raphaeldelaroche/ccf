'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { graphqlStore } from './graphql-store';
import { usePathname } from 'next/navigation';
import { registerGraphQLMonitor } from './GraphQLMonitor';
import { devToolsStore } from '../package-devtool/store';

interface GraphQLClientProviderProps {
  children: ReactNode;
}

export function GraphQLClientProvider({ children }: GraphQLClientProviderProps) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const isMonitorRegistered = useRef(false);

  // Enregistrer le monitor dans DevTools (une seule fois)
  useEffect(() => {
    if (!isMonitorRegistered.current && process.env.NODE_ENV === 'development') {
      registerGraphQLMonitor();
      isMonitorRegistered.current = true;
    }
  }, []);

  // Restaurer l'état ouvert du panel après refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasOpen = localStorage.getItem('graphql-panel-open') === 'true';
      if (wasOpen) {
        // Petit délai pour laisser le temps au DevTools de se monter
        setTimeout(() => {
          devToolsStore.openPanel('graphql');
        }, 150);
      }
    }
  }, []);

  // Initialiser avec les requêtes serveur au premier rendu
  useEffect(() => {
    // Attendre que le DOM soit complètement chargé
    const timer = setTimeout(() => {
      graphqlStore.initFromServer();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Reset lors de la navigation client-side (PAS au premier rendu)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Vérifier si "Preserve log" est activé
    const preserveLog = typeof window !== 'undefined'
      ? localStorage.getItem('graphql-preserve-log') === 'true'
      : false;

    if (!preserveLog) {
      graphqlStore.reset();
    }
  }, [pathname]);

  return <>{children}</>;
}
