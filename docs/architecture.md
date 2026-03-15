# Architecture du projet

## Structure des fichiers

Le système Blob est organisé en plusieurs couches :

### 0. Système de rôles et permissions (`/lib/auth`)

#### `types.ts` — Définitions et matrice de permissions

* Types : `UserRole` ('engineer' | 'editor' | 'reviewer'), `Permission`, `User`
* `ROLE_PERMISSIONS` : matrice complète `Record<UserRole, Record<Permission, boolean>>` — engineer a tous les droits, editor peut éditer les pages et sauvegarder mais pas créer/supprimer ni modifier les champs avancés, reviewer est en lecture seule
* `ROLE_METADATA` / `ROLE_ICONS` : labels, descriptions, couleurs et emojis pour l'UI
* `USER_ROLE_STORAGE_KEY` : clé localStorage pour la persistance du rôle

#### `permissions.ts` — Fonctions de vérification de permissions

* `hasPermission(role, permission)` — vérification générique
* Helpers nommés : `canCreatePage`, `canEditPage`, `canDeletePage`, `canAccessEditor`, `canSaveChanges`
* `getPermissionErrorMessage(permission)` — messages d'erreur en français

#### `field-permissions.ts` — Permissions au niveau des champs de l'Inspector

* `FieldCategory` : 'text-content' | 'media-url' | 'layout-style'
* `getFieldCategory(fieldType)` — catégorise un champ selon son type
* `canEditField(role, fieldType)` — engineer tout, reviewer rien, editor uniquement les champs texte
* `canEditRepeaterField(role, parentKey, fieldKey, fieldType)` — logique spéciale pour les repeaters (boutons : label + URLs ; tooltips : tout)
* `filterEditableFields(fields, role)` — filtre un Record de champs selon les permissions
* `shouldShowField(role, fieldType)` et `getFieldRestrictionMessage(fieldType)` — pour l'UI

#### `UserContext.tsx` — Context React avec persistance localStorage

* `UserProvider` : fournit `user`, `setRole`, `clearRole`, `hasPermission`
* Utilise `useSyncExternalStore` pour éviter les hydration mismatches (SSR/Client)
* Persiste le rôle dans localStorage (`user-role`)

#### `api-auth.ts` / `api-client.ts` — Auth pour les routes API

**Composants UI** (`/components/auth`) :

* `RoleBadge.tsx` — Badge affichant le rôle courant de l'utilisateur avec icône et couleur ; clic pour ouvrir la dialog de sélection
* `RoleSelectionDialog.tsx` — Dialog (Radix) pour choisir son rôle parmi engineer / editor / reviewer avec descriptions

### 1. Configuration et données (`/lib`)

#### `blob-fields.ts` — Source unique de vérité pour tous les champs

* Définit tous les types de champs (text, dropdown, checkbox, repeater, multiselect, icon, image, video)
* Organise les champs en sections (header, marker, figure, buttons, content, layout, spacing, style, separator, seo)
* Contient les constantes pour les tailles (14 niveaux de xs à 10xl), couleurs (18 thèmes), et icônes
* **Helpers de réutilisation** : `createBlobItemFields()` pour Iterator, `withSharedFieldCondition()` / `withItemFieldCondition()` pour champs conditionnels
* **ShowIf composite** : support du AND logic via `ShowIfCondition[]` pour combiner plusieurs conditions

#### `blob-compatibility.ts` — Matrice de compatibilité et règles de validation

* Définit quelles combinaisons layout/marker/actions sont valides
* Génère un registre de toutes les classes CSS nécessaires
* Gère les contraintes croisées (ex: si marker="left" alors align ne peut être que "left" ou "right" sur layout="stack")
* Fournit des fonctions de validation et de résolution de valeurs valides

#### `blob-compose.ts` — Types responsive et générateur de classes CSS

* Définit les types `ResponsiveProps` et `ResponsiveBreakpointProps` pour le système responsive basé sur objets
* `convertResponsiveToString()` : convertit un objet responsive en chaînes CSS (ex: `{ base: { layout: "stack" }, md: { layout: "row" } }` → `"stack md:row"`)
* Résout les breakpoints en mode mobile-first (`base` sans préfixe, autres avec préfixe)
* Valide les combinaisons via le registre de compatibilité
* Génère la chaîne finale de classes CSS pour le composant

#### `blob-form-mapper.ts` — Mapping formulaire → props du composant

* Transforme les données du formulaire de l'éditeur en props utilisables par le composant Blob
* Construit l'objet `responsive` avec les valeurs de base (xs) et les overrides par breakpoint
* Sépare les données en catégories (blobProps, header, marker, figure, actions, content)
* Marque les propriétés non mappées (background, separator) pour debugging
* Gère la logique de conversion (ex: layout + direction → "stack-reverse")

#### `use-blob-compatibility.ts` — Hook React pour la compatibilité dynamique

* Calcule en temps réel quelles options sont disponibles selon le contexte actuel
* Désactive les options invalides dans les dropdowns
* Fournit des messages d'explication pour les options désactivées

#### `block-definition.ts` — Système d'extensibilité

* Permet de créer des blocs personnalisés basés sur Blob via `BlockDefinition`
* Supporte l'ajout de sections/champs supplémentaires (`extraSections`, `extraFields`)
* Permet de forcer des valeurs par défaut (`defaultValues`) ou initiales (`initialValues`)
* Système de render personnalisé pour chaque type de bloc
* `hideSections` : masquer les sections de base quand le bloc les gère différemment
* **Exemples** : `BlockBlobSection` (wrapper section), `IteratorBlockDefinition` (système de champs partagés)

#### `blob-iterator-definition.ts` — Extension Iterator

* Utilise `BlockDefinition` pour étendre blob-fields avec système de champs par item
* `hideSections` masque toutes les sections de base (gérées via sections partagées dynamiques)
* `generateSharedSections()` crée une section par catégorie, conditionnée sur `itemFields`
* Multiselect `itemFields` pour choisir quels champs sont gérés individuellement par chaque item
* Valeurs par défaut : le contenu (textes, images, boutons) est par item, la forme (layout, style) est partagée

#### `blob-iterator-mapper.ts` — Mapping Iterator

* Transforme les données du formulaire Iterator en props `BlobIterator`
* Logique inversée : un champ dans `itemFields` → valeur de l'item, sinon → valeur partagée
* `buildSharedBlobProps()` extrait les props partagées (tout ce qui n'est pas dans `itemFields`)
* Construit les options Swiper si activées
* Clés du formulaire : `iteratorLayout`, `iteratorGutter` (pour éviter les conflits avec les props Blob)

### Fichiers pour New Editor (`/lib/new-editor`)

#### `block-types.ts` — Types du nouveau système

* Types : `BlockType` ('blob' | 'blobIterator' | 'buttonTooltip' | ...)
* Interface `BlockNode` : `{ id, blockType, data, innerBlocks? }`
* Interface `EditorState` : `{ blocks, selectedBlockId, currentPage }`

#### `block-registry.ts` — Registre des blocs

* Définit tous les types de blocs : Blob, BlobIterator, et blocs custom
* Configuration : label, icon, description, allowedInnerBlocks, sections, defaultValues, initialValues
* Import de `fieldSections` (default export de blob-fields) et définitions des blocs custom
* Le registre Blob utilise toutes les sections de blob-fields (9 sections, 40+ champs)
* Le registre Iterator configure les itemFields par défaut (champs de contenu gérés par item)
* Système extensible : ajouter de nouveaux blocs en suivant le protocole décrit dans "Créer un nouveau bloc custom"

#### `useEditorState.ts` — Hook d'état central

* Gère l'état complet de l'éditeur : blocks, selectedBlockId, pages, isSaving
* CRUD récursif : `handleAddBlock`, `handleDeleteBlock`, `handleMoveBlock`, `handleUpdateBlock`
* Chargement/création/sauvegarde de pages via `/api/pages`
* Auto-save avec debounce 2s

#### `useKeyboardShortcuts.ts` — Hook de raccourcis clavier

* `⌘S` / `Ctrl+S` → sauvegarde manuelle
* `Backspace` / `Delete` → supprime le bloc sélectionné
* Ignore automatiquement les événements quand le focus est dans un champ de saisie

## Flux de données

### BlobEditor

1. **Interaction utilisateur** : sélection d'un bloc dans `BlockTree`, modification d'un champ dans `BlockInspector`
2. **Mise à jour de l'état** : `BlobEditor.handleUpdateBlock()` met à jour `blocks`
3. **Mapping** : `mapBlockWithInnerBlocks()` transforme récursivement les données en props utilisables
4. **Rendu** : `BlockRenderer` construit le composant avec ses `innerBlocks`
5. **Composition CSS** : `composeBlobClasses` génère les classes atomiques
6. **Application** : le navigateur applique les classes CSS et rend la grille

### BlobIterator (dans l'éditeur)

1. **Résolution des champs** : `resolveBlockSections(blobFieldSections, IteratorBlockDefinition)` fusionne Blob + Iterator
2. **Mapping** : `mapIteratorFormData` transforme en `MappedIteratorData`
   * `buildSharedBlobProps()` : extraction des props partagées (tout ce qui n'est pas dans `itemFields`)
   * `buildSwiperOptions()` : construction des options Swiper si activé
   * `mapIteratorItem()` : fusion props partagées + props individuelles pour chaque item
3. **Rendu** : `BlockBlobIterator` mappe `iteratorLayout` → `containerLayout`, `iteratorGutter` → `gutter` et rend via `BlobBlock` × N
4. **Container** : `BlobIterator` applique le layout (grid ou swiper)

## État actuel et évolution

Le code est **en développement actif**. L'API des props et la structure des données peuvent encore changer.

**Ce qui est stable** :

* Le système de compatibilité et sa logique
* Les concepts de classes atomiques et tokens de taille
* L'architecture de l'éditeur

**Ce qui peut évoluer** :

* Les noms des props exactes
* Les options disponibles (nouveaux layouts, markers, etc.)
* La structure des données mappées
* L'organisation des fichiers de style
