# Blob UI — Contexte pour Claude Code

Un système de composants ultra-modulable pour construire des sections de contenu flexibles et responsives dans Next.js.

> **⚠️ IMPORTANT pour les IA** : Ce projet exige du code propre et maintenable. Éviter `any`, privilégier les helpers type-safe, et **discuter avant d'implémenter des solutions "sales"**. Voir section **"Principes de qualité du code"** ci-dessous.

---

## Architecture en un coup d'œil

| Couche           | Localisation              | Rôle                                    |
|------------------|---------------------------|-----------------------------------------|
| Composants       | `/components/blob/`       | Blob, BlobIterator, sous-composants     |
| Configuration    | `/lib/blob-*.ts`          | Fields, compatibility, compose, mapper  |
| Éditeur actif    | `/components/new-editor/` | NewEditor + inspectors + canvas         |
| State management | `/lib/new-editor/`        | useEditorState, hooks, block-registry   |
| Permissions      | `/lib/auth/`              | Rôles (engineer/editor/reviewer), field-level access |
| Styles           | `/styles/`                | blob.css, blob-composed.css, blob-size.css |

---

## Fichiers clés et responsabilités

### Configuration (`/lib`)

| Fichier | Rôle |
|---------|------|
| `blob-fields.ts` | **Source unique de vérité** pour tous les champs (9 sections, 40+ champs) |
| `blob-compatibility.ts` | Matrice des combinaisons layout/marker/actions valides + registre CSS |
| `blob-compose.ts` | Types responsive + générateur de classes CSS (convertit objet → string CSS) |
| `blob-form-mapper.ts` | Mapping FormData → Props Blob (découplage éditeur/composant) |
| `blob-iterator-definition.ts` | Extension pour Iterator : système de champs partagés (`itemFields`) |
| `blob-iterator-mapper.ts` | Mapping Iterator : fusion props partagées + props par item |
| `use-blob-compatibility.ts` | Hook React : calcule options disponibles selon contexte |

### Éditeur (`/lib/new-editor`)

| Fichier | Rôle |
|---------|------|
| `block-types.ts` | Types : `BlockType`, `BlockNode`, `EditorState` |
| `block-registry.ts` | Registre des blocs (Blob, Iterator, custom) + config complète |
| `useEditorState.ts` | **État central** : CRUD récursif, pages, auto-save, undo/redo (50 snapshots) |
| `useKeyboardShortcuts.ts` | Raccourcis : `⌘S`, `Backspace`, `⌘Z`, `⌘⇧Z` |

### Composants (`/components`)

| Fichier | Rôle |
|---------|------|
| `blob/blob.tsx` | Composant principal (compound component pattern) |
| `blob/blob-iterator.tsx` | Container responsif (grid/swiper, auto Server/Client) |
| `new-editor/NewEditor.tsx` | Orchestrateur : layout 3 colonnes + vues (visual/JSON) |
| `new-editor/BlockRenderer.tsx` | Rendu récursif des blocs avec hover controls + animation |
| `new-editor/BlobInspector.tsx` | Inspector Blob (9 sections collapsibles, 40+ champs, responsive tabs) — peut être délégué depuis IteratorInspector sans tabs |
| `new-editor/IteratorInspector.tsx` | Inspector Iterator (container responsive, itemFields combobox + items + tabs partagés) |
| `new-editor/ItemFieldsCombobox.tsx` | Combobox multi-select pour choisir les champs par item (avec badges et groupes) |
| `new-editor/BreakpointTabs.tsx` | Tabs responsive (Base \| SM \| MD \| LG \| XL \| 2XL) avec blue dots |
| `new-editor/RepeaterInspector.tsx` | Champ répéteur générique (drag & drop, popover) |
| `new-editor/InspectorField.tsx` | Champ atomique avec `localValue` + badges héritage responsive |
| `new-editor/CollapsibleSection.tsx` | Section accordion avec lazy mounting |

### Permissions (`/lib/auth`)

| Fichier | Rôle |
|---------|------|
| `types.ts` | Types + matrice `ROLE_PERMISSIONS` |
| `permissions.ts` | Helpers : `canCreatePage`, `canEditPage`, `canSaveChanges` |
| `field-permissions.ts` | Permissions champ par champ : `canEditField(role, fieldType)` |
| `UserContext.tsx` | Context React + localStorage persistence |

### Styles (`/styles`)

| Fichier | Rôle |
|---------|------|
| `blob.css` | Point d'entrée : grille CSS, slots nommés, utilitaires |
| `blob-composed.css` | Classes atomiques (1 classe = 1 combo layout/marker/actions) |
| `blob-size.css` | Tokens de taille (xs → 10xl, ~15 variables CSS par taille) |

---

## Conventions du projet

### ⚠️ Principes de qualité du code (IMPORTANT pour les IA)

**Le code doit rester propre et maintenable.** Si une demande implique de créer des solutions "sales" ou des compromis sur la qualité, **discuter d'abord avec l'utilisateur avant d'implémenter**.

#### Type Safety

- ❌ **ÉVITER** : `any` types sauf si absolument nécessaire et justifié
- ✅ **PRÉFÉRER** :
  - Types stricts (`Layout`, `Direction`, `SizeValue`, etc.)
  - `unknown` pour les valeurs vraiment dynamiques
  - Helper functions type-safe pour les assertions répétitives
  - Types temporaires pour migrations (ex: `LegacyResponsiveProps`)

**Exemple de helper type-safe** :
```typescript
// ✅ BON : Helper réutilisable avec générique
function setResponsiveValue<K extends keyof ResponsiveBreakpointProps>(
  responsive: ResponsiveProps,
  breakpoint: 'base',
  key: K,
  value: FormDataValue | undefined
): void {
  // ... implémentation type-safe
}

// ❌ MAUVAIS : Répéter 12x le même `as any`
responsive.base!.size = formData.size as any
responsive.base!.layout = formData.layout as any
// ... etc
```

#### Performance

- Utiliser `useMemo` pour stabiliser les références d'objets/arrays utilisés comme dépendances
- Éviter de créer de nouveaux objets dans les dépendances de hooks

**Exemple** :
```typescript
// ❌ MAUVAIS : Crée un nouvel objet {} à chaque render
const responsiveData = (data.responsive as ResponsiveProps) || {}
const overrides = useMemo(..., [responsiveData])  // Se recalcule toujours

// ✅ BON : Référence stable
const responsiveData = useMemo(
  () => (data.responsive as ResponsiveProps) || {},
  [data.responsive]
)
```

#### Code Mort

- Supprimer les imports, fonctions, et variables inutilisés
- Ne pas laisser de code commenté (utiliser git pour l'historique)

#### ESLint Disables

- **Justifier systématiquement** les `eslint-disable` avec un commentaire explicatif
- Privilégier la correction du problème plutôt que la désactivation de la règle
- Si disable nécessaire : expliquer **pourquoi** c'est intentionnel

**Exemple** :
```typescript
// ✅ BON : Disable justifié avec contexte
// Intentional: Syncing external store (localStorage) with React state
// This is the recommended pattern per React docs
// eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => {
  setUser({ role: storedRole })
}, [storedRole])

// ❌ MAUVAIS : Disable sans explication
// eslint-disable-next-line
useEffect(() => { ... })
```

#### Processus en cas de dilemme

Si une demande implique :
- Utiliser plusieurs `any` sans justification
- Dupliquer du code de manière significative
- Contourner le système de types
- Désactiver plusieurs règles ESLint
- Créer des solutions fragiles ou difficiles à maintenir

**→ STOPPER et DISCUTER avec l'utilisateur** :
1. Expliquer le problème de qualité identifié
2. Proposer des alternatives propres (même si plus longues)
3. Laisser l'utilisateur choisir entre qualité et rapidité

**L'utilisateur préfère la qualité** : il vaut mieux prendre le temps de faire les choses correctement.

---

### Valeurs responsive

**Mode TOUJOURS actif** : Le système responsive est permanent (pas de toggle on/off).

**Format** : Objet avec clés par breakpoint (mobile-first)
```typescript
// Composant Blob
<Blob
  responsive={{
    base: { layout: "stack", marker: "top", size: "md" },  // Base = mobile-first default
    md: { layout: "row", marker: "left" },
    lg: { layout: "bar", size: "xl" }
  }}
  theme="brand"
/>

// En interne, converti en classes CSS :
// "blob-stack md:blob-row lg:blob-bar"
```

**Breakpoints dans l'UI** :
- `base` → **"Base"** (valeurs par défaut mobile-first, sans préfixe CSS)
- `sm`, `md`, `lg`, `xl`, `2xl` → noms standards avec préfixes CSS

**Héritage** : Les valeurs se propagent mobile-first (lg hérite de md qui hérite de base)

### Champs repeater

**Storage** : JSON string dans FormData
```typescript
// Dans l'éditeur
data.buttons = '[{"label":"Cliquez","url":"/demo"}]'

// Dans le mapper
const buttons = parseJsonField<ButtonItem[]>(formData.buttons, [])
```

### Mappers (découplage)

**Pattern** : FormData → Props responsive
```typescript
// Chaque bloc a son mapper
mapFormDataToBlob(formData) → { blobProps: { responsive, theme }, ... }
mapIteratorFormData(formData) → { sharedBlobProps: { responsive }, items, ... }

// Construction de l'objet responsive
const responsive: ResponsiveProps = {
  base: { layout, marker, size, ... },  // Valeurs de base (mobile-first)
  ...(formData.responsive || {})        // Overrides par breakpoint
}
```

### Zero re-render pattern

**Inspector fields** : `localValue` state pour éviter cursor-jumps
```typescript
const [localValue, setLocalValue] = useState(value)

// useEffect synchronise uniquement quand value change (changement de bloc)
useEffect(() => {
  if (value !== localValue) setLocalValue(value)
}, [value])
```

### Lazy mounting

**CollapsibleSection** : Les enfants ne montent qu'à la première ouverture
```typescript
const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen)
// Flag garde les enfants montés — toggles suivants purement CSS
```

### Classes atomiques composées

**1 classe = 1 combinaison complète**
```css
/* Au lieu de combiner plusieurs classes */
.blob-stack { /* définit toute la grille pour stack + marker top + actions before */ }
.blob-row-marker-left-actions-after { /* définit toute la grille pour cette config */ }
```

### Système itemFields (Iterator)

**Héritage inversé** : Tout est partagé par défaut, on liste les exceptions
```typescript
// itemFields liste les champs gérés PAR ITEM
itemFields: ['title', 'subtitle', 'markerIcon', 'figureImage']

// Tout le reste (layout, spacing, style) est partagé
```

**UI** : Combobox multi-select au début de la section "Items" avec :
- Label "Champs pour chaque item"
- Recherche et filtrage
- Groupes par sections (Header, Marker, Figure, etc.)
- Badges pour visualiser les sélections
- Description explicative de l'héritage inversé

### Blocs imbriqués récursifs

**innerBlocks** : Profondeur illimitée via `BlockNode[]`
```typescript
interface BlockNode {
  id: string
  blockType: BlockType
  data: Record<string, any>
  innerBlocks?: BlockNode[] // ← Récursion
}
```

---

## Workflow de développement

### Modifier un champ Blob existant

1. `blob-fields.ts` → Modifier la définition du champ
2. `blob-form-mapper.ts` → Ajuster le mapping si nécessaire
3. `BlobInspector.tsx` → Le champ apparaît automatiquement (système déclaratif)

### Ajouter un nouveau layout

1. `blob-compatibility.ts` → Ajouter à `LAYOUTS` + définir entrée dans `COMPATIBILITY`
2. `blob-composed.css` → Créer la classe CSS (grid-template-areas, columns, rows)
3. Le registre se régénère automatiquement

### Créer un bloc custom

**Protocole 8 étapes** (détails : `docs/custom-blocks.md`)
1. Ajouter le type dans `block-types.ts`
2. Créer `[block-name]-fields.ts` (définitions champs)
3. Créer `[block-name]-mapper.ts` (FormData → Props)
4. Créer `Block[Name].tsx` (composant React)
5. Créer `[Name]Inspector.tsx` (interface d'édition)
6. Enregistrer dans `block-registry.ts`
7. Intégrer dans `BlockInspector.tsx`
8. Intégrer dans `BlockRenderer.tsx` + `render-page-blocks.tsx`

### Modifier les permissions

1. `auth/types.ts` → Ajouter permission dans `Permission` type + matrice `ROLE_PERMISSIONS`
2. `auth/permissions.ts` → Créer helper `canDoMyNewThing(role)`
3. Utiliser dans les composants : `if (!canDoMyNewThing(user?.role)) return null`

---

## État actuel (développement actif)

### ✅ Stable

- **New Editor** (`/new-editor`) : Éditeur visuel principal
- **Système Blob** : Composants, compatibilité, tokens de taille
- **BlobIterator** : Grilles, swiper, système de champs partagés + **responsive container**
- **Permissions** : Système de rôles complet (engineer/editor/reviewer)
- **Undo/Redo** : Historique 50 snapshots avec debounce intelligent
- **Vues multiples** : Éditeur visuel + Éditeur JSON
- **Système responsive** : TOUJOURS actif (Engineers/Reviewers uniquement)
  - Tabs par breakpoint (Base | SM | MD | LG | XL | 2XL)
  - Badges d'héritage mobile-first "(from Base)"
  - Blue dots sur tabs avec overrides
  - Compilation automatique objet → `"stack md:row lg:bar"`
  - BlobIterator container responsive (layout, gapX, gapY)
  - Migration automatique des anciennes données (extraction champs non-responsive, conversion xs → base)

### 🚧 En développement (Engineers/Reviewers uniquement)

- **Preview responsive** : Prévisualisation breakpoints dans l'éditeur
  - 7 boutons toolbar (Base/SM/MD/LG/XL/2XL/Auto)
  - Container Queries CSS pour simulation
  - ⚠️ Fonctionnalité expérimentale

### 🗑️ À retirer / Obsolète

- `/blob-editor` (Legacy) : Éditeur custom legacy, fonctionnel mais remplacé
- `/editor` (Abandonné) : Prototype BlockNote.js, abandonné

---

## Système de rôles

### Engineer (Développeur)

- ✅ Tous les droits (create, edit, delete, save)
- ✅ Tous les champs (texte, média, layout, style)
- ✅ Accès features expérimentales

### Editor (Éditeur de contenu)

- ✅ Édition de pages existantes
- ✅ Champs texte et URLs média uniquement
- ✅ Sauvegarde
- ❌ Création/suppression de pages
- ❌ Champs layout/spacing/style

### Reviewer (Réviseur)

- ✅ Lecture seule complète
- ❌ Aucune modification

**Filtrage des champs** : `canEditField(role, fieldType)` dans `field-permissions.ts`

---

## Raccourcis clavier (New Editor)

| Raccourci | Action |
|-----------|--------|
| `⌘S` / `Ctrl+S` | Sauvegarder manuellement |
| `Backspace` / `Delete` | Supprimer le bloc sélectionné |
| `⌘Z` / `Ctrl+Z` | Annuler (undo) |
| `⌘⇧Z` / `Ctrl+⇧Z` | Rétablir (redo) |
| Clic droit sur bloc | Menu contextuel (Copier/Coller) |

---

## Concepts clés

### Classes atomiques composées

Une seule classe par combinaison layout/marker/actions → élimine les conflits de variables CSS responsive.

### Système de compatibilité

Matrice pré-générée au build → validations rapides à runtime (quels markers supportés, quels alignements valides, etc.).

### Tokens de taille

Un token (`size="xl"`) définit **toutes** les variables : heading, body, eyebrow, buttons, marker, gaps, padding → cohérence garantie.

### Suppression dynamique des slots

CSS utilise `:not(:has(> [data-slot="marker"]))` pour retirer automatiquement les slots vides de la grille.

### Paddings dynamiques (Container Mode)

`paddingX="container-md"` calcule dynamiquement la marge pour contraindre le contenu à `max-w-4xl` tout en laissant le background full-width.

### Système de blocs extensibles

`BlockDefinition` permet de créer des variantes de Blob avec champs supplémentaires, valeurs forcées, renderer custom.

### Responsive basé sur objets (TOUJOURS actif)

**Principe** : Pas de toggle on/off - le système responsive est permanent pour Engineers/Reviewers.

**Type-safe** : L'objet `ResponsiveProps` garantit la validation TypeScript des valeurs à chaque breakpoint.

```typescript
interface ResponsiveProps {
  base?: ResponsiveBreakpointProps   // Base = mobile-first default (sans préfixe CSS)
  sm?: ResponsiveBreakpointProps
  md?: ResponsiveBreakpointProps
  lg?: ResponsiveBreakpointProps
  xl?: ResponsiveBreakpointProps
  "2xl"?: ResponsiveBreakpointProps
}
```

**UI Simplifiée** :
- **Tab "Base"** : Valeurs de base mobile-first (sans préfixe CSS) - affiche TOUS les champs (responsive et non-responsive)
- **Tabs SM/MD/LG/XL/2XL** : Overrides par breakpoint - affiche UNIQUEMENT les champs responsive (layout, size, spacing, etc.)
- **Blue dots** : Indiquent les breakpoints avec valeurs custom
- **Badges "(from Base)"** : Montrent l'héritage mobile-first

**Stockage des données** :
- **Champs responsive** (layout, size, marker, align, gapX, gapY, paddingX, paddingY, figureWidth, figureBleed, actions, direction) : stockés dans `data.responsive.{breakpoint}.{field}`
- **Champs non-responsive** (title, subtitle, eyebrow, markerType, markerContent, figureType, image, video, theme, appearance, etc.) : stockés directement dans `data.{field}`

**Conversion interne** : Le composant Blob convertit automatiquement l'objet en strings pour la génération CSS (`convertResponsiveToString()`).

**BlobIterator responsive** : Les paramètres du conteneur (layout, gapX, gapY) supportent aussi le système responsive.

---

## Documentation détaillée

Pour approfondir, voir :

| Sujet | Fichier |
|-------|---------|
| Architecture complète + flux de données | `docs/architecture.md` |
| Système Blob (composants, CSS, compatibilité) | `docs/blob-system.md` |
| Guide complet des éditeurs | `docs/editor-guide.md` |
| Système BlobIterator et champs partagés | `docs/iterator-system.md` |
| Système de rôles et permissions | `docs/permissions.md` |
| Créer un bloc custom (protocole 8 étapes) | `docs/custom-blocks.md` |
| Migration responsive (string → objet) | `scripts/README.md` |

---

## URLs de développement

```bash
pnpm dev
```

- **New Editor** (actif) : http://localhost:3000/new-editor
- **BlobEditor** (legacy) : http://localhost:3000/blob-editor
- **BlockNote Editor** (abandonné) : http://localhost:3000/editor

---

## Base de données (Vercel KV / Redis)

**Setup** :
```bash
npx vercel link
npx vercel env pull .env.local
```

**API** : `/api/pages` pour persistance (load, save, create, delete)

**Environnement** : `REDIS_URL` dans `.env.local` (auto-téléchargé depuis Vercel)

**Important** : Les environnements local et production utilisent **deux bases de données Redis distinctes**. Les données ne sont pas synchronisées automatiquement entre les deux environnements.

### Migration des données

Si vous migrez vers le nouveau système responsive (objet au lieu de strings), utilisez le script de migration :

```bash
# Simulation
npx tsx scripts/migrate-responsive-to-object.ts --dry-run

# Migration réelle
npx tsx scripts/migrate-responsive-to-object.ts
```

Voir `scripts/README.md` pour la documentation complète.

---

## Exemples de bonnes pratiques (Code Quality)

Ces exemples sont tirés de refactorings réels effectués sur le projet pour maintenir la qualité du code.

### Helper Functions Type-Safe

**Contexte** : `blob-iterator-mapper.ts` avait 12 instances de `formData.field as any`

**❌ Avant (problématique)** :
```typescript
if (isShared("size") && formData.size) {
  responsive.base!.size = formData.size as any
}
if (isShared("layout") && formData.layout) {
  responsive.base!.layout = formData.layout as any
}
// ... 10 autres fois
```

**✅ Après (propre)** :
```typescript
// Helper réutilisable avec générique
function setResponsiveValue<K extends keyof ResponsiveBreakpointProps>(
  responsive: ResponsiveProps,
  breakpoint: 'base',
  key: K,
  value: FormDataValue | undefined
): void {
  if (!value) return
  if (!responsive[breakpoint]) {
    responsive[breakpoint] = {}
  }
  responsive[breakpoint]![key] = value as ResponsiveBreakpointProps[K]
}

// Utilisation propre et type-safe
if (isShared("size")) {
  setResponsiveValue(responsive, 'base', 'size', formData.size as FormDataValue)
}
```

**Bénéfices** : 1 fonction réutilisable au lieu de 12 `as any`, type-safety maintenue, plus facile à tester.

### Types Legacy pour Migrations

**Contexte** : Scripts de migration doivent accéder à l'ancien breakpoint `xs` qui n'existe plus dans `ResponsiveProps`

**❌ Mauvaise approche** :
```typescript
const responsive = data.responsive as any  // Perd toute validation
if (responsive.xs) { ... }
```

**✅ Bonne approche** :
```typescript
// Type spécifique pour migration
type LegacyResponsiveProps = {
  xs?: ResponsiveBreakpointProps   // Ancien breakpoint
  base?: ResponsiveBreakpointProps
  sm?: ResponsiveBreakpointProps
  // ... autres breakpoints actuels
}

const responsive = data.responsive as LegacyResponsiveProps | undefined
if (responsive?.xs) { ... }  // Type-safe avec accès à xs
```

**Bénéfices** : Type-safety même dans le code de migration, documentation explicite des formats legacy.

### `unknown` vs `any` pour Valeurs Dynamiques

**Contexte** : Fonctions utilitaires qui retournent différents types selon le champ

**❌ Avant** :
```typescript
function getBreakpointValue(
  responsiveValues: ResponsiveProps | undefined,
  breakpoint: Breakpoint,
  field: string
): { value: any; inheritedFrom: Breakpoint | null }
```

**✅ Après** :
```typescript
function getBreakpointValue(
  responsiveValues: ResponsiveProps | undefined,
  breakpoint: Breakpoint,
  field: string
): { value: unknown; inheritedFrom: Breakpoint | null }
```

**Bénéfices** : `unknown` force les consommateurs à vérifier le type avant utilisation (type-safe), contrairement à `any` qui désactive toute validation.

### Stabilisation de Références avec `useMemo`

**Contexte** : Warning ESLint sur dépendances de `useMemo` qui changent à chaque render

**❌ Avant** :
```typescript
const responsiveData = (data.responsive as ResponsiveProps) || {}
const overrides = useMemo(
  () => getBreakpointsWithOverrides(responsiveData),
  [responsiveData]  // ⚠️ Nouvel objet {} à chaque render
)
```

**✅ Après** :
```typescript
const responsiveData = useMemo(
  () => (data.responsive as ResponsiveProps) || {},
  [data.responsive]  // ✅ Référence stable
)
const overrides = useMemo(
  () => getBreakpointsWithOverrides(responsiveData),
  [responsiveData]
)
```

**Bénéfices** : Évite recalculs inutiles, chaîne de memoization correcte, meilleures performances.

---

**Version** : 2026-03-15 (optimisé pour Claude Code)
