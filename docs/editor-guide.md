# Guide des éditeurs

## New Editor — `/new-editor` ⚡ **EN TEST**

Un éditeur visuel simplifié et performant construit de zéro pour supporter pleinement les besoins du système Blob.

### Pourquoi un nouvel éditeur ?

* BlockNote ne supporte pas les "custom nested blocks" (blocs personnalisés avec enfants récursifs)
* Les Blob blocks doivent pouvoir contenir d'autres Blob blocks à profondeur illimitée
* Besoin d'un contrôle total sur la structure hiérarchique et le rendu

### Architecture

* **Interface en 3 colonnes** : Sidebar navigation (gauche) + Canvas scrollable (centre) + Inspector scrollable (droite) — chaque colonne défile indépendamment à `100vh - hauteur toolbar`
* **Système de vues** : Sidebar permet de basculer entre deux vues — Éditeur visuel (Canvas + Inspector) et Éditeur JSON (textarea pleine largeur du JSON de la page)
* **Types de blocs** : `Blob`, `BlobIterator` et blocs custom (ex: `ButtonTooltip`) — système extensible
* **Blocs imbriqués récursifs** : Les Blob peuvent contenir d'autres Blob à l'infini via `innerBlocks` — activé via le champ `contentType: "innerBlocks"` dans la section Contenu
* **Hover controls** : Boutons ↑ ↓ + 📋 (dupliquer) + 🗑 rendus via `createPortal` en `position: fixed` — un seul bloc survolé à la fois (anti-cascade via `HoveredBlockContext`), bordure bleue légère sur le bloc actif
* **Inspector dynamique** : Bascule automatiquement entre BlobInspector et IteratorInspector selon le type de bloc sélectionné
* **Zero re-render pattern** : Inputs avec `localValue` state pour éviter les cursor-jumps
* **Lazy mounting** : Les sections accordion ne montent leurs enfants qu'à la première ouverture
* **Système itemFields** : Multiselect pour choisir quels champs sont gérés par item vs partagés (Iterator)
* **Persistance Redis** : Sauvegarde dans Vercel KV via API `/api/pages`
* **Gestion de pages dynamique** : Chargement et création de pages depuis le sitemap
* **Raccourcis clavier** : `⌘S`/`Ctrl+S` pour sauvegarder, `Backspace`/`Delete` pour supprimer le bloc sélectionné, `⌘Z` pour annuler, `⌘⇧Z` pour rétablir
* **Animation de sélection** : Onde `box-shadow` à chaque sélection de bloc, rendue via `createPortal` pour un positionnement correct à toute profondeur d'imbrication

### Architecture fichiers (`/components/new-editor`)

* `NewEditor.tsx` : Orchestrateur pur — layout + assemblage des sous-composants
* `NewEditorToolbar.tsx` : Barre d'outils fixe (pages, ajout de blocs, sauvegarde)
* `NewEditorSidebar.tsx` : Sidebar de navigation gauche avec boutons de changement de vue (Éditeur visuel / Éditeur JSON)
* `JsonEditor.tsx` : Éditeur JSON pleine largeur (textarea + bouton Appliquer + gestion d'erreurs de parsing)
* `BlockCanvas.tsx` : Zone de rendu central avec sélection
* `BlockRenderer.tsx` : Rendu récursif des blocs avec proper component usage
* `BlockInspector.tsx` : Switch entre BlobInspector et IteratorInspector
* `BlobInspector.tsx` : 9 sections, 40+ champs Blob
* `IteratorInspector.tsx` : itemFields multiselect + items management
* `BlockHoverControls.tsx` : Contrôles flottants ↑ ↓ + 📋 (dupliquer) + 🗑 + picker d'ajout de bloc — rendus via portal (`position: fixed`)
* `HoveredBlockContext.tsx` : Context partagé pour le hover anti-cascade (un seul bloc hovered à la fois)
* `BlockPickerPopover.tsx` : Popover de sélection du type de bloc à créer (style slash command)

### Hooks (`/lib/new-editor`)

* `useEditorState.ts` : État global, CRUD blocs (ajout, suppression, déplacement, duplication récursive), gestion des pages, auto-save, historique undo/redo (50 snapshots), presse-papiers interne, `handleSetBlocks` (remplacement atomique du tableau de blocs avec commit dans l'historique — utilisé par l'éditeur JSON)
* `useKeyboardShortcuts.ts` : Raccourcis clavier (`⌘S`, `Backspace`/`Delete`, `⌘Z`, `⌘⇧Z`)

### Status : 🧪 **Phase de test active — Non terminé**

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
  * Multiselect dynamique avec ~50 champs organisés par sections visuelles
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
* ✅ **Système responsive (TOUJOURS actif - Engineers/Reviewers uniquement)** : Système permettant de définir des valeurs différentes par breakpoint (base, sm, md, lg, xl, 2xl) pour les champs de layout et spacing
  - **Navigation par onglets** : Base | SM | MD | LG | XL | 2XL
  - **Onglet Base** : affiche TOUS les champs (responsive et non-responsive) - valeurs mobile-first sans préfixe CSS
  - **Onglets SM/MD/LG/XL/2XL** : affichent UNIQUEMENT les champs responsive (layout, size, spacing, etc.)
  - **Stockage des données** : champs non-responsive dans `data.{field}`, champs responsive dans `data.responsive.{breakpoint}.{field}`
  - **Badges d'héritage** : "(from Base)" montrent l'héritage mobile-first
  - **Blue dots** : sur les tabs avec overrides custom
  - **Migration automatique** : extraction champs non-responsive + conversion xs → base
  - **BlobIterator** : une seule barre de breakpoints synchronisée entre conteneur et champs partagés
  - **ItemFields combobox** : sélection des champs par item avec recherche, groupes par sections, et badges de visualisation
* 🚧 **Preview responsive (EN DÉVELOPPEMENT - Engineers/Reviewers uniquement)** : Système de prévisualisation des breakpoints responsive dans l'éditeur — 7 boutons dans la toolbar (Base, SM, MD, LG, XL, 2XL, Auto) permettent de simuler différentes tailles d'écran ; utilise les **Container Queries** CSS pour activer les breakpoints en fonction de la largeur du container de preview ; le mode Base est traité comme breakpoint de base (sans préfixe) en approche mobile-first ; **⚠️ Fonctionnalité expérimentale en chantier, nécessite des tests extensifs avant utilisation en production** — actuellement limité aux rôles Engineer et Reviewer pour développement et validation

## Composants détaillés

### `NewEditor.tsx` — Orchestrateur pur

* Layout 3 colonnes : Sidebar (gauche) + zone principale (centre+droite)
* Assemble `useEditorState`, `useKeyboardShortcuts`, `NewEditorToolbar`, `NewEditorSidebar`, `BlockCanvas`, `BlockInspector`, `JsonEditor`
* Gère l'état de vue (`activeView: 'visual' | 'json'`) en local state — bascule conditionnellement entre Canvas+Inspector et JsonEditor
* Ne contient aucune logique métier — responsabilité unique : composition du layout

### `NewEditorToolbar.tsx` — Barre d'outils fixe

* Sélecteur de pages, dialog de création de page, boutons Blob/Iterator, sauvegarde
* Affiche l'heure de dernière sauvegarde

### `NewEditorSidebar.tsx` — Sidebar de navigation gauche

* Barre étroite (`w-11`) avec boutons icônes pour changer de vue
* `LayoutTemplate` → vue Éditeur visuel, `Braces` → vue Éditeur JSON
* Bouton actif mis en évidence (`bg-gray-300`), tooltips Radix UI au survol
* Exporte le type `EditorView = 'visual' | 'json'`

### `JsonEditor.tsx` — Éditeur JSON pleine largeur

* Affiche `JSON.stringify(blocks, null, 2)` dans une `<textarea>` monospace pleine hauteur
* State local `localJson` + `isDirty` : ne remplace pas les blocs en live mais à la validation explicite
* Synchronise depuis `blocks` uniquement quand `isDirty === false` (respecte les undo/redo de la toolbar)
* Bouton **Appliquer** : parse le JSON, valide que c'est un tableau, appelle `onSetBlocks` (push dans l'historique undo) + `onSave`
* `⌘S`/`Ctrl+S` déclenche Appliquer depuis l'éditeur JSON
* Affiche l'erreur de parsing inline (`AlertCircle` + message `SyntaxError`)

### `BlockCanvas.tsx` — Zone de rendu central

* Affiche les blocs avec `BlockRenderer` récursif
* Gestion de la sélection au clic
* Wrapper pour les handlers de déplacement, ajout et suppression

### `BlockRenderer.tsx` — Rendu récursif des blocs

* Rend un bloc selon son type (blob ou blobIterator)
* Utilise `mapFormDataToBlob` et `mapIteratorFormData`
* Utilise les composants Blob propres (Marker, Title, Subtitle, etc.)
* Supporte les innerBlocks récursifs
* Intègre `BlockHoverControls` pour chaque bloc
* Animation d'onde `box-shadow` (élément `fixed` via `getBoundingClientRect`) à chaque sélection

### `BlockHoverControls.tsx` — Contrôles flottants

* Boutons ↑ ↓ + 🗑 rendus via `createPortal` dans `document.body` en `position: fixed`
* Positionnement calculé via `anchorRect` (`getBoundingClientRect` du wrapper bloc), mis à jour au scroll/resize
* Visibilité pilotée par `HoveredBlockContext` — un seul bloc survolé à la fois (anti-cascade pour blocs imbriqués)
* Le bloc survolé affiche une bordure bleue légère (`ring-1 ring-blue-300/50`)
* `onMouseOver` + `stopPropagation` dans `BlockRenderer` empêche le parent de recevoir le hover quand un enfant est survolé

### `BlockInspector.tsx` — Inspector principal

* Switch entre BlobInspector et IteratorInspector selon blockType
* Affiche "Sélectionnez un bloc" si aucune sélection

### `BlobInspector.tsx` — Inspector Blob

* 9 sections collapsibles : Textes, Marqueur, Figure, Boutons, Contenu, Disposition, Espacement, Style, Séparateur
* Utilise `InspectorField` pour les champs standards et `RepeaterInspector` pour les champs `type: "repeater"` (ex: Boutons)
* Couvre les 40+ champs du système Blob

### `IteratorInspector.tsx` — Inspector Iterator

* Section Iterator : containerLayout, gapX, gapY
* Section itemFields : multiselect organisé par catégories (En-tête, Marqueur, Figure, Boutons, etc.)
* Section Items : délègue à `RepeaterInspector` avec `ItemBlobInspector` comme `renderContent` — même code path que le champ Boutons
* Handlers pour itemFields checkbox (ajout/suppression de champs avec nettoyage des données)

### `ItemBlobInspector.tsx` — Contenu des items Iterator

* Reproduction exacte de la logique `BlobInspector` filtrée sur `itemFields`
* Même ordre `fieldSections`, mêmes `CollapsibleSection`, même `renderField`
* `showIf` évalué sur le contexte fusionné `{ ...sharedData, ...item }`
* Compat calculé sur le même contexte fusionné

### `RepeaterInspector.tsx` — Champ répéteur générique

* Label + un bouton trigger par item (ouvre un Popover avec les champs) + bouton Ajouter en bas
* Drag & drop natif HTML5 pour réordonner les items (handle `GripVertical`)
* Boutons Dupliquer et Supprimer par item
* Render prop `renderContent` pour personnaliser le contenu du popover (utilisé par Iterator)
* Utilisé par `BlobInspector` / `ItemBlobInspector` pour tout champ `type: "repeater"`, et par `IteratorInspector` pour la liste des items

### `InspectorField.tsx` — Champ atomique

* Types supportés : text, textarea, select, checkbox
* State local `localValue` pour éviter cursor-jumps
* `onChange` appelé directement sans debounce
* Synchronisation via `useEffect([value])`

### `CollapsibleSection.tsx` — Section accordion

* Lazy mount : les enfants ne montent qu'à la première ouverture
* Flag `hasBeenOpened` garde les enfants montés après ouverture
* Toggle suivants purement CSS (performance)

## Anciens éditeurs (À retirer prochainement)

**Note** : `/blob-editor` et `/editor` ont vocation à être retirés une fois `/new-editor` stabilisé.

### Éditeur Custom (Legacy) — `/blob-editor`

Un éditeur visuel complet pour créer et gérer des pages entières avec :

* **Interface en 3 colonnes** : Arborescence (gauche), Aperçu (centre), Inspecteur (droite)
* **Blocs imbriqués** : Support complet des `innerBlocks` avec profondeur illimitée
* **Gestion de pages** : Création, édition, sauvegarde de pages dans `/data/app/`
* **Système de presets** : Sauvegarde et réutilisation de blocs via clic droit
* **Types de blocs** : BlobBlock, BlobSection, BlobIterator
* **Persistance JSON** : Stockage des pages et presets en fichiers JSON
* **Status** : ✅ Fonctionnel et stable (legacy)

### Éditeur BlockNote (Abandonné) — `/editor`

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
