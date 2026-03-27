'use client';

import { useEffect, useState } from 'react';
import { graphqlStore } from './graphql-store';
import { devToolsStore } from '../package-devtool/store';
import type { GraphQLStoreState, GraphQLRequest } from './types';

function GraphQLMonitorPanel() {
  const [state, setState] = useState<GraphQLStoreState>(graphqlStore.getState());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [preserveLog, setPreserveLog] = useState(() => {
    // Récupérer la valeur sauvegardée dans localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('graphql-preserve-log') === 'true';
    }
    return false;
  });

  useEffect(() => {
    return graphqlStore.subscribe(() => {
      setState(graphqlStore.getState());
    });
  }, []);

  // Synchroniser preserveLog avec localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('graphql-preserve-log', String(preserveLog));
    }
  }, [preserveLog]);

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const extractOperationName = (query: string): string => {
    const match = query.match(/(?:query|mutation)\s+(\w+)/);
    return match ? match[1] : 'Anonymous';
  };

  const getStatusColor = (status: GraphQLRequest['status']) => {
    return status === 'error' ? 'text-red-600' : 'text-green-600';
  };

  const getEnvironmentBadge = (env: GraphQLRequest['environment']) => {
    const colors = {
      server: 'bg-blue-100 text-blue-800',
      client: 'bg-purple-100 text-purple-800',
    };
    return colors[env];
  };

  const handleRecord = () => {
    // Activer l'état "recording"
    setIsRecording(true);
    
    // Sauvegarder que le panel est ouvert
    localStorage.setItem('graphql-panel-open', 'true');
    
    // Si preserve log n'est pas activé, on clear avant de rafraîchir
    if (!preserveLog) {
      graphqlStore.reset();
    }

    // Rafraîchir la page pour capturer les nouvelles requêtes
    window.location.reload();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(label);
      // Reset après 2 secondes
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="p-4">
      {/* Header - Style Chrome DevTools */}
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
        {/* Bouton Record - Style Chrome DevTools */}
        <button
          onClick={handleRecord}
          disabled={isRecording}
          className={`flex items-center gap-1.5 p-1 transition-all ${
            isRecording
              ? 'text-gray-400 cursor-wait'
              : 'text-gray-700 hover:text-gray-900 cursor-pointer hover:bg-gray-100 rounded'
          }`}
          title={isRecording ? "Recording..." : "Record page reload"}
        >
          <svg 
            className={`w-4 h-4 transition-all ${
              isRecording ? 'text-red-400 animate-pulse' : 'text-red-600'
            }`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
          <span className="text-xs font-medium">
            {isRecording ? 'Recording...' : 'Record'}
          </span>
        </button>

        <div className="h-4 w-px bg-gray-300" />

        <button
          onClick={() => graphqlStore.reset()}
          className="text-gray-600 hover:text-gray-900 transition-colors p-1 cursor-pointer hover:bg-gray-100 rounded"
          title="Clear requests"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-gray-900">
          <input
            type="checkbox"
            checked={preserveLog}
            onChange={(e) => setPreserveLog(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Preserve log</span>
        </label>

        <div className="flex-1" />

        <span className="text-xs text-gray-500">
          {state.requests.length} request{state.requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Requests list */}
      {state.requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No GraphQL requests captured yet</p>
          <p className="text-xs mt-1">Requests will appear here as they are made</p>
        </div>
      ) : (
        <div className="space-y-2">
          {state.requests.map((req) => (
            <details
              key={req.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <summary className="cursor-pointer font-mono text-sm flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold">
                    {req.operationName || extractOperationName(req.query)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getEnvironmentBadge(req.environment)}`}>
                    {req.environment}
                  </span>
                  {req.cached && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      cached
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${getStatusColor(req.status)}`}>
                    {formatDuration(req.duration)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(req.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </summary>

              <div className="mt-3 space-y-2">
                {/* Error message */}
                {req.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs font-semibold text-red-800 mb-1">Error:</p>
                    <p className="text-xs text-red-700">{req.error}</p>
                  </div>
                )}

                {/* Query */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-gray-700">Query:</p>
                    <button
                      onClick={() => copyToClipboard(req.query, `query-${req.id}`)}
                      className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        copiedId === `query-${req.id}`
                          ? 'bg-green-100 text-green-700'
                          : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                      }`}
                      title="Copy query to clipboard"
                    >
                      {copiedId === `query-${req.id}` ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                    {req.query}
                  </pre>
                </div>

                {/* Variables */}
                {req.variables && Object.keys(req.variables).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">Variables:</p>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(req.variables, null, 2), `variables-${req.id}`)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-all ${
                          copiedId === `variables-${req.id}`
                            ? 'bg-green-100 text-green-700'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                        title="Copy variables to clipboard"
                      >
                        {copiedId === `variables-${req.id}` ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(req.variables, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>ID: {req.id}</span>
                  <span>Status: {req.status}</span>
                  <span>Duration: {formatDuration(req.duration)}</span>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

// Enregistrer le monitor dans les DevTools
export function registerGraphQLMonitor() {
  if (typeof window !== 'undefined') {
    devToolsStore.registerMenu({
      id: 'graphql',
      name: 'GraphQL',
      icon: '📊',
      component: GraphQLMonitorPanel,
    });
  }
}
