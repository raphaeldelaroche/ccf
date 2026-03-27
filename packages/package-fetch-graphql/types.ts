export interface GraphQLRequest {
  id: string;
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
  cached?: boolean;
  environment: 'server' | 'client';
}

export interface GraphQLStoreState {
  requests: GraphQLRequest[];
  isMonitoring: boolean;
}
