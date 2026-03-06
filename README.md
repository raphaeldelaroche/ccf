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
   *(Ceci créera un fichier `.env.local` et téléchargera automatiquement la variable `REDIS_URL` nécessaire à la base de données)*

5. **Lancer le serveur de développement** :
   ```bash
   pnpm dev
   ```
   *Votre application tournera sur `http://localhost:3000`. Les pages créées ou modifiées seront instantanément synchronisées avec votre base de données distante Vercel.*

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
* **Optimisation Server/Client** : détection automatique (Server Component pour grilles, Client Component pour swiper)

### 3. **BlobEditor** — Éditeurs de pages

Deux implémentations d'éditeur sont disponibles :

#### **Éditeur Custom (Stable)** — `/blob-editor`

Un éditeur visuel complet pour créer et gérer des pages entières avec :

* **Interface en 3 colonnes** : Arborescence (gauche), Aperçu (centre), Inspecteur (droite)
* **Blocs imbriqués** : Support complet des `innerBlocks` avec profondeur illimitée
* **Gestion de pages** : Création, édition, sauvegarde de pages dans `/data/app/`
* **Système de presets** : Sauvegarde et réutilisation de blocs via clic droit
* **Types de blocs** : BlobBlock, BlobSection, BlobIterator
* **Persistance JSON** : Stockage des pages et presets en fichiers JSON
* **Status** : ✅ Fonctionnel et stable

#### **Éditeur BlockNote (En développement)** — `/editor`

Migration vers BlockNote.js pour une expérience d'édition plus moderne :

* **Interface** : Éditeur BlockNote (centre) + Inspector (droite)
* **Custom Blocks** : système de custom blocks BlockNote (Alert ✅, Blob ✅, Section ✅)
* **Block Alignment** : système d'alignement par bloc à la Gutenberg (default / wide / full), contrôlable via toolbar flottante et inspecteur
* **Slash Menu** : blocs Alert, Blob et Section insérables via `/` avec aliases
* **Inspector externe** : Tous les champs Blob (40+) éditables via panneau latéral, incluant Figure, Boutons et Séparateur
* **Sections repliables** : Organisation des champs en sections collapsibles
* **Save/Load** : Format natif BlockNote stocké directement en JSON (pas de conversion)
* **Navigation par URL** : `?page=slug` charge automatiquement la page souhaitée

**Status** : 🚧 Prototype fonctionnel, base saine

**Ce qui fonctionne** :
- ✅ Sélecteur de pages : affiche slug + titre correctement (`listPagesWithMeta`)
- ✅ Création et chargement de pages
- ✅ Navigation par URL : `/editor?page=slug` charge automatiquement la page au mount, et l'URL se met à jour lors des changements de page
- ✅ Sauvegarde fonctionnelle (PUT `/api/pages/{slug}`) — payload partiel accepté via merge côté serveur
- ✅ Format de stockage natif BlockNote (`type/props/content/children`) — pas de conversion intermédiaire
- ✅ Blocs natifs (paragraph, heading, etc.) sauvegardés et rechargés fidèlement avec leur contenu texte
- ✅ Custom block `alert` (info/warning/error/success) avec contenu inline éditable — visible dans le Slash Menu
- ✅ Custom block `blob` (40+ props) activé dans le schema et insérable via le Slash Menu
- ✅ Custom block `section` : bloc atomique avec alignement contrôlable (default/wide/full), hauteur fixe et background gris (placeholder v1)
- ✅ Block alignment Gutenberg-style : chaque bloc reçoit une largeur `default` (max-w-4xl) via CSS global, les blocs Section peuvent s'élargir en `wide` (max-w-7xl) ou `full` (pleine largeur) via un attribut `data-block-alignment`
- ✅ Toolbar flottante d'alignement : 3 boutons icônes au-dessus du bloc sélectionné, réutilisable par tout custom block
- ✅ Inspecteur Section : panneau droit avec dropdown d'alignement, synchronisé avec la toolbar
- ✅ Inspector externe avec tous les champs Blob
- ✅ Sections repliables (Textes, Marqueur, Figure, Boutons, Contenu, Disposition, Espacement, Style, Séparateur, SEO)
- ✅ Schema JSON `data/schemas/block.schema.json` aligné sur le format BlockNote natif
- ✅ Inputs text : mise à jour instantanée sans debounce, zéro re-render sur l'arbre inspector
- ✅ Sélection du bloc Blob : inspector et outline BlockNote au **premier clic**
- ✅ Chargement de l'inspector : lazy mount des sections (performance initiale divisée par ~8)

**Décisions architecturales prises** :
- Le format de persistance de `/editor` est le **format natif BlockNote** (`type/props/content/children`), pas le format `BlockNode` du blob-editor (`blockType/data/innerBlocks`). Les deux formats coexistent dans `data/app/` sans problème pour l'instant.
- `PageSchema` (Zod) accepte `blocks: z.array(z.unknown())` — la validation fine des blocs est laissée à BlockNote lui-même.
- `PUT /api/pages/{slug}` fonctionne avec des payloads partiels : il charge la page existante, merge le body, puis valide et sauvegarde.
- **Convention `propSchema` blob-block** : utiliser `""` (chaîne vide) comme valeur par défaut pour les props qui se mappent vers `undefined` dans la couche Blob (ex: `direction`, `actions`). Le mapper applique déjà un fallback `|| "default"` / `|| "after"`, et `""` est falsy — la chaîne `"default"` ne doit jamais être passée directement car elle n'est pas une `Action` valide.
- **Thème visuel** : l'éditeur utilise `@blocknote/shadcn` (pas `@blocknote/mantine`) pour s'intégrer avec le design system shadcn/ui du projet. La police est imposée via `--bn-font-family: var(--font-jakarta)` sur `.bn-container`, et les styles de reset BlockNote sont neutralisés via `.bn-default-styles { all: revert }`.
- **Détection du bloc sélectionné dans l'Inspector** : `editor.getSelection()` est utilisé en priorité (capte les blocs `content: "none"` comme le blob), avec fallback sur `editor.getTextCursorPosition()` pour les blocs inline.
- **`BlockSelectionContext`** (`components/editor/block-selection-context.tsx`) : context React partagé entre `Editor`, `Inspector` et le render du custom block `blob`. Expose `selectedBlock` (state), `propsRef` (props sans re-render), et `selectedIdRef` (id courant, closure-safe). Permet au render du bloc blob d'appeler `setSelectedBlock` directement dans `onMouseDown` — l'inspector se met à jour **dans le même tick que le clic**, sans attendre la chaîne `onSelectionChange → setState → re-render`. `onSelectionChange` reste le fallback pour la navigation clavier et les blocs inline.
- **Inputs sans debounce** : `InspectorField` appelle `onChange` directement à chaque keystroke. Le state local `localValue` garde l'input contrôlé. `handleUpdateProp` dans `Inspector` ne déclenche **aucun `setState`** — seulement `propsRef.current = ...` puis `editor.updateBlock()`. L'arbre `BlobInspector` et ses ~40 `InspectorField` restent complètement stables pendant la frappe.
- **Lazy mount des sections** : `CollapsibleSection` ne monte ses enfants que lors de la **première ouverture** (`hasBeenOpened`). Une fois ouverte, la section reste montée et le toggle suivant est purement CSS. Réduit le coût du premier rendu de l'inspector de ~40 composants à ~5 (la seule section `defaultOpen={true}`).
- **Sélection atom au premier clic** : les blocs `content: "none"` sont des nœuds atoms ProseMirror. Au premier clic (éditeur non focusé), ProseMirror place le curseur *autour* de l'atom et non *dessus*. Fix : `onMouseDown` intercepte le clic, dispatch une `NodeSelection` explicite via `_tiptapEditor.view`, et appelle `e.preventDefault()` pour empêcher le navigateur de reset la sélection.

**Problèmes connus** :
- ⚠️ Boutons individuels non éditables dans l'Inspector (la position des actions est configurable, mais pas le contenu des boutons)
- ⚠️ `showContent` et `showSeparator` sont stockés comme strings `"true"`/`"false"` dans le `propSchema` BlockNote mais passés à `InspectorField type="checkbox"` — `"false"` étant une string non-vide, elle est truthy en JS, ce qui rend le checkbox toujours coché. À corriger en normalisant dans `InspectorField` : `checked={value === true || value === "true"}`.
- ⚠️ `doc.descendants()` dans `blob-block.tsx` parcourt tout le document à chaque `mousedown` pour trouver la position ProseMirror du bloc (O(n)). Acceptable sur de petits documents, à optimiser sur de grands documents en maintenant un cache `id → pos` via un plugin ProseMirror.
- ⚠️ `useBlockSelection()` est appelé dans le `render` de `createReactBlockSpec` — fonctionnel car BlockNote traite ce render comme un composant React, mais hors des règles ESLint standard (commentaire `eslint-disable` en place). Si BlockNote venait à changer la façon dont il appelle ce render, le hook devrait être déplacé dans un sous-composant wrapper. Le bloc `section` utilise déjà cette approche propre (composant `SectionBlockRenderer` extrait).
- **Block alignment CSS** : la largeur par défaut de tous les blocs est gérée via CSS global (`.bn-editor > .bn-block-group > .bn-block-outer`), pas via un wrapper `max-w` sur le conteneur de l'éditeur. Les blocs avec `data-block-alignment` peuvent dépasser cette contrainte. Les variables CSS `--bn-content-width` et `--bn-wide-width` permettent de personnaliser les seuils.
- **Architecture d'alignement** : les composants `AlignmentToolbar` et `AlignmentInspectorField` sont réutilisables — tout futur custom block peut les importer. Le `blockAlignmentProp` est un fragment `propSchema` partageable. Le registre `blockAlignmentLocked` permet de fixer l'alignement d'un type de bloc (non-configurable depuis l'UI).

**Prochaines étapes** :
1. Corriger le bug `showContent`/`showSeparator` (string vs boolean dans les checkboxes)
2. Enrichir le bloc Section (enfants imbriqués, background, padding)
3. Implémenter BlobIterator comme custom block BlockNote
4. Ajouter le système de presets
5. Implémenter l'édition des boutons individuels dans l'Inspector

## Architecture du projet

### Fichiers principaux

Le système Blob est organisé en plusieurs couches :

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

**Nouveaux fichiers pour BlobEditor :**

`block-registry.ts` — Registre des types de blocs

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

* Stockage dans `/data/app/*.json`
* `listPages()`, `loadPage()`, `savePage()`, `createPage()`, `deletePage()`
* Gestion des métadonnées (createdAt, updatedAt)
* Import/Export de pages

`block-preset-storage.ts` — Persistance des presets de blocs

* Stockage dans `/data/blocks/*.json`
* `listBlockPresets()`, `loadBlockPreset()`, `saveBlockPreset()`
* `createBlockPreset()` : Crée un preset depuis un bloc
* `instantiateBlockFromPreset()` : Instancie un bloc depuis un preset

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

**Renderers de blocs**

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

**Composants BlobEditor** (`/components/blob-editor`)

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
* Réduit le coût du premier rendu de l'inspector de ~40 composants à ~5

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
```

Le système parse ces chaînes, résout les breakpoints en mode mobile-first (les valeurs se propagent), et génère les classes appropriées pour chaque breakpoint.

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

### Extensibilité

* **Créer un nouveau bloc** : créer une `BlockDefinition` avec `extraSections`/`extraFields`, `initialValues`, et un `render` personnalisé

Le système est conçu pour que chaque partie soit **indépendante** : source unique de vérité (`blob-fields.ts`), système de compatibilité découplé, extensions via `BlockDefinition`.

### BlobEditor

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

**BlobEditor** : <http://localhost:3000/blob-editor>


