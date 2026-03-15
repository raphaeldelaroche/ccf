# Système de rôles et permissions

## Vue d'ensemble

Le système de permissions permet de contrôler l'accès aux fonctionnalités de l'éditeur et aux champs individuels selon le rôle de l'utilisateur.

**Rôles disponibles** :
- **Engineer** : Accès complet (création, édition, suppression, tous les champs)
- **Editor** : Édition de contenu uniquement (textes, médias URLs) — pas de champs de layout/style
- **Reviewer** : Lecture seule (aucune modification)

## Architecture (`/lib/auth`)

### `types.ts` — Définitions et matrice de permissions

**Types** :
- `UserRole` : `'engineer' | 'editor' | 'reviewer'`
- `Permission` : Liste des permissions disponibles (`'create_page'`, `'edit_page'`, `'delete_page'`, `'access_editor'`, `'save_changes'`, `'edit_advanced_fields'`)
- `User` : `{ role: UserRole }`

**Matrice de permissions** :
```typescript
ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>>
```

| Permission | Engineer | Editor | Reviewer |
|------------|----------|--------|----------|
| create_page | ✅ | ❌ | ❌ |
| edit_page | ✅ | ✅ | ❌ |
| delete_page | ✅ | ❌ | ❌ |
| access_editor | ✅ | ✅ | ✅ |
| save_changes | ✅ | ✅ | ❌ |
| edit_advanced_fields | ✅ | ❌ | ❌ |

**Métadonnées** :
- `ROLE_METADATA` : Labels, descriptions, couleurs pour l'UI
- `ROLE_ICONS` : Emojis associés aux rôles
- `USER_ROLE_STORAGE_KEY` : Clé localStorage (`'user-role'`)

### `permissions.ts` — Fonctions de vérification

**Vérification générique** :
```typescript
hasPermission(role: UserRole, permission: Permission): boolean
```

**Helpers nommés** :
- `canCreatePage(role)`
- `canEditPage(role)`
- `canDeletePage(role)`
- `canAccessEditor(role)`
- `canSaveChanges(role)`

**Messages d'erreur** :
```typescript
getPermissionErrorMessage(permission: Permission): string
```
Retourne des messages en français pour chaque permission refusée.

### `field-permissions.ts` — Permissions au niveau des champs

**Catégories de champs** :
```typescript
type FieldCategory = 'text-content' | 'media-url' | 'layout-style'
```

**Fonctions** :
- `getFieldCategory(fieldType)` — Catégorise un champ selon son type
- `canEditField(role, fieldType)` — Vérifie si un rôle peut éditer un type de champ
  - Engineer : ✅ Tout
  - Editor : ✅ text-content, ✅ media-url, ❌ layout-style
  - Reviewer : ❌ Rien
- `canEditRepeaterField(role, parentKey, fieldKey, fieldType)` — Logique spéciale pour les repeaters
  - Boutons : Editor peut modifier label + URLs uniquement
  - Tooltips : Editor a accès complet
- `filterEditableFields(fields, role)` — Filtre un Record de champs selon les permissions
- `shouldShowField(role, fieldType)` — Détermine si un champ doit être affiché
- `getFieldRestrictionMessage(fieldType)` — Message d'explication pour champs restreints

### `UserContext.tsx` — Context React avec persistance

**Provider** :
```typescript
<UserProvider>
  {children}
</UserProvider>
```

**API du contexte** :
- `user: User | null` — Utilisateur courant
- `setRole(role: UserRole)` — Changer de rôle
- `clearRole()` — Déconnexion
- `hasPermission(permission: Permission)` — Vérifier une permission

**Implémentation** :
- Utilise `useSyncExternalStore` pour éviter les hydration mismatches (SSR/Client)
- Persiste le rôle dans `localStorage` (`user-role`)
- Synchronise automatiquement entre onglets

### `api-auth.ts` / `api-client.ts` — Auth pour les routes API

Helpers pour sécuriser les routes API :
- Validation des permissions côté serveur
- Helpers pour les routes protégées

## Composants UI (`/components/auth`)

### `RoleBadge.tsx`

Badge affichant le rôle courant de l'utilisateur :
- Icône et couleur selon le rôle
- Clic pour ouvrir la dialog de sélection
- État "Non connecté" si aucun rôle

**Usage** :
```tsx
<RoleBadge />
```

### `RoleSelectionDialog.tsx`

Dialog (Radix UI) pour choisir son rôle :
- Liste des 3 rôles avec descriptions
- Cards cliquables avec icône et badge
- Bouton de déconnexion

**Usage** :
```tsx
<RoleSelectionDialog
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

## Intégration dans l'éditeur

### Filtrage des champs dans l'Inspector

```typescript
import { canEditField } from '@/lib/auth/field-permissions'

// Dans BlobInspector.tsx
const isFieldEditable = canEditField(user?.role || 'reviewer', field.type)

// Afficher un message si non éditable
{!isFieldEditable && (
  <p className="text-xs text-muted-foreground">
    {getFieldRestrictionMessage(field.type)}
  </p>
)}
```

### Désactivation conditionnelle des actions

```typescript
import { canSaveChanges, canCreatePage } from '@/lib/auth/permissions'

// Dans NewEditorToolbar.tsx
<Button
  disabled={!canSaveChanges(user?.role)}
  onClick={handleSave}
>
  Enregistrer
</Button>

<Button
  disabled={!canCreatePage(user?.role)}
  onClick={handleCreatePage}
>
  Nouvelle page
</Button>
```

### Masquage des sections selon le rôle

```typescript
// Dans BlobInspector.tsx
const visibleSections = Object.entries(fieldSections).filter(([key, section]) => {
  // Masquer les sections layout/style pour les Editors
  if (user?.role === 'editor') {
    const restrictedSections = ['layout', 'spacing', 'style']
    return !restrictedSections.includes(key)
  }
  return true
})
```

## Workflow typique

### 1. Initialisation de l'app

```tsx
// app/layout.tsx
import { UserProvider } from '@/lib/auth/UserContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
```

### 2. Sélection du rôle

L'utilisateur clique sur `<RoleBadge />` → ouvre `<RoleSelectionDialog />` → choisit un rôle → le rôle est persisté dans localStorage.

### 3. Utilisation dans l'éditeur

```tsx
import { useUser } from '@/lib/auth/UserContext'

function NewEditor() {
  const { user, hasPermission } = useUser()

  if (!hasPermission('access_editor')) {
    return <div>Accès refusé</div>
  }

  // Filtrer les champs éditables
  const editableFields = filterEditableFields(allFields, user?.role)

  // ...
}
```

## Messages d'erreur en français

Tous les messages d'erreur sont en français :
- "Vous n'avez pas la permission de créer des pages"
- "Vous n'avez pas la permission de modifier les pages"
- "Vous n'avez pas la permission de supprimer des pages"
- "Vous n'avez pas la permission d'accéder à l'éditeur"
- "Vous n'avez pas la permission de sauvegarder les modifications"
- "Vous n'avez pas la permission de modifier les champs avancés"

## Cas d'usage

### Engineer (Développeur)
- Accès complet à tous les champs
- Peut créer/modifier/supprimer des pages
- Accès aux features expérimentales (responsive mode, preview)

### Editor (Éditeur de contenu)
- Peut modifier le contenu des pages existantes (textes, images, boutons)
- Ne peut pas créer/supprimer de pages
- Ne peut pas modifier le layout, spacing, style
- Parfait pour les rédacteurs, marketeurs

### Reviewer (Réviseur)
- Lecture seule complète
- Peut voir toutes les pages et leurs configurations
- Ne peut rien modifier ni sauvegarder
- Parfait pour les clients, stakeholders

## Extension

Pour ajouter une nouvelle permission :

1. Ajouter le type dans `types.ts` :
```typescript
export type Permission =
  | 'create_page'
  | 'edit_page'
  | 'my_new_permission' // ← Nouvelle permission
```

2. Mettre à jour la matrice dans `types.ts` :
```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  engineer: { /* ... */, my_new_permission: true },
  editor: { /* ... */, my_new_permission: false },
  reviewer: { /* ... */, my_new_permission: false },
}
```

3. Ajouter un helper dans `permissions.ts` :
```typescript
export function canDoMyNewThing(role?: UserRole): boolean {
  return hasPermission(role || 'reviewer', 'my_new_permission')
}
```

4. Ajouter le message d'erreur dans `permissions.ts` :
```typescript
export function getPermissionErrorMessage(permission: Permission): string {
  const messages: Record<Permission, string> = {
    // ...
    my_new_permission: "Vous n'avez pas la permission de faire cette action",
  }
  return messages[permission]
}
```
