# Système de Rôles Utilisateur

Ce dossier contient l'implémentation du système de rôles utilisateur pour Blob UI.

## Vue d'ensemble

Le système de rôles permet de contrôler les permissions des utilisateurs sans nécessiter d'authentification. Les rôles sont stockés en `localStorage` et peuvent être facilement migrés vers un système d'authentification complet plus tard.

## Rôles disponibles

### Engineer (Ingénieur)
- **Permissions complètes** : Peut tout faire
- Peut créer des pages
- Peut éditer des pages (titre, slug, contenu)
- Peut supprimer des pages
- Peut accéder à l'éditeur visuel
- Peut sauvegarder des modifications

### Editor (Éditeur)
- Peut éditer les pages existantes
- Peut accéder à l'éditeur visuel
- Peut sauvegarder des modifications
- **Restrictions de contenu** : Peut uniquement modifier les champs texte (text, textarea)
  - ✅ Peut modifier : titres, sous-titres, textes, labels de boutons, URLs
  - ❌ Ne peut pas modifier : couleurs, mise en page, espacements, styles, icônes, images/vidéos
- **Ne peut pas** créer de pages
- **Ne peut pas** modifier le titre ou le slug d'une page
- **Ne peut pas** supprimer de pages
- **Ne peut pas** accéder à l'éditeur JSON

### Reviewer (Réviseur)
- Accès en **lecture seule**
- Peut consulter les pages
- **Ne peut pas** accéder à l'éditeur visuel
- **Ne peut pas** modifier quoi que ce soit
- **Ne peut pas** sauvegarder

## Architecture des fichiers

```
lib/auth/
├── README.md                 # Ce fichier
├── types.ts                  # Types TypeScript et constantes
├── UserContext.tsx           # Context React pour le rôle utilisateur
├── permissions.ts            # Fonctions utilitaires de vérification des permissions
├── field-permissions.ts      # Permissions granulaires au niveau des champs (NEW)
├── api-auth.ts              # Middleware de validation pour les API routes
└── api-client.ts            # Client fetch avec injection automatique des headers

components/auth/
├── RoleSelectionDialog.tsx  # Modal de sélection de rôle au premier accès
└── RoleBadge.tsx            # Badge affichant le rôle actuel avec menu
```

## Utilisation

### Frontend - Vérifier les permissions dans un composant

```tsx
import { useUser } from '@/lib/auth/UserContext'
import { canCreatePage, canEditPage } from '@/lib/auth/permissions'

function MyComponent() {
  const { user } = useUser()

  return (
    <>
      {canCreatePage(user.role) && (
        <button>Créer une page</button>
      )}
      {canEditPage(user.role) && (
        <button>Éditer</button>
      )}
    </>
  )
}
```

### Frontend - Faire un appel API avec le rôle

```tsx
import { api } from '@/lib/auth/api-client'

// Le header x-user-role est automatiquement ajouté
const response = await api.post('/api/pages', {
  slug: 'ma-page',
  title: 'Ma Page'
})
```

### Backend - Protéger une API route

```tsx
import { requireCreatePage } from '@/lib/auth/api-auth'

export async function POST(request: Request) {
  // Vérifie que l'utilisateur a la permission
  const authCheck = requireCreatePage(request)
  if (!authCheck.authorized) {
    return authCheck.error // Retourne 401 ou 403
  }

  // Logique de création de page...
}
```

## Permissions disponibles

Les permissions sont définies dans `types.ts` :

- `create_page` : Créer de nouvelles pages
- `edit_page` : Modifier le titre/slug d'une page
- `delete_page` : Supprimer des pages
- `access_editor` : Accéder à l'éditeur visuel
- `save_changes` : Sauvegarder des modifications
- `edit_advanced_fields` : Modifier les champs avancés (layout, style, etc.) - **Nouveau**

## Permissions granulaires par type de champ

Le système inclut désormais des permissions au niveau des champs de l'éditeur (`field-permissions.ts`) :

### Catégories de champs

1. **`text-content`** (Autorisé pour Editor)
   - Champs `text` et `textarea`
   - Exemples : titres, sous-titres, paragraphes, labels de boutons

2. **`media-url`** (Bloqué pour Editor)
   - Champs `image` et `video`
   - URLs de médias considérées comme du contenu visuel

3. **`layout-style`** (Bloqué pour Editor)
   - Champs `dropdown`, `checkbox`, `icon`
   - Tout ce qui concerne la mise en page, le style et le comportement

### Gestion des repeaters (boutons)

Les repeaters sont gérés avec une logique spéciale :
- **Boutons** (`buttons`) : Editor peut modifier `label`, `internalHref`, `externalHref` uniquement
- **Autres repeaters** : Filtrage standard par type de champ

## Stockage

Le rôle est stocké dans `localStorage` avec la clé `user-role`.

```js
localStorage.getItem('user-role') // 'engineer' | 'editor' | 'reviewer'
```

## Migration future vers authentification

Cette architecture a été conçue pour faciliter la migration vers un vrai système d'authentification :

1. **UserContext** : Remplacer `localStorage` par un appel API pour récupérer la session
2. **api-client** : Remplacer le header `x-user-role` par un token JWT/session
3. **api-auth** : Valider le token au lieu de lire un simple header
4. **RoleSelectionDialog** : Remplacer par un formulaire de login

## Composants prêts à l'emploi

- **RoleSelectionDialog** : S'affiche automatiquement si aucun rôle n'est défini
- **RoleBadge** : Affiche le rôle actuel avec un dropdown pour le changer (développement uniquement)

## Restrictions UI implémentées

### Page Sitemap
- Bouton "Nouvelle page" : Visible uniquement pour Engineer
- Icône crayon (renommer) : Visible uniquement pour Engineer et Editor
- Icône poubelle (supprimer) : Visible uniquement pour Engineer
- Lien "Éditer" : Masqué pour Reviewer

### Éditeur visuel

**Toolbar :**
- Bouton "Nouvelle page" : Visible uniquement pour Engineer
- Bouton "Ajouter un bloc" : Visible uniquement pour Engineer et Editor
- Boutons Undo/Redo : Visibles uniquement pour Engineer et Editor
- Bouton "Sauvegarder" : Désactivé pour Reviewer
- Bouton JSON : Masqué pour Editor et Reviewer
- Accès à la page : Bloqué pour Reviewer (message d'erreur)

**Inspectors (panneau de droite) :**
- **BlobInspector** : Filtre les champs par rôle, masque les champs non-éditables pour Editor
- **ItemBlobInspector** : Filtre les champs des items d'itérateur
- **ButtonTooltipInspector** : Filtre les champs des tooltips de boutons
- **RepeaterInspector** : Filtre les champs dans les repeaters (ex: labels de boutons autorisés, style bloqué)
- **ParagraphInspector** : Editor peut modifier le texte, pas l'apparence *(à implémenter)*
- **DividerInspector** : Editor peut modifier le label, pas les options *(à implémenter)*
- **ListInspector** : Editor peut modifier les titres, pas les icônes *(à implémenter)*
- **IteratorInspector** : Editor peut modifier les items, pas le layout *(à implémenter)*

### API Routes protégées
- `POST /api/pages` : Nécessite `create_page`
- `PUT /api/pages/[slug]` : Nécessite `save_changes`
- `PATCH /api/pages/[slug]` : Nécessite `edit_page`
- `DELETE /api/pages/[slug]` : Nécessite `delete_page`

## Développement et test

Pour tester les différents rôles :

1. Cliquez sur le badge de rôle dans la toolbar
2. Sélectionnez le rôle souhaité
3. La page se rechargera avec le nouveau rôle

Pour réinitialiser :
- Cliquez sur "Réinitialiser le rôle" dans le menu du badge
- Ou supprimez la clé `user-role` de `localStorage`

## Implémentation technique - Restrictions de champs

### Fonctions utilitaires (`field-permissions.ts`)

```tsx
// Vérifier si un champ peut être édité
canEditField(role: UserRole | null, fieldType: string, fieldKey?: string): boolean

// Vérifier si un champ dans un repeater peut être édité
canEditRepeaterField(role: UserRole | null, parentKey: string, fieldKey: string, fieldType: string): boolean

// Filtrer une liste de champs pour ne garder que les éditables
filterEditableFields(fields: Record<string, Field>, role: UserRole | null): Partial<Record<string, Field>>

// Catégoriser un champ
getFieldCategory(fieldType: string, fieldKey?: string): 'text-content' | 'media-url' | 'layout-style'
```

### Utilisation dans les inspectors

Tous les inspectors suivent ce pattern :

```tsx
import { useUser } from '@/lib/auth/UserContext'
import { canEditField } from '@/lib/auth/permissions/field-permissions'

export function MyInspector({ data, onUpdate }: Props) {
  const { user } = useUser()

  // Filtrer les champs visibles
  const visibleFields = Object.entries(fields).filter(([key, fieldDef]) => {
    return canEditField(user.role, fieldDef.type, key)
  })

  // Render uniquement les champs éditables
  return visibleFields.map(([key, field]) => renderField(key, field))
}
```

### Inspectors mis à jour

- ✅ **BlobInspector** : Filtre complet par rôle
- ✅ **ItemBlobInspector** : Filtre complet par rôle
- ✅ **ButtonTooltipInspector** : Filtre complet par rôle
- ✅ **RepeaterInspector** : Filtre avec support des repeaters de boutons
- ⏳ **ParagraphInspector** : À implémenter
- ⏳ **DividerInspector** : À implémenter
- ⏳ **ListInspector** : À implémenter
- ⏳ **IteratorInspector** : À implémenter

### Validation API côté serveur

**À implémenter** : Validation des modifications de champs côté serveur pour empêcher le contournement client.

Fichier à créer : `/lib/auth/api-field-validator.ts`

```tsx
// Valider que les modifications respectent les permissions
validateBlockEdits(role: UserRole, oldBlocks: Block[], newBlocks: Block[]): {
  valid: boolean
  violations: string[]
}
```

Intégration dans `PUT /api/pages/[slug]` :
- Charger les blocs existants
- Comparer avec les nouveaux blocs
- Si Editor : vérifier que seuls les champs texte ont changé
- Retourner 403 si violation détectée
