# Context par défaut

@CLAUDE_CONTEXT.md

Tu es sur un projet Next.js avec un système de composants modulaires (Blob UI).

## Règles de base

- **Privilégie toujours la modification des fichiers existants** plutôt que d'en créer de nouveaux
- **Utilise les conventions du projet** (voir CLAUDE_CONTEXT.md)
- **Ne crée jamais de fichiers markdown** sauf demande explicite de l'utilisateur
- **Consulte la documentation `/docs`** si besoin de détails sur un système spécifique

## Sources de documentation

Si tu as besoin de plus de contexte selon la tâche :

- **Architecture / flux de données** → `@docs/architecture.md`
- **Système Blob (composants, CSS)** → `@docs/blob-system.md`
- **Éditeurs (New Editor, legacy)** → `@docs/editor-guide.md`
- **BlobIterator et champs partagés** → `@docs/iterator-system.md`
- **Rôles et permissions** → `@docs/permissions.md`
- **Créer un bloc custom** → `@docs/custom-blocks.md`

## Rappels importants

- **Valeurs responsive** : Format `"stack md:row lg:bar"` (mobile-first)
- **Champs repeater** : Stockés en JSON string `"[{...}]"`
- **Mappers** : Découplage FormData → Props composant
- **Zero re-render** : `localValue` state dans les inputs d'inspector
- **itemFields** : Héritage inversé (tout partagé sauf exceptions listées)
