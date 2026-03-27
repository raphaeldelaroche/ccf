# @packages/package-fetch-graphql

Wrapper GraphQL optimisé pour Next.js 15 avec support du Draft Mode WordPress et monitoring avancé.

## Installation

```bash
# Ce package est interne au monorepo
import { fetchGraphQL } from '@packages/package-fetch-graphql';
```

## Configuration

Ajoutez la variable d'environnement dans votre `.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=http://climate-contribution-framework.local/
```

## Utilisation

### Utilisation de base

```typescript
import { fetchGraphQL } from '@packages/package-fetch-graphql';

interface PageData {
  page: {
    title: string;
    content: string;
  };
}

const data = await fetchGraphQL<PageData>(
  `query GetPage($slug: String!) {
    page(slug: $slug) {
      title
      content
    }
  }`,
  { slug: 'home' }
);

console.log(data.page.title);
```

### Avec headers personnalisés

```typescript
const data = await fetchGraphQL<MyData>(
  query,
  variables,
  {
    'X-Custom-Header': 'value',
  }
);
```

### Dans un Server Component Next.js 15

```typescript
// app/page.tsx
import { fetchGraphQL } from '@packages/package-fetch-graphql';

export default async function Page() {
  const data = await fetchGraphQL<PageData>(query);

  return <div>{data.page.title}</div>;
}
```

### Dans un Client Component

```typescript
'use client';

import { fetchGraphQL } from '@packages/package-fetch-graphql';
import { useEffect, useState } from 'react';

export default function ClientPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchGraphQL<PageData>(query).then(setData);
  }, []);

  return <div>{data?.page.title}</div>;
}
```

## Fonctionnalités

### Support du Draft Mode (Preview)

Le package détecte automatiquement le Draft Mode de Next.js 15 et ajoute l'authentification JWT:

```typescript
// Automatique côté serveur
const { draftMode } = await import('next/headers');
const { isEnabled } = await draftMode();

if (isEnabled) {
  // Ajoute automatiquement le token JWT depuis les cookies
}
```

### Monitoring des requêtes

Chaque requête est automatiquement loggée avec:
- UUID unique
- Durée d'exécution
- Statut (success/error)
- Variables et query
- Environnement (server/client)
- État du cache

### Gestion des erreurs

Messages d'erreur clairs selon le contexte:

| Erreur | Message |
|--------|---------|
| HTTP 400 | "Requête invalide - Vérifiez les paramètres" |
| HTTP 401 | "Authentification requise" |
| HTTP 403 | "Accès refusé - Permissions insuffisantes" |
| HTTP 404 | "Service GraphQL non trouvé" |
| HTTP 500 | "Erreur serveur - Réessayez plus tard" |
| GraphQL Error | Message spécifique selon le type |

### Cache intelligent

```typescript
// Automatique selon le mode
{
  cache: preview ? "no-cache" : "default",
  next: {
    tags: ["wordpress"],
  }
}
```

- **Mode preview**: Pas de cache
- **Mode normal**: Cache par défaut avec tag `wordpress`
- Revalidation possible via `revalidateTag('wordpress')`

## API

### `fetchGraphQL<T>(query, variables?, headers?)`

**Paramètres:**

- `query` (string): Requête GraphQL
- `variables` (object, optionnel): Variables de la requête
- `headers` (object, optionnel): Headers HTTP personnalisés

**Retourne:**

- `Promise<T>`: Les données typées de la réponse

**Exemple:**

```typescript
const data = await fetchGraphQL<{ pages: Page[] }>(
  `query { pages { id title } }`
);
```

### Types exportés

```typescript
import type { GraphQLRequest, GraphQLStoreState } from '@packages/package-fetch-graphql';

interface GraphQLRequest {
  id: string;
  query: string;
  variables?: Record<string, unknown>;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
  cached?: boolean;
  environment: 'server' | 'client';
}
```

## Providers & Monitoring

### GraphQLProvider (Wrapper global)

```typescript
// app/layout.tsx
import { GraphQLProvider } from '@packages/package-fetch-graphql';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GraphQLProvider>
          {children}
        </GraphQLProvider>
      </body>
    </html>
  );
}
```

### GraphQLClientProvider

Provider côté client pour le monitoring:

```typescript
'use client';

import { GraphQLClientProvider } from '@packages/package-fetch-graphql';

export function Providers({ children }) {
  return (
    <GraphQLClientProvider>
      {children}
    </GraphQLClientProvider>
  );
}
```

### Monitor des requêtes

```typescript
import { registerGraphQLMonitor } from '@packages/package-fetch-graphql';

// Enregistre un composant de monitoring
registerGraphQLMonitor();
```

### Accès au store

```typescript
import { graphqlStore } from '@packages/package-fetch-graphql';

// Récupérer toutes les requêtes
const requests = graphqlStore.getState().requests;

// S'abonner aux changements
graphqlStore.subscribe(state => {
  console.log('Nouvelles requêtes:', state.requests);
});
```

## Structure du Package

```
packages/package-fetch-graphql/
├── fetchGraphQL.ts          # Fonction principale
├── types.ts                 # Définitions TypeScript
├── graphql-store.ts         # Store Zustand (client)
├── request-storage.ts       # AsyncLocalStorage (serveur)
├── GraphQLProvider.tsx      # Provider côté client
├── GraphQLWrapper.tsx       # Wrapper global
├── GraphQLMonitor.tsx       # Composant de monitoring
├── server-bridge.tsx        # Bridge serveur-client
└── index.ts                 # Exports publics
```

## Optimisations

### Performance

- Logging asynchrone sans blocage
- Cache Next.js natif
- Support des tags pour revalidation ciblée
- Détection environnement sans overhead

### Développement

- Support HTTPS local (certificat auto-signé)
- Messages d'erreur détaillés en console
- Logs structurés pour debugging

## Compatibilité

- **Next.js**: 15+ (requis pour `draftMode()`)
- **React**: 18+
- **TypeScript**: 5+
- **Node**: 18+

## Tests

Pour tester la connexion:

```bash
curl -X POST "http://climate-contribution-framework.local/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title } }"}'
```

Résultat attendu:

```json
{
  "data": {
    "generalSettings": {
      "title": "Climate Contribution Framework"
    }
  }
}
```

## Debugging

### Activer les logs détaillés

Les logs sont automatiquement activés en console. Pour voir tous les détails:

```typescript
// Les erreurs sont loggées automatiquement
console.error("Erreur complète lors de la requête GraphQL:", {
  message: error.message,
  query,
  variables,
  url: '...'
});
```

### Inspecter les requêtes

```typescript
import { graphqlStore } from '@packages/package-fetch-graphql';

// Voir toutes les requêtes
console.log(graphqlStore.getState().requests);

// Filtrer les erreurs
const errors = graphqlStore.getState().requests.filter(r => r.status === 'error');
```

## Limitations connues

1. **URL trailing slash**: L'URL avec `/` final peut créer une double barre (`//graphql`). Le serveur accepte les deux formats mais ce n'est pas idéal.

2. **Next.js 15 requis**: Utilise les nouvelles APIs async de Next.js 15 (`await draftMode()`, `await cookies()`).

## Roadmap

- [ ] Normalisation automatique des URLs
- [ ] Support des subscriptions GraphQL
- [ ] Cache avancé avec TTL personnalisé
- [ ] Retry automatique sur erreur réseau
- [ ] Batch de requêtes multiples
- [ ] DevTools pour le monitoring

## Licence

Interne au projet Climate Contribution Framework

## Support

Pour toute question ou problème, consultez la documentation du projet principal.

---

**Testé et validé** - Connexion opérationnelle avec une durée moyenne de ~360ms
