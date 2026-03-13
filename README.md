# Blob UI

Un système de composants ultra-modulable pour construire des sections de contenu flexibles et responsives dans Next.js.

## Installation & Base de Données (Vercel & Redis)

Ce projet utilise une base de données **Redis (Vercel KV / Upstash)** pour sauvegarder et synchroniser les pages et les presets entre votre environnement de développement local et votre environnement de production sur Vercel.

### Prérequis

* Node.js & pnpm
* Un compte Vercel (gratuit) avec un projet configuré
* La CLI Vercel (`npm i -g vercel`)

### Configuration du projet



1. **Cloner le projet et installer les dépendances** :

   ```bash
   git clone <votre-repo>
   cd blobui
   pnpm install
   ```
2. **Créer la base de données sur Vercel** :
   * Sur votre tableau de bord Vercel en ligne, allez dans l'onglet **Storage**.
   * Cliquez sur **Create Database**, choisissez **KV (Redis)**, et validez.
3. **Lier votre environnement local à Vercel** :

   ```bash
   npx vercel link
   ```

   *(Acceptez les options par défaut pour lier votre dossier au projet Vercel existant)*
4. **Télécharger les variables d'environnement distantes** :

   ```bash
   npx vercel env pull .env.local
   ```

   *(Ceci créera un fichier* `.env.local` et téléchargera automatiquement la variable `REDIS_URL` nécessaire à la base de données)
5. **Lancer le serveur de développement** :

   ```bash
   pnpm dev
   ```

   *Votre application tournera sur* `http://localhost:3000`. Les pages créées ou modifiées seront instantanément synchronisées avec votre base de données distante Vercel.

## Vue d'ensemble

Blob UI offre trois systèmes principaux :

### 1. **Blob** — Composant individuel

Un composant React unique capable de s'adapter à de nombreux cas d'usage (hero, feature, CTA, testimonial, etc.) grâce à un système de composition basé sur :

* **Un système de layout CSS Grid** avec des combinaisons atomiques layout/marker/actions
* **Une matrice de compatibilité** qui garantit que seules les combinaisons valides de props sont utilisées
* **Un système de tokens responsive** pour gérer la typographie et l'espacement de manière cohérente

### 2. **BlobIterator** — Collections de blobs

Un système de conteneur pour créer des collections de blobs avec :

* **Layouts responsives** : grilles (1-4 colonnes, auto) et swiper/carrousel
* **Système de champs partagés** : par défaut tout est partagé (layout, spacing, style), on liste explicitement les champs gérés par item via `itemFields`
* **Blocs imbriqués dans les items** : Chaque item peut contenir des `innerBlocks` avec profondeur illimitée — les items sont des `BlockNode` complets avec `id`, `blockType`, `data`, `innerBlocks`
* **Optimisation Server/Client** : détection automatique (Server Component pour grilles, Client Component pour swiper)

### 3. **New Editor** — Éditeur de pages (Développement actuel)

**⚠️ Le développement se concentre désormais sur** `/new-editor` — un éditeur dédié au Blob qui résout les limitations de BlockNote pour les blocs imbriqués personnalisés.

#### **New Editor** — `/new-editor` ⚡ **EN TEST**

Un éditeur visuel simplifié et performant construit de zéro pour supporter pleinement les besoins du système Blob :

**Pourquoi un nouvel éditeur ?**

* BlockNote ne supporte pas les "custom nested blocks" (blocs personnalisés avec enfants récursifs)
* Les Blob blocks doivent pouvoir contenir d'autres Blob blocks à profondeur illimitée
* Besoin d'un contrôle total sur la structure hiérarchique et le rendu

**Architecture** :

* **Interface en 3 colonnes** : Sidebar navigation (gauche) + Canvas scrollable (centre) + Inspector scrollable (droite) — chaque colonne défile indépendamment à `100vh - hauteur toolbar`
* **Système de vues** : Sidebar permet de basculer entre deux vues — Éditeur visuel (Canvas + Inspector) et Éditeur JSON (textarea pleine largeur du JSON de la page)
* **Types de blocs** : `Blob`, `BlobIterator` et blocs custom (ex: `ButtonTooltip`) — système extensible
* **Blocs imbriqués récursifs** : Les Blob peuvent contenir d'autres Blob à l'infini via `innerBlocks` — activé via le champ `contentType: "innerBlocks"` dans la section Contenu
* **Hover controls** : Boutons ↑ ↓ + 📋 (dupliquer) + 🗑 cliquables en position absolue sur chaque bloc
* **Inspector dynamique** : Bascule automatiquement entre BlobInspector et IteratorInspector selon le type de bloc sélectionné
* **Zero re-render pattern** : Inputs avec `localValue` state pour éviter les cursor-jumps
* **Lazy mounting** : Les sections accordion ne montent leurs enfants qu'à la première ouverture
* **Système itemFields** : Multiselect pour choisir quels champs sont gérés par item vs partagés (Iterator)
* **Persistance Redis** : Sauvegarde dans Vercel KV via API `/api/pages`
* **Gestion de pages dynamique** : Chargement et création de pages depuis le sitemap
* **Raccourcis clavier** : `⌘S`/`Ctrl+S` pour sauvegarder, `Backspace`/`Delete` pour supprimer le bloc sélectionné, `⌘Z` pour annuler, `⌘⇧Z` pour rétablir
* **Animation de sélection** : Onde `box-shadow` à chaque sélection de bloc, rendue via `createPortal` pour un positionnement correct à toute profondeur d'imbrication

**Architecture fichiers** (`/components/new-editor`) :

* `NewEditor.tsx` : Orchestrateur pur — layout + assemblage des sous-composants
* `NewEditorToolbar.tsx` : Barre d'outils fixe (pages, ajout de blocs, sauvegarde)
* `NewEditorSidebar.tsx` : Sidebar de navigation gauche avec boutons de changement de vue (Éditeur visuel / Éditeur JSON)
* `JsonEditor.tsx` : Éditeur JSON pleine largeur (textarea + bouton Appliquer + gestion d'erreurs de parsing)
* `BlockCanvas.tsx` : Zone de rendu central avec sélection
* `BlockRenderer.tsx` : Rendu récursif des blocs avec proper component usage
* `BlockInspector.tsx` : Switch entre BlobInspector et IteratorInspector
* `BlobInspector.tsx` : 9 sections, 40+ champs Blob
* `IteratorInspector.tsx` : itemFields multiselect + items management
* `BlockHoverControls.tsx` : Contrôles flottants ↑ ↓ + 📋 (dupliquer) + 🗑 + picker d'ajout de bloc
* `BlockPickerPopover.tsx` : Popover de sélection du type de bloc à créer (style slash command)

**Hooks** (`/lib/new-editor`) :

* `useEditorState.ts` : État global, CRUD blocs (ajout, suppression, déplacement, duplication récursive), gestion des pages, auto-save, historique undo/redo (50 snapshots), presse-papiers interne, `handleSetBlocks` (remplacement atomique du tableau de blocs avec commit dans l'historique — utilisé par l'éditeur JSON)
* `useKeyboardShortcuts.ts` : Raccourcis clavier (`⌘S`, `Backspace`/`Delete`, `⌘Z`, `⌘⇧Z`)

**Status** : 🧪 **Phase de test active — Non terminé**

**Ce qui fonctionne** :

* ✅ Création et chargement de pages dynamiques
* ✅ Ajout de blocs Blob et BlobIterator
* ✅ Sélection et navigation entre blocs
* ✅ Édition des props via Inspector (tous les champs)
* ✅ Déplacement de blocs (↑↓), ajout (+), duplication (📋) et suppression (🗑) via hover controls
* ✅ Suppression du bloc sélectionné via `Backspace`/`Delete`
* ✅ Sauvegarde manuelle `⌘S`/`Ctrl+S` et automatique avec debounce (2s)
* ✅ Rendu récursif des innerBlocks
* ✅ Sélecteur de type de contenu (`text` / `innerBlocks`) dans la section Contenu
* ✅ Zone de dépôt pour ajouter le premier bloc imbriqué dans un conteneur vide
* ✅ Utilisation correcte des composants Blob (Marker, Title, etc.)
* ✅ **Système itemFields complet pour BlobIterator** :
  * Multiselect dynamique avec \~50 champs organisés par sections visuelles
  * Héritage inversé : champs partagés par défaut, itemFields liste les exceptions
  * Sections partagées qui apparaissent/disparaissent selon itemFields
  * Support des champs conditionnels avec fusion de contexte (shared + item)
  * Nettoyage automatique des données au toggle itemFields
  * Support de tous les types de champs (text, dropdown, icon, repeater via `RepeaterInspector`)
  * Libellés uniformisés entre Blob et BlobIterator (source unique : blob-fields.ts)
* ✅ Animation d'onde à la sélection de bloc — fonctionne sur les blocs racine et imbriqués via `createPortal`
* ✅ Layout scrollable indépendant pour chaque colonne (sidebar, canvas, inspector)
* ✅ **Picker de type de bloc** : Au lieu de créer un bloc directement, un popover liste les types disponibles (style slash command Notion) — déclenché depuis les hover controls, la zone innerBlocks ou la toolbar
* ✅ **Icônes Lucide** dans le picker, l'inspector et le registre de blocs (type `LucideIcon`)
* ✅ **Copier / Coller un bloc** : Menu contextuel (clic droit) sur chaque bloc avec actions Copier et Coller — presse-papiers interne à la session, fonctionne sur blocs racine et imbriqués
* ✅ **Annuler / Rétablir** : Historique à 50 snapshots, raccourcis `⌘Z` / `⌘⇧Z`, boutons dans la toolbar avec état désactivé ; les éditions de texte sont groupées (debounce 800 ms) pour éviter un snapshot par frappe
* ✅ **Système de vues** : Basculement via la sidebar entre Éditeur visuel (Canvas + Inspector) et Éditeur JSON — l'éditeur JSON affiche le JSON complet de la page dans une textarea monospace, permet l'édition directe, et applique les modifications via le bouton Appliquer ou `⌘S` ; les erreurs de parsing sont affichées inline ; l'application est enregistrée dans l'historique undo/redo
* ✅ **Système de rôles et permissions** : L'éditeur est conscient du rôle de l'utilisateur — les champs de mise en page/style sont masqués pour les Editors, seuls les champs texte sont éditables ; la toolbar affiche le rôle courant via `RoleBadge`


#### **Anciens éditeurs** (À retirer prochainement)

**Note** : `/blob-editor` et `/editor` ont vocation à être retirés une fois `/new-editor` stabilisé.

<details>
<summary><strong>Éditeur Custom (Legacy)</strong> — `/blob-editor`</summary>

Un éditeur visuel complet pour créer et gérer des pages entières avec :

* **Interface en 3 colonnes** : Arborescence (gauche), Aperçu (centre), Inspecteur (droite)
* **Blocs imbriqués** : Support complet des `innerBlocks` avec profondeur illimitée
* **Gestion de pages** : Création, édition, sauvegarde de pages dans `/data/app/`
* **Système de presets** : Sauvegarde et réutilisation de blocs via clic droit
* **Types de blocs** : BlobBlock, BlobSection, BlobIterator
* **Persistance JSON** : Stockage des pages et presets en fichiers JSON
* **Status** : ✅ Fonctionnel et stable (legacy)

</details>

<details>
<summary><strong>Éditeur BlockNote (Abandonné)</strong> — `/editor`</summary>

Migration vers BlockNote.js pour une expérience d'édition plus moderne :

* **Interface** : Éditeur BlockNote (centre) + Inspector (droite)
* **Custom Blocks** : système de custom blocks BlockNote (Alert ✅, Blob ✅, Section ✅)
* **Block Alignment** : système d'alignement par bloc à la Gutenberg (default / wide / full), contrôlable via toolbar flottante et inspecteur
* **Slash Menu** : blocs Alert, Blob et Section insérables via `/` avec aliases
* **Inspector externe** : Tous les champs Blob (40+) éditables via panneau latéral, incluant Figure, Boutons et Séparateur
* **Sections repliables** : Organisation des champs en sections collapsibles
* **Save/Load** : Format natif BlockNote stocké directement en JSON (pas de conversion)
* **Navigation par URL** : `?page=slug` charge automatiquement la page souhaitée

**Status** : 🚧 Prototype fonctionnel, abandonné au profit de `/new-editor`

**Détails techniques archivés** : Voir la section "Anciens éditeurs" ci-dessus pour la documentation complète de `/editor`.

## Architecture du projet

### Fichiers principaux

Le système Blob est organisé en plusieurs couches :

#### 0. Système de rôles et permissions (`/lib/auth`)

`types.ts` — Définitions et matrice de permissions

* Types : `UserRole` ('engineer' | 'editor' | 'reviewer'), `Permission`, `User`
* `ROLE_PERMISSIONS` : matrice complète `Record<UserRole, Record<Permission, boolean>>` — engineer a tous les droits, editor peut éditer les pages et sauvegarder mais pas créer/supprimer ni modifier les champs avancés, reviewer est en lecture seule
* `ROLE_METADATA` / `ROLE_ICONS` : labels, descriptions, couleurs et emojis pour l'UI
* `USER_ROLE_STORAGE_KEY` : clé localStorage pour la persistance du rôle

`permissions.ts` — Fonctions de vérification de permissions

* `hasPermission(role, permission)` — vérification générique
* Helpers nommés : `canCreatePage`, `canEditPage`, `canDeletePage`, `canAccessEditor`, `canSaveChanges`
* `getPermissionErrorMessage(permission)` — messages d'erreur en français

`field-permissions.ts` — Permissions au niveau des champs de l'Inspector

* `FieldCategory` : 'text-content' | 'media-url' | 'layout-style'
* `getFieldCategory(fieldType)` — catégorise un champ selon son type
* `canEditField(role, fieldType)` — engineer tout, reviewer rien, editor uniquement les champs texte
* `canEditRepeaterField(role, parentKey, fieldKey, fieldType)` — logique spéciale pour les repeaters (boutons : label + URLs ; tooltips : tout)
* `filterEditableFields(fields, role)` — filtre un Record de champs selon les permissions
* `shouldShowField(role, fieldType)` et `getFieldRestrictionMessage(fieldType)` — pour l'UI

`UserContext.tsx` — Context React avec persistance localStorage

* `UserProvider` : fournit `user`, `setRole`, `clearRole`, `hasPermission`
* Utilise `useSyncExternalStore` pour éviter les hydration mismatches (SSR/Client)
* Persiste le rôle dans localStorage (`user-role`)

`api-auth.ts` / `api-client.ts` — Auth pour les routes API

**Composants UI** (`/components/auth`) :

* `RoleBadge.tsx` — Badge affichant le rôle courant de l'utilisateur avec icône et couleur ; clic pour ouvrir la dialog de sélection
* `RoleSelectionDialog.tsx` — Dialog (Radix) pour choisir son rôle parmi engineer / editor / reviewer avec descriptions

#### 1. Configuration et données (`/lib`)

`blob-fields.ts` — Source unique de vérité pour tous les champs

* Définit tous les types de champs (text, dropdown, checkbox, repeater, multiselect, icon, image, video)
* Organise les champs en sections (header, marker, figure, buttons, content, layout, spacing, style, separator, seo)
* Contient les constantes pour les tailles (14 niveaux de xs à 10xl), couleurs (18 thèmes), et icônes
* **Helpers de réutilisation** : `createBlobItemFields()` pour Iterator, `withSharedFieldCondition()` / `withItemFieldCondition()` pour champs conditionnels
* **ShowIf composite** : support du AND logic via `ShowIfCondition[]` pour combiner plusieurs conditions

`blob-compatibility.ts` — Matrice de compatibilité et règles de validation

* Définit quelles combinaisons layout/marker/actions sont valides
* Génère un registre de toutes les classes CSS nécessaires
* Gère les contraintes croisées (ex: si marker="left" alors align ne peut être que "left" ou "right" sur layout="stack")
* Fournit des fonctions de validation et de résolution de valeurs valides

`blob-compose.ts` — Générateur de classes CSS

* Parse les valeurs responsive (ex: `"stack md:row lg:bar"`)
* Résout les breakpoints en mode mobile-first
* Valide les combinaisons via le registre de compatibilité
* Génère la chaîne finale de classes CSS pour le composant

`blob-form-mapper.ts` — Mapping formulaire → props du composant

* Transforme les données du formulaire de l'éditeur en props utilisables par le composant Blob
* Sépare les données en catégories (blobProps, header, marker, figure, actions, content)
* Marque les propriétés non mappées (background, separator) pour debugging
* Gère la logique de conversion (ex: layout + direction → "stack-reverse")

`use-blob-compatibility.ts` — Hook React pour la compatibilité dynamique

* Calcule en temps réel quelles options sont disponibles selon le contexte actuel
* Désactive les options invalides dans les dropdowns
* Fournit des messages d'explication pour les options désactivées

`block-definition.ts` — Système d'extensibilité

* Permet de créer des blocs personnalisés basés sur Blob via `BlockDefinition`
* Supporte l'ajout de sections/champs supplémentaires (`extraSections`, `extraFields`)
* Permet de forcer des valeurs par défaut (`defaultValues`) ou initiales (`initialValues`)
* Système de render personnalisé pour chaque type de bloc
* `hideSections` : masquer les sections de base quand le bloc les gère différemment
* **Exemples** : `BlockBlobSection` (wrapper section), `IteratorBlockDefinition` (système de champs partagés)

`blob-iterator-definition.ts` — Extension Iterator

* Utilise `BlockDefinition` pour étendre blob-fields avec système de champs par item
* `hideSections` masque toutes les sections de base (gérées via sections partagées dynamiques)
* `generateSharedSections()` crée une section par catégorie, conditionnée sur `itemFields`
* Multiselect `itemFields` pour choisir quels champs sont gérés individuellement par chaque item
* Valeurs par défaut : le contenu (textes, images, boutons) est par item, la forme (layout, style) est partagée

`blob-iterator-mapper.ts` — Mapping Iterator

* Transforme les données du formulaire Iterator en props `BlobIterator`
* Logique inversée : un champ dans `itemFields` → valeur de l'item, sinon → valeur partagée
* `buildSharedBlobProps()` extrait les props partagées (tout ce qui n'est pas dans `itemFields`)
* Construit les options Swiper si activées
* Clés du formulaire : `iteratorLayout`, `iteratorGutter` (pour éviter les conflits avec les props Blob)

**Fichiers pour New Editor (**`/lib/new-editor`) :

`block-types.ts` — Types du nouveau système

* Types : `BlockType` ('blob' | 'blobIterator' | 'buttonTooltip' | ...)
* Interface `BlockNode` : `{ id, blockType, data, innerBlocks? }`
* Interface `EditorState` : `{ blocks, selectedBlockId, currentPage }`

`block-registry.ts` — Registre des blocs

* Définit tous les types de blocs : Blob, BlobIterator, et blocs custom
* Configuration : label, icon, description, allowedInnerBlocks, sections, defaultValues, initialValues
* Import de `fieldSections` (default export de blob-fields) et définitions des blocs custom
* Le registre Blob utilise toutes les sections de blob-fields (9 sections, 40+ champs)
* Le registre Iterator configure les itemFields par défaut (champs de contenu gérés par item)
* Système extensible : ajouter de nouveaux blocs en suivant le protocole décrit dans "Créer un nouveau bloc custom"

`useEditorState.ts` — Hook d'état central

* Gère l'état complet de l'éditeur : blocks, selectedBlockId, pages, isSaving
* CRUD récursif : `handleAddBlock`, `handleDeleteBlock`, `handleMoveBlock`, `handleUpdateBlock`
* Chargement/création/sauvegarde de pages via `/api/pages`
* Auto-save avec debounce 2s

`useKeyboardShortcuts.ts` — Hook de raccourcis clavier

* `⌘S` / `Ctrl+S` → sauvegarde manuelle
* `Backspace` / `Delete` → supprime le bloc sélectionné
* Ignore automatiquement les événements quand le focus est dans un champ de saisie

**Fichiers Legacy BlobEditor (**`/lib`) :

<details>
<summary>Voir la documentation des fichiers legacy</summary>

`block-registry.ts` — Registre des types de blocs (Legacy)

* Définit tous les types de blocs disponibles (BlobBlock, BlobSection, BlobIterator)
* Configuration centralisée : label, icon, description, allowedInnerBlocks
* Mapping vers les composants de rendu et les mappers
* Validation des blocs autorisés comme enfants

`block-utils.ts` — Utilitaires de manipulation de blocs

* Manipulation immutable : `findBlock()`, `insertBlock()`, `deleteBlock()`, `moveBlock()`
* Navigation : `findBlockPath()`, `findBlockParent()`, `getNextSibling()`
* Validation : `validateBlockStructure()`, `validateBlocks()`
* Helpers : `createBlock()`, `duplicateBlock()`, `flattenBlocks()`

`block-mapper-recursive.ts` — Mapping récursif avec innerBlocks

* `mapBlockWithInnerBlocks()` : Mappe un bloc et ses enfants récursivement
* Support de la profondeur illimitée avec protection contre récursion infinie
* Extension de `MappedBlobData` avec `innerBlocks?: MappedBlockData[]`
* Helpers pour manipuler les blocs mappés

`page-storage.ts` — Persistance des pages

* Stockage dans Redis (Vercel KV) via `/api/pages`
* `listPages()`, `loadPage()`, `savePage()`, `createPage()`, `deletePage()`
* Gestion des métadonnées (createdAt, updatedAt)
* Import/Export de pages

`block-preset-storage.ts` — Persistance des presets de blocs

* Stockage dans `/data/blocks/*.json`
* `listBlockPresets()`, `loadBlockPreset()`, `saveBlockPreset()`
* `createBlockPreset()` : Crée un preset depuis un bloc
* `instantiateBlockFromPreset()` : Instancie un bloc depuis un preset

</details>

#### 2. Composants (`/components/blob` et `/components/blocks`)

**Composants Blob**

`blob.tsx` — Le composant Blob principal

* Pattern compound component : `Blob.Header`, `Blob.Actions`, `Blob.Content`, `Blob.Figure`
* Accepte toutes les props de composition (layout, marker, actions, align, figureWidth, size, spacing, theme)
* Supporte les valeurs responsive pour toutes les props

**Sous-composants** (`marker.tsx`, `title.tsx`, `subtitle.tsx`, `eyebrow.tsx`)

* Composants atomiques avec système de tokens de taille pour cohérence visuelle

**Composants Iterator**

`blob-iterator.tsx` — Container responsif

* Détection automatique Server/Client Component (grille = Server, swiper = Client)
* Parse les valeurs responsive (ex: `"swiper lg:grid-3"`)
* Layouts disponibles : `grid-1` à `grid-4`, `grid-auto`, `swiper`

`blob-grid.tsx` / `blob-swiper.tsx` — Implémentations spécialisées

* `BlobGrid` : Server Component pour les grilles statiques, gap via `blob-gutter-*` → `var(--spacing-section)`
* `BlobSwiper` : Client Component avec Swiper.js (navigation, pagination, autoplay, etc.)
* Prop `gutter` : utilise les mêmes tokens de taille que Blob (via `blob-gutter-*` CSS utilities)

**Composants New Editor** (`/components/new-editor`)

`NewEditor.tsx` — Orchestrateur pur

* Layout 3 colonnes : Sidebar (gauche) + zone principale (centre+droite)
* Assemble `useEditorState`, `useKeyboardShortcuts`, `NewEditorToolbar`, `NewEditorSidebar`, `BlockCanvas`, `BlockInspector`, `JsonEditor`
* Gère l'état de vue (`activeView: 'visual' | 'json'`) en local state — bascule conditionnellement entre Canvas+Inspector et JsonEditor
* Ne contient aucune logique métier — responsabilité unique : composition du layout

`NewEditorToolbar.tsx` — Barre d'outils fixe

* Sélecteur de pages, dialog de création de page, boutons Blob/Iterator, sauvegarde
* Affiche l'heure de dernière sauvegarde

`NewEditorSidebar.tsx` — Sidebar de navigation gauche

* Barre étroite (`w-11`) avec boutons icônes pour changer de vue
* `LayoutTemplate` → vue Éditeur visuel, `Braces` → vue Éditeur JSON
* Bouton actif mis en évidence (`bg-gray-300`), tooltips Radix UI au survol
* Exporte le type `EditorView = 'visual' | 'json'`

`JsonEditor.tsx` — Éditeur JSON pleine largeur

* Affiche `JSON.stringify(blocks, null, 2)` dans une `<textarea>` monospace pleine hauteur
* State local `localJson` + `isDirty` : ne remplace pas les blocs en live mais à la validation explicite
* Synchronise depuis `blocks` uniquement quand `isDirty === false` (respecte les undo/redo de la toolbar)
* Bouton **Appliquer** : parse le JSON, valide que c'est un tableau, appelle `onSetBlocks` (push dans l'historique undo) + `onSave`
* `⌘S`/`Ctrl+S` déclenche Appliquer depuis l'éditeur JSON
* Affiche l'erreur de parsing inline (`AlertCircle` + message `SyntaxError`)

`BlockCanvas.tsx` — Zone de rendu central

* Affiche les blocs avec `BlockRenderer` récursif
* Gestion de la sélection au clic
* Wrapper pour les handlers de déplacement, ajout et suppression

`BlockRenderer.tsx` — Rendu récursif des blocs

* Rend un bloc selon son type (blob ou blobIterator)
* Utilise `mapFormDataToBlob` et `mapIteratorFormData`
* Utilise les composants Blob propres (Marker, Title, Subtitle, etc.)
* Supporte les innerBlocks récursifs
* Intègre `BlockHoverControls` pour chaque bloc
* Animation d'onde `box-shadow` (élément `fixed` via `getBoundingClientRect`) à chaque sélection

`BlockHoverControls.tsx` — Contrôles flottants

* Boutons ↑ ↓ + 🗑 en position absolue sur la gauche
* Visibilité pilotée par état React `isHovered` (pas de `group-hover` CSS) pour rester cliquables
* Contrôle du déplacement, de l'ajout et de la suppression de blocs

`BlockInspector.tsx` — Inspector principal

* Switch entre BlobInspector et IteratorInspector selon blockType
* Affiche "Sélectionnez un bloc" si aucune sélection

`BlobInspector.tsx` — Inspector Blob

* 9 sections collapsibles : Textes, Marqueur, Figure, Boutons, Contenu, Disposition, Espacement, Style, Séparateur
* Utilise `InspectorField` pour les champs standards et `RepeaterInspector` pour les champs `type: "repeater"` (ex: Boutons)
* Couvre les 40+ champs du système Blob

`IteratorInspector.tsx` — Inspector Iterator

* Section Iterator : containerLayout, gapX, gapY
* Section itemFields : multiselect organisé par catégories (En-tête, Marqueur, Figure, Boutons, etc.)
* Section Items : délègue à `RepeaterInspector` avec `ItemBlobInspector` comme `renderContent` — même code path que le champ Boutons
* Handlers pour itemFields checkbox (ajout/suppression de champs avec nettoyage des données)

`ItemBlobInspector.tsx` — Contenu des items Iterator

* Reproduction exacte de la logique `BlobInspector` filtrée sur `itemFields`
* Même ordre `fieldSections`, mêmes `CollapsibleSection`, même `renderField`
* `showIf` évalué sur le contexte fusionné `{ ...sharedData, ...item }`
* Compat calculé sur le même contexte fusionné

`RepeaterInspector.tsx` — Champ répéteur générique

* Label + un bouton trigger par item (ouvre un Popover avec les champs) + bouton Ajouter en bas
* Drag & drop natif HTML5 pour réordonner les items (handle `GripVertical`)
* Boutons Dupliquer et Supprimer par item
* Render prop `renderContent` pour personnaliser le contenu du popover (utilisé par Iterator)
* Utilisé par `BlobInspector` / `ItemBlobInspector` pour tout champ `type: "repeater"`, et par `IteratorInspector` pour la liste des items

`InspectorField.tsx` — Champ atomique

* Types supportés : text, textarea, select, checkbox
* State local `localValue` pour éviter cursor-jumps
* `onChange` appelé directement sans debounce
* Synchronisation via `useEffect([value])`

`CollapsibleSection.tsx` — Section accordion

* Lazy mount : les enfants ne montent qu'à la première ouverture
* Flag `hasBeenOpened` garde les enfants montés après ouverture
* Toggle suivants purement CSS (performance)

**Renderers de blocs (Legacy)** (`/components/blocks`)

<details>
<summary>Voir la documentation des renderers legacy</summary>

`blocks/BlockBlob.tsx` — Renderer Blob par défaut

* Construit le blob complet à partir des données mappées
* Gère le rendu des icônes (construction récursive des objets SVG)
* Rendu conditionnel des sections

`blocks/BlockBlobIterator.tsx` — Renderer Iterator

* Mappe `iteratorLayout` → `containerLayout` et `iteratorGutter` → `gutter` du composant `BlobIterator`
* Fusionne les props partagées avec les props individuelles par item
* Rend chaque item via `BlobBlock`

`blocks/BlockBlobSection.tsx` — Exemple d'extension

* Wrapper `<section>` avec gestion de la largeur du container

</details>

**Composants BlobEditor (Legacy)** (`/components/blob-editor`)

<details>
<summary>Voir la documentation de BlobEditor legacy</summary>

`BlobEditor.tsx` — Orchestrateur principal

* Layout en 3 colonnes (Tree, Canvas, Inspector)
* Gestion d'état : blocks, selectedBlockId, currentPage
* Handlers : add, delete, move, update, saveAsPreset
* Intégration avec les API de pages et presets
* Auto-save indicator et toolbar

`BlockTree.tsx` / `BlockTreeItem.tsx` — Arborescence des blocs

* Affichage hiérarchique avec indentation par niveau
* Menu contextuel (clic droit) avec "Enregistrer comme preset"
* Contrôles : déplacer (↑↓), ajouter (+), supprimer (🗑️)
* Support récursif des innerBlocks
* Expand/collapse des blocs parents

`BlobEditor.tsx` — Orchestrateur principal

* Layout en 3 colonnes (Tree, Canvas, Inspector)
* Gestion d'état : blocks, selectedBlockId, currentPage
* Handlers : add, delete, move, update, saveAsPreset
* Intégration avec les API de pages et presets
* Auto-save indicator et toolbar

`BlockTree.tsx` / `BlockTreeItem.tsx` — Arborescence des blocs

* Affichage hiérarchique avec indentation par niveau
* Menu contextuel (clic droit) avec "Enregistrer comme preset"
* Contrôles : déplacer (↑↓), ajouter (+), supprimer (🗑️)
* Support récursif des innerBlocks
* Expand/collapse des blocs parents

`BlockInspector.tsx` — Configuration du bloc sélectionné

* Réutilise `ControlsSidebar` pour afficher les champs
* Affiche les sections du bloc depuis `BLOCK_REGISTRY`
* Mise à jour en temps réel via `onUpdateBlock`
* Message "Sélectionnez un bloc" si aucune sélection

`BlockCanvas.tsx` — Aperçu visuel

* Zone centrale de prévisualisation
* Rendu en temps réel via `BlockListRenderer`
* Sélection de bloc au clic
* Indicateur visuel du bloc sélectionné (ring bleu)

`BlockRenderer.tsx` — Rendu récursif des blocs

* `BlockRenderer` : Rend un bloc avec ses innerBlocks
* `BlockListRenderer` : Rend une liste de blocs
* Support de la récursion illimitée
* Gestion des erreurs de rendu
* Wrapper avec data-attributes pour sélection

`SaveBlockPresetDialog.tsx` — Dialog de sauvegarde de preset

* Formulaire : nom, description, use case, tags
* Génération automatique du slug depuis le nom
* Validation et feedback utilisateur
* Appel API `/api/block-presets` pour sauvegarder

</details>

**Composants éditeur BlockNote** (`/components/editor`)

`Editor.tsx` — Orchestrateur de l'éditeur BlockNote

* Crée l'instance BlockNote via `useCreateBlockNote` avec le schema custom
* Gestion des pages (load, save, create) et navigation par URL (`?page=slug`)
* Enveloppe `<BlockNoteView>` et `<Inspector>` dans `<BlockSelectionProvider>`
* Slash Menu custom : blocs `alert` et `blob` ajoutés aux items par défaut

`block-selection-context.tsx` — Context de sélection partagé

* Expose `selectedBlock` (state React), `propsRef` (props sans re-render) et `selectedIdRef` (id courant, closure-safe)
* Permet au render du custom block `blob` de mettre à jour l'inspector directement dans `onMouseDown`, sans attendre `onSelectionChange`
* `handleSetSelectedBlock` met à jour `propsRef` et `selectedIdRef` atomiquement avec le state

`Inspector.tsx` — Panneau inspector latéral

* Consomme `BlockSelectionContext` — pas de state local propre
* `onSelectionChange` reste le fallback pour la navigation clavier et les blocs inline
* `handleUpdateProp` n'appelle jamais `setState` — uniquement `propsRef.current = ...` + `editor.updateBlock()` pour éviter les re-renders en cascade pendant la frappe

`BlobInspector.tsx` — Formulaire complet des props Blob

* 9 sections collapsibles couvrant les 40+ champs du système Blob
* Utilise `InspectorField` comme brique de base

`InspectorField.tsx` — Champ atomique de l'inspector

* Supporte : `text`, `textarea`, `select`, `checkbox`
* State local `localValue` garde l'input contrôlé (pas de cursor-jump)
* `onChange` appelé directement à chaque keystroke — aucun debounce
* `useEffect([value])` synchronise `localValue` uniquement lors d'un changement de bloc sélectionné (guard `value !== localValue`)

`CollapsibleSection.tsx` — Section accordéon de l'inspector

* **Lazy mount** : les enfants ne sont pas montés avant la première ouverture (`hasBeenOpened`)
* Une fois ouverts, les enfants restent montés — les toggles suivants sont purement CSS
* Réduit le coût du premier rendu de l'inspector de \~40 composants à \~5

#### 3. Styles (`/styles`)

`blob.css` — Point d'entrée CSS principal

* Import des autres fichiers CSS (blob-composed, blob-size)
* Définit la grille CSS de base avec les slots nommés (marker, header, actions, content, figure)
* Utilitaires d'alignement (`blob-align-*`)
* Utilitaires de largeur de figure (`blob-figure-w-*`)
* Système de figure bleed (4 variantes selon la direction du layout)
* Safelist Tailwind v4 pour préserver les variantes responsive

`blob-composed.css` — Classes atomiques de layout

* Une classe CSS par combinaison valide de layout/marker/actions
* Chaque classe définit : grid-template-areas, grid-template-columns, grid-template-rows
* Système de suppression dynamique des slots vides via `:not(:has(...))`
* Environ 25 classes générées couvrant toutes les combinaisons valides

`blob-size.css` — Système de tokens de taille

* 14 échelles de taille (xs à 10xl)
* Chaque taille définit \~15 variables CSS : typographie (eyebrow, heading, body, lead), média (width, height, icon), actions (gap, button height/padding/font), espacement (section gap, padding)
* Utilitaires pour surcharger individuellement (gutter, paddingX, paddingY)
* Logique spéciale pour le variant "ghost" du marker (multiplicateur 1.5x)

## Concepts clés

### Classes atomiques composées

Contrairement aux approches traditionnelles qui combinent plusieurs classes CSS, Blob UI génère **une seule classe par combinaison** layout/marker/actions.

Par exemple : `blob-row-marker-left-actions-after` est une classe unique qui définit toute la structure de grille pour cette configuration spécifique.

**Pourquoi ?** Les variables CSS ne s'écrasent pas bien avec les breakpoints responsive. Une classe atomique par breakpoint élimine ce problème.

### Normalisation des noms de classes

Pour réduire le nombre de classes CSS nécessaires, les valeurs par défaut sont omises du nom :

* `marker="top"` n'ajoute pas `-marker-top` (c'est le défaut)
* `actions="before"` n'ajoute pas `-actions-before` (c'est le défaut)

Ainsi, `blob-stack` = layout stack + marker top + actions before.

### Système de compatibilité

Chaque layout définit :

* Quels markers sont supportés (ex: "row" ne supporte que "top")
* Si les actions sont supportées (ex: "bar" ne supporte pas les actions)
* Quels alignements sont valides
* Si figureWidth est supporté (uniquement sur row/row-reverse)

Des **contraintes croisées** existent aussi : sur layout="stack", si marker="left" ou "right", alors align ne peut être que "left" ou "right" (pas "center").

Le registre de compatibilité est **pré-généré** au build, ce qui permet des validations rapides à runtime.

### Valeurs responsive

Toutes les props de composition acceptent une syntaxe responsive :

```typescript
layout="stack md:row lg:bar"
marker="top md:left"
align="center md:left"
figureWidth="md:1-2 lg:1-3"
size="md lg:xl"
paddingX="container-md lg:container-lg"
```

Le système parse ces chaînes, résout les breakpoints en mode mobile-first (les valeurs se propagent), et génère les classes appropriées pour chaque breakpoint.

### Paddings dynamiques (Container Mode)

La propriété `paddingX` supporte deux valeurs spéciales : `container-md` et `container-lg`.
Contrairement aux tokens de taille classiques (ex: `xl`, `2xl`), ces utilitaires calculent dynamiquement une marge intérieure (padding) afin que le contenu s'aligne exactement sur une largeur maximale, tout en permettant au fond (background) de s'étendre sur toute la largeur de l'écran (approche "full-bleed").

* `container-md` : Contraint le contenu à `max-w-4xl` (56rem / 896px)
* `container-lg` : Contraint le contenu à `max-w-7xl` (80rem / 1280px)

**Le grand avantage** : Lorsque combiné avec `figureBleed="full"`, le calcul natif des marges CSS annule exactement ce padding, permettant à l'image de s'échapper en dehors du "container" virtuel pour aller toucher le bord de l'écran, sans aucune classe de surpassement complexe.

### Système de tokens de taille

Au lieu de définir manuellement font-size, spacing, etc., on utilise un token de taille unique (ex: `size="xl"`).

Ce token définit automatiquement **toutes les variables** : taille du heading, du body, de l'eyebrow, des boutons, du marker, des gaps, du padding, etc.

Résultat : cohérence visuelle garantie et changements de taille en une seule prop.

### Suppression dynamique des slots

Le CSS utilise `:not(:has(> [data-slot="marker"]))` pour détecter si un slot est rendu. Si absent, il est automatiquement retiré de la grille.

Cela permet d'utiliser le même composant Blob sans avoir à gérer manuellement les layouts conditionnels.

### Système de blocs extensibles

`BlockDefinition` permet de créer des variantes de Blob avec :

* Des champs supplémentaires spécifiques au bloc (`extraSections`, `extraFields`)
* Des valeurs forcées ou initiales (`defaultValues`, `initialValues`)
* Des restrictions d'options (whitelist de certaines valeurs)
* Un renderer personnalisé

**Exemples concrets** :

* `BlockBlobSection` : ajoute un champ `containerWidth` (center/wide/full)
* `IteratorBlockDefinition` : masque les sections de base via `hideSections`, ajoute iterator + itemConfig + sections partagées dynamiques + items

### Système de champs partagés (Iterator)

Le BlobIterator introduit un système de partage intelligent pour les collections :

**Principe** : Par défaut, tout est **partagé** (layout, spacing, style, structure). On liste explicitement les champs gérés **par item** via `itemFields`.

**Multiselect** `itemFields` organisé par sections :

```
──── EN-TÊTE ────
  ↳ Titre, Texte d'emphase, Sous-titre, Eyebrow, Thème eyebrow
──── MARQUEUR ────
  ↳ Contenu, Icône, Position, Style, Taille, Thème, Forme
──── FIGURE ────
  ↳ Type, Image, Vidéo, Largeur, Débordement
──── BOUTONS ────
  ↳ Boutons, Position des boutons
──── CONTENU ────
  ↳ Texte, Taille de police
──── DISPOSITION ────
  ↳ Taille, Type de disposition, Direction, Alignement
──── ESPACEMENT ────
  ↳ Padding X, Padding Y, Gutter
──── STYLE ────
  ↳ Thème de couleur, Apparence
```

**Valeurs par défaut** : Le contenu (textes, images, boutons) est géré par item. La forme (layout, spacing, style) est partagée.

**Sections dynamiques** : `generateSharedSections()` crée automatiquement une section accordion par catégorie, dont les champs ne s'affichent que s'ils ne sont pas dans `itemFields`.

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

## Notes pour les contributeurs

### Blob

* **Modifier la compatibilité** : éditer `COMPATIBILITY` dans `blob-compatibility.ts`, puis regénérer le registre
* **Ajouter un layout** : ajouter à `LAYOUTS`, définir son entrée dans `COMPATIBILITY`, créer la classe CSS dans `blob-composed.css`
* **Ajouter un champ** : l'ajouter dans `fieldSections` de `blob-fields.ts`, gérer le mapping dans `blob-form-mapper.ts`
* **Modifier les tokens de taille** : éditer les variables dans `blob-size.css`

### Iterator

* **Ajouter un champ partageable** :

  
  1. Marquer le champ comme `inheritable: true` dans `blob-fields.ts` pour qu'il apparaisse dans le multiselect `itemFields`
  2. Le champ sera automatiquement pris en charge par `generateItemFieldsOptions()`, `generateSharedSections()` et `withSharedFieldCondition()`
  3. Gérer dans `buildSharedBlobProps()` et `mapIteratorItem()` de `blob-iterator-mapper.ts`
* **Modifier les valeurs par défaut** : éditer `initialValues.itemFields` dans `blob-iterator-definition.ts`

### Créer un nouveau bloc custom

Le système supporte la création de blocs custom indépendants (comme `ButtonTooltip`) qui peuvent être ajoutés n'importe où dans l'éditeur, au même titre que `Blob` et `BlobIterator`.

#### Protocole de création en 8 étapes

**Exemple concret** : Création d'un bloc `ButtonTooltip` - un répéteur de boutons avec tooltips.

##### 1. Définir le type de bloc

**Fichier** : `/lib/new-editor/block-types.ts`

```typescript
export type BlockType = 'blob' | 'blobIterator' | 'buttonTooltip';
```

##### 2. Créer les définitions de champs

**Fichier** : `/lib/button-tooltip-fields.ts` (nouveau)

```typescript
import type { FieldSection } from './blob-fields'

export const buttonTooltipFields: Record<string, FieldSection> = {
  tooltips: {
    label: "Tooltips",
    fields: {
      tooltips: {
        type: "repeater",
        label: "Liste des tooltips",
        fields: {
          label: { type: "text", label: "Label du bouton" },
          content: { type: "textarea", label: "Contenu du tooltip" },
          linkLabel: { type: "text", label: "Label du lien (optionnel)" },
          linkUrl: { type: "text", label: "URL du lien (optionnel)" },
        },
      },
    },
  },
  configuration: {
    label: "Configuration",
    fields: {
      layout: {
        type: "dropdown",
        label: "Disposition",
        options: { horizontal: "Horizontale", vertical: "Verticale" },
      },
      spacing: { /* ... */ },
      align: { /* ... */ },
    },
  },
  buttonStyle: {
    label: "Style des boutons",
    fields: {
      variant: { /* ... */ },
      size: { /* ... */ },
    },
  },
}
```

**Types de champs disponibles** : `text`, `textarea`, `dropdown`, `checkbox`, `repeater`, `multiselect`, `icon`, `image`, `video`

##### 3. Créer la fonction mapper

**Fichier** : `/lib/button-tooltip-mapper.ts` (nouveau)

```typescript
import type { FormDataValue } from '@/types/editor'

export interface TooltipItem {
  label: string
  content: string
  linkLabel?: string
  linkUrl?: string
}

export interface MappedButtonTooltipData {
  layout: string
  spacing: string
  align: string
  variant: string
  size: string
  tooltips: TooltipItem[]
}

export function mapButtonTooltipFormData(
  formData: ButtonTooltipFormData
): MappedButtonTooltipData {
  const rawTooltips = parseJsonField<any[]>(formData.tooltips, [])

  const tooltips: TooltipItem[] = rawTooltips.map((item) => ({
    label: item?.label || "",
    content: item?.content || "",
    linkLabel: item?.linkLabel || undefined,
    linkUrl: item?.linkUrl || undefined,
  }))

  return {
    layout: formData.layout || "horizontal",
    spacing: formData.spacing || "md",
    align: formData.align || "left",
    variant: formData.variant || "default",
    size: formData.size || "default",
    tooltips,
  }
}
```

##### 4. Créer le composant React

**Fichier** : `/components/blocks/BlockButtonTooltip.tsx` (nouveau)

```typescript
import { MappedButtonTooltipData } from '@/lib/button-tooltip-mapper'
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { Button } from '@/components/ui/button'

export function BlockButtonTooltip({ data }: { data: MappedButtonTooltipData }) {
  const { layout, spacing, align, variant, size, tooltips } = data

  return (
    <div className={/* classes basées sur layout, spacing, align */}>
      <TooltipPrimitive.Provider delayDuration={0}>
        {tooltips.map((item, index) => (
          <TooltipPrimitive.Root key={index}>
            <TooltipPrimitive.Trigger asChild>
              <Button variant="outline" size={size as any}>
                {item.label || `Bouton ${index + 1}`}
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipContent>
              <p>{item.content}</p>
              {item.linkLabel && item.linkUrl && (
                <Link href={item.linkUrl}>{item.linkLabel} →</Link>
              )}
            </TooltipContent>
          </TooltipPrimitive.Root>
        ))}
      </TooltipPrimitive.Provider>
    </div>
  )
}
```

##### 5. Créer l'inspecteur

**Fichier** : `/components/new-editor/ButtonTooltipInspector.tsx` (nouveau)

```typescript
import { InspectorField } from "./InspectorField"
import { CollapsibleSection } from "./CollapsibleSection"
import { RepeaterInspector } from "./RepeaterInspector"
import { buttonTooltipFields } from "@/lib/button-tooltip-fields"

export function ButtonTooltipInspector({ data, onUpdate }) {
  const handleChange = (key: string, value: FormDataValue) => {
    onUpdate({ [key]: value })
  }

  return (
    <div>
      {Object.entries(buttonTooltipFields).map(([sectionKey, section]) => (
        <CollapsibleSection key={sectionKey} title={section.label}>
          <div className="pt-3 space-y-3">
            {Object.entries(section.fields).map(([fieldKey, fieldDef]) => {
              if (fieldDef.type === "repeater") {
                return (
                  <RepeaterInspector
                    key={fieldKey}
                    label={fieldDef.label}
                    value={JSON.stringify(data[fieldKey] || [])}
                    fields={fieldDef.fields}
                    onChange={(v) => handleChange(fieldKey, JSON.parse(v))}
                  />
                )
              }

              return (
                <InspectorField
                  key={fieldKey}
                  label={fieldDef.label}
                  value={data[fieldKey] || ""}
                  type={fieldDef.type}
                  options={fieldDef.options}
                  onChange={(v) => handleChange(fieldKey, v)}
                />
              )
            })}
          </div>
        </CollapsibleSection>
      ))}
    </div>
  )
}
```

##### 6. Enregistrer le bloc

**Fichier** : `/lib/new-editor/block-registry.ts`

```typescript
import { HelpCircle } from 'lucide-react'
import { buttonTooltipFields } from '@/lib/button-tooltip-fields'

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  // ... blob, blobIterator

  buttonTooltip: {
    label: 'Button Tooltip',
    icon: HelpCircle,
    description: 'Boutons avec tooltips interactifs',
    allowedInnerBlocks: [], // Pas de blocs imbriqués
    sections: buttonTooltipFields,
    initialValues: {
      layout: 'horizontal',
      spacing: 'md',
      align: 'left',
      variant: 'default',
      size: 'default',
      tooltips: '[]',
    },
  },
}
```

##### 7. Intégrer dans l'inspecteur de l'éditeur

**Fichier** : `/components/new-editor/BlockInspector.tsx`

```typescript
import { ButtonTooltipInspector } from './ButtonTooltipInspector'

export function BlockInspector({ selectedBlock, onUpdateBlock }) {
  // ...
  return (
    <ScrollArea>
      {selectedBlock.blockType === "blob" && <BlobInspector ... />}
      {selectedBlock.blockType === "blobIterator" && <IteratorInspector ... />}
      {selectedBlock.blockType === "buttonTooltip" && (
        <ButtonTooltipInspector
          data={selectedBlock.data}
          onUpdate={handleUpdate}
        />
      )}
    </ScrollArea>
  )
}
```

##### 8. Intégrer dans les renderers

**Fichier** : `/components/new-editor/BlockRenderer.tsx` (éditeur)

```typescript
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"

const renderBlockContent = () => {
  // ... cas blob, blobIterator

  if (block.blockType === "buttonTooltip") {
    const mappedData = mapButtonTooltipFormData(block.data)
    return <BlockButtonTooltip data={mappedData} />
  }
}
```

**Fichier** : `/lib/render-page-blocks.tsx` (pages publiques)

```typescript
import { mapButtonTooltipFormData } from "@/lib/button-tooltip-mapper"
import { BlockButtonTooltip } from "@/components/blocks/BlockButtonTooltip"

export function renderBlock(block: BlockNode): React.ReactNode {
  switch (block.blockType) {
    // ... cas blob, blobIterator

    case "buttonTooltip": {
      const mappedData = mapButtonTooltipFormData(block.data)
      return <BlockButtonTooltip key={block.id} data={mappedData} />
    }
  }
}
```

#### Résumé des fichiers

**Nouveaux fichiers (4)** :
- `/lib/[block-name]-fields.ts` - Définitions des champs
- `/lib/[block-name]-mapper.ts` - Transformation FormData → Props
- `/components/blocks/Block[Name].tsx` - Composant React de rendu
- `/components/new-editor/[Name]Inspector.tsx` - Interface d'édition

**Fichiers modifiés (4)** :
- `/lib/new-editor/block-types.ts` - Ajout du type
- `/lib/new-editor/block-registry.ts` - Enregistrement du bloc
- `/components/new-editor/BlockInspector.tsx` - Routing de l'inspecteur
- `/lib/render-page-blocks.tsx` + `/components/new-editor/BlockRenderer.tsx` - Rendu

#### Principes clés

- **Champs répéteurs** : Stockent les données en JSON string `"[{...},{...}]"`
- **Mapper** : Transforme les données plates du formulaire en props structurées
- **Inspector** : Utilise `RepeaterInspector` pour les champs de type `repeater`
- **Deux renderers** : Un pour l'éditeur (`BlockRenderer.tsx`), un pour les pages publiques (`render-page-blocks.tsx`)
- **Type safety** : Définir des interfaces TypeScript pour `FormData` et `MappedData`

Le système est conçu pour que chaque partie soit **indépendante** : source unique de vérité (champs), mappers découplés, composants réutilisables.

### BlobEditor (Legacy)

* **Ajouter un type de bloc** : Ajouter une entrée dans `BLOCK_REGISTRY` avec label, icon, mapper, render, et `allowedInnerBlocks`
* **Modifier les blocs autorisés** : Éditer la propriété `allowedInnerBlocks` dans la définition du bloc
* **Personnaliser l'interface** : Les composants de l'éditeur sont modulaires et peuvent être utilisés indépendamment
* **Étendre les presets** : Le système de presets est extensible via les API `/api/block-presets`

## Utilisation pratique

### BlobIterator - Exemples de code

#### Grille simple (Server Component)

```tsx
import { BlobIterator } from "@/components/blob/blob-iterator"
import { Blob } from "@/components/blob/blob"

export default function FeaturesSection() {
  return (
    <BlobIterator containerLayout="grid-3" gutter="xl">
      {features.map((feature) => (
        <Blob key={feature.id} layout="stack" size="md" className="card">
          <Marker rounded>{feature.icon}</Marker>
          <Blob.Header>
            <Title>{feature.title}</Title>
            <Subtitle>{feature.description}</Subtitle>
          </Blob.Header>
        </Blob>
      ))}
    </BlobIterator>
  )
}
```

#### Carrousel (Client Component automatique)

```tsx
<BlobIterator
  containerLayout="swiper"
  gutter="lg"
  swiperOptions={{
    navigation: true,
    pagination: { clickable: true },
    autoplay: { delay: 5000 },
  }}
>
  {testimonials.map((testimonial) => (
    <Blob key={testimonial.id} layout="stack" align="center" size="lg" className="glassmorphism">
      <Blob.Header>
        <Title>{testimonial.quote}</Title>
        <Subtitle>{testimonial.author}</Subtitle>
      </Blob.Header>
    </Blob>
  ))}
</BlobIterator>
```

#### Responsive : Swiper mobile, Grid desktop

```tsx
<BlobIterator
  containerLayout="swiper lg:grid-4"
  gutter="md lg:xl"
  swiperOptions={{ navigation: true }}
>
  {products.map((product) => (
    <Blob key={product.id} layout="stack" size="md">
      <Blob.Figure>
        <Image src={product.image} alt={product.name} />
      </Blob.Figure>
      <Blob.Header>
        <Title>{product.name}</Title>
        <Subtitle>{product.price}</Subtitle>
      </Blob.Header>
    </Blob>
  ))}
</BlobIterator>
```

**Layouts disponibles** : `grid-1`, `grid-2`, `grid-3`, `grid-4`, `grid-auto` (Server Component), `swiper` (Client Component)

**Options Swiper** : Le composant accepte toutes les [options Swiper.js](https://swiperjs.com/swiper-api) via la prop `swiperOptions`.


## Getting Started

Pour lancer le projet en développement :

```bash
pnpm dev
```

**New Editor (Développement actuel)** : <http://localhost:3000/new-editor>

**Anciens éditeurs** :

* BlobEditor (Legacy) : <http://localhost:3000/blob-editor>
* BlockNote Editor (Abandonné) : <http://localhost:3000/editor>


