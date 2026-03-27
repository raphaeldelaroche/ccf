import type { GraphQLRequest } from './types';
import { serverRequestLogger } from './request-storage';

// Définition d'un type générique pour les variables
type Variables = Record<string, unknown>;

// Types pour la gestion des erreurs GraphQL
interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export async function fetchGraphQL<T = unknown>(
  query: string,
  variables?: Variables,
  headers?: Record<string, string>,
): Promise<T> {
  // Détection de l'environnement
  const isServer = typeof window === 'undefined';

  // Générer un ID unique et timestamp pour cette requête
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    let authHeader = "";
    let preview = false;

    // Preview mode UNIQUEMENT côté serveur (Next.js 15 - async)
    if (isServer) {
      try {
        const { draftMode, cookies } = await import('next/headers');
        const { isEnabled } = await draftMode();
        preview = isEnabled;

        if (preview) {
          const cookieStore = await cookies();
          const auth = cookieStore.get("wp_jwt")?.value;
          if (auth) {
            authHeader = `Bearer ${auth}`;
          }
        }
      } catch {
        // Silencieux si next/headers n'est pas disponible
      }
    }

    const body = JSON.stringify({
      query,
      variables: {
        ...(isServer && { preview }),
        ...variables,
      },
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
          ...headers,
        },
        body,
        cache: preview ? "no-cache" : "default",
        next: {
          tags: ["wordpress"],
        },
        ...(process.env.NODE_ENV === 'development' && isServer && {
          agent: new (await import('https')).Agent({
            rejectUnauthorized: false
          })
        }),
      },
    );

    // Gestion des erreurs HTTP
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Réponse vide');
      
      // Message d'erreur plus clair selon le code de statut
      let userFriendlyMessage = `Erreur HTTP ${response.status}`;
      
      switch (response.status) {
        case 400:
          userFriendlyMessage = "Requête invalide - Vérifiez les paramètres";
          break;
        case 401:
          userFriendlyMessage = "Authentification requise";
          break;
        case 403:
          userFriendlyMessage = "Accès refusé - Permissions insuffisantes";
          break;
        case 404:
          userFriendlyMessage = "Service GraphQL non trouvé";
          break;
        case 500:
          userFriendlyMessage = "Erreur serveur - Réessayez plus tard";
          break;
        case 502:
        case 503:
        case 504:
          userFriendlyMessage = "Service temporairement indisponible";
          break;
        default:
          userFriendlyMessage = `Erreur de connexion (${response.status})`;
      }
      
      console.error("Erreur HTTP:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        query,
        variables,
        errorText
      });
      
      throw new Error(userFriendlyMessage);
    }

    let data: GraphQLResponse<T>;
    
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", {
        parseError,
        query,
        variables,
        url: response.url
      });
      
      throw new Error("Réponse du serveur invalide - Format JSON incorrect");
    }

    // Gestion des erreurs GraphQL
    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map(err => err.message).join('; ');
      
      console.error("Erreurs GraphQL détaillées:", {
        errors: data.errors,
        query,
        variables,
        url: response.url
      });
      
      // Message d'erreur plus convivial basé sur les erreurs GraphQL courantes
      let userFriendlyMessage = errorMessages;
      
      // Détecter certains types d'erreurs courantes
      if (errorMessages.toLowerCase().includes('authentication')) {
        userFriendlyMessage = "Erreur d'authentification - Vérifiez vos permissions";
      } else if (errorMessages.toLowerCase().includes('not found')) {
        userFriendlyMessage = "Ressource non trouvée";
      } else if (errorMessages.toLowerCase().includes('syntax error')) {
        userFriendlyMessage = "Erreur de requête - Syntaxe invalide";
      } else if (errorMessages.toLowerCase().includes('timeout')) {
        userFriendlyMessage = "Délai d'attente dépassé - Réessayez plus tard";
      }
      
      throw new Error(`Erreur GraphQL: ${userFriendlyMessage}`);
    }

    // Vérification si les données sont présentes
    if (!data.data) {
      console.error("Aucune donnée retournée:", {
        response: data,
        query,
        variables
      });

      throw new Error("Aucune donnée retournée par le serveur");
    }

    // Logger la requête réussie
    const successRequest: GraphQLRequest = {
      id: requestId,
      query,
      variables,
      duration: Date.now() - startTime,
      timestamp: startTime,
      status: 'success',
      environment: isServer ? 'server' : 'client',
      cached: response.headers.get('x-cache') === 'HIT',
    };

    // Logger selon l'environnement
    if (isServer) {
      serverRequestLogger.logRequest(successRequest);
    } else {
      // Côté client : utiliser le store global
      if (typeof window !== 'undefined') {
        const { graphqlStore } = await import('./graphql-store');
        graphqlStore.addRequest(successRequest);
      }
    }

    return data.data;
  } catch (error) {
    // Logger la requête en erreur
    const errorRequest: GraphQLRequest = {
      id: requestId,
      query,
      variables,
      duration: Date.now() - startTime,
      timestamp: startTime,
      status: 'error',
      environment: isServer ? 'server' : 'client',
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
    

    // Logger selon l'environnement
    if (isServer) {
      serverRequestLogger.logRequest(errorRequest);
    } else {
      // Côté client : utiliser le store global
      if (typeof window !== 'undefined') {
        const { graphqlStore } = await import('./graphql-store');
        graphqlStore.addRequest(errorRequest);
      }
    }

    // Log détaillé pour le débogage
    console.error("Erreur complète lors de la requête GraphQL:", {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      query,
      variables,
      url: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`,
      error
    });

    // Si c'est déjà une Error avec un message convivial, on la relance
    if (error instanceof Error) {
      throw error;
    }

    // Sinon, on crée une erreur avec un message générique
    throw new Error("Une erreur inattendue s'est produite lors de la requête");
  }
}

