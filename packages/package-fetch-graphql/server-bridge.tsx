import { ReactNode } from 'react';
import { serverRequestLogger } from './request-storage';

interface GraphQLServerBridgeProps {
  children: ReactNode;
}

async function GraphQLRequestsScript() {
  // Attendre suffisamment longtemps pour que toutes les requêtes soient loggées
  // Les requêtes GraphQL peuvent être en parallèle, donc on attend 500ms
  await new Promise(resolve => setTimeout(resolve, 500));

  // Récupérer toutes les requêtes loggées pour ce rendu
  const requests = serverRequestLogger.getRequests();

  

  if (requests.length === 0) {
    return null;
  }

  return (
    <script
      id="__GRAPHQL_SERVER_REQUESTS__"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(requests)
      }}
    />
  );
}

export async function GraphQLServerBridge({ children }: GraphQLServerBridgeProps) {
  return (
    <>
      {children}
      <GraphQLRequestsScript />
    </>
  );
}
