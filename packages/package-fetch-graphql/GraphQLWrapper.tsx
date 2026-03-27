import { ReactNode } from 'react';
import { GraphQLServerBridge } from './server-bridge';
import { GraphQLClientProvider } from './GraphQLProvider';

interface GraphQLProviderProps {
  children: ReactNode;
}

/**
 * Provider principal GraphQL (tout-en-un)
 * Combine ServerBridge (injection script) + ClientProvider (store client)
 */
export async function GraphQLProvider({ children }: GraphQLProviderProps) {
  return (
    <GraphQLServerBridge>
      <GraphQLClientProvider>
        {children}
      </GraphQLClientProvider>
    </GraphQLServerBridge>
  );
}