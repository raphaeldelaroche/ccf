# Blob UI

Un système de composants ultra-modulable pour construire des sections de contenu flexibles et responsives dans Next.js.

---

## Installation & Base de Données (Vercel & Redis)

Ce projet utilise une base de données **Redis (Vercel KV / Upstash)** pour sauvegarder les pages et les presets.

**Important** : Les environnements de développement (local) et de production (Vercel) utilisent **deux bases de données Redis distinctes**. Les données créées localement ne sont pas synchronisées automatiquement avec la production.

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

   *Votre application tournera sur `http://localhost:3000`. Les pages créées ou modifiées seront sauvegardées dans votre base de données Redis locale (distincte de la production).*

---

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
* **Blocs imbriqués dans les items** : Chaque item peut contenir des `innerBlocks` avec profondeur illimitée
* **Optimisation Server/Client** : détection automatique (Server Component pour grilles, Client Component pour swiper)

### 3. **New Editor** — Éditeur de pages 🧪

**⚠️ Le développement se concentre désormais sur `/new-editor`** — un éditeur dédié au Blob qui résout les limitations de BlockNote pour les blocs imbriqués personnalisés.

**Architecture** :

* **Interface en 3 colonnes** : Sidebar navigation + Canvas scrollable + Inspector scrollable
* **Système de vues** : Éditeur visuel (Canvas + Inspector) et Éditeur JSON
* **Types de blocs** : `Blob`, `BlobIterator` et blocs custom (ex: `ButtonTooltip`) — système extensible
* **Blocs imbriqués récursifs** : Profondeur illimitée via `innerBlocks`
* **Système de rôles et permissions** : Engineer (accès complet), Editor (contenu uniquement), Reviewer (lecture seule)
* **Undo/Redo** : Historique à 50 snapshots avec raccourcis `⌘Z` / `⌘⇧Z`
* **Persistance Redis** : Sauvegarde dans Vercel KV via API `/api/pages`

**Status** : 🧪 **Phase de test active — Non terminé**

**Ce qui fonctionne** :

* ✅ Création et chargement de pages dynamiques
* ✅ Ajout de blocs Blob et BlobIterator
* ✅ Édition des props via Inspector (tous les champs)
* ✅ Déplacement, duplication et suppression de blocs
* ✅ Sauvegarde manuelle (`⌘S`) et automatique (debounce 2s)
* ✅ Rendu récursif des innerBlocks
* ✅ Système itemFields complet pour BlobIterator
* ✅ Copier / Coller de blocs (menu contextuel)
* ✅ Annuler / Rétablir avec historique
* ✅ Système de vues (Éditeur visuel + Éditeur JSON)
* ✅ Système de rôles et permissions (field-level access control)
* 🧪 **Mode responsive** (EN TEST - Engineers/Reviewers uniquement)
* 🚧 **Preview responsive** (EN DÉVELOPPEMENT - Engineers/Reviewers uniquement)

---

## Concepts clés

### Classes atomiques composées

Une seule classe CSS par combinaison layout/marker/actions → élimine les conflits de variables CSS responsive.

Exemple : `blob-row-marker-left-actions-after` définit toute la structure de grille pour cette configuration spécifique.

### Valeurs responsive

Le composant Blob accepte un objet `responsive` contenant toutes les props organisées par breakpoint (mobile-first) :

```typescript
<Blob
  responsive={{
    base: { layout: "stack", marker: "top", size: "md", paddingX: "container-md" },
    md: { layout: "row", marker: "left" },
    lg: { layout: "bar", size: "xl", paddingX: "container-lg" }
  }}
  theme="brand"
/>
```

Les valeurs héritent automatiquement des breakpoints plus petits (mobile-first).

### Système de tokens de taille

Un token unique (ex: `size="xl"`) définit automatiquement toutes les variables : taille du heading, du body, de l'eyebrow, des boutons, du marker, des gaps, du padding, etc.

### Système de compatibilité

Chaque layout définit quels markers sont supportés, si les actions sont supportées, quels alignements sont valides, etc. Le registre de compatibilité est pré-généré au build pour des validations rapides à runtime.

### Système de champs partagés (Iterator)

Par défaut, tout est **partagé** (layout, spacing, style). On liste explicitement les champs gérés **par item** via `itemFields`.

---

## Utilisation pratique

### BlobIterator — Grille simple (Server Component)

```tsx
import { BlobIterator } from "@/components/blob/blob-iterator"
import { Blob } from "@/components/blob/blob"

export default function FeaturesSection() {
  return (
    <BlobIterator containerLayout="grid-3" gutter="xl">
      {features.map((feature) => (
        <Blob key={feature.id} layout="stack" size="md">
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

### BlobIterator — Responsive (Swiper mobile, Grid desktop)

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

---

## Getting Started

Pour lancer le projet en développement :

```bash
pnpm dev
```

**Éditeurs disponibles** :

* **New Editor** (actif) : http://localhost:3000/new-editor
* **BlobEditor** (legacy) : http://localhost:3000/blob-editor
* **BlockNote Editor** (abandonné) : http://localhost:3000/editor

---

## Documentation détaillée

La documentation complète est organisée dans `/docs` :

| Sujet | Fichier |
|-------|---------|
| Architecture complète + flux de données | [docs/architecture.md](docs/architecture.md) |
| Système Blob (composants, CSS, compatibilité) | [docs/blob-system.md](docs/blob-system.md) |
| Guide complet des éditeurs | [docs/editor-guide.md](docs/editor-guide.md) |
| Système BlobIterator et champs partagés | [docs/iterator-system.md](docs/iterator-system.md) |
| Système de rôles et permissions | [docs/permissions.md](docs/permissions.md) |
| Créer un bloc custom (protocole 8 étapes) | [docs/custom-blocks.md](docs/custom-blocks.md) |
| Migration responsive (string → objet) | [scripts/README.md](scripts/README.md) |

**Pour Claude Code** : Utilisez `@CLAUDE_CONTEXT.md` pour un contexte optimisé (~5-6k tokens au lieu de 25k).

---

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

---

## Notes pour les contributeurs

### Modifier un champ Blob

1. Éditer `blob-fields.ts` → Modifier la définition du champ
2. Ajuster le mapping dans `blob-form-mapper.ts` si nécessaire
3. Le champ apparaît automatiquement dans `BlobInspector.tsx` (système déclaratif)

### Ajouter un layout

1. `blob-compatibility.ts` → Ajouter à `LAYOUTS` + définir entrée dans `COMPATIBILITY`
2. `blob-composed.css` → Créer la classe CSS (grid-template-areas, columns, rows)
3. Le registre se régénère automatiquement

### Créer un bloc custom

Voir le protocole détaillé en 8 étapes dans [docs/custom-blocks.md](docs/custom-blocks.md).

Résumé :
1. Ajouter le type dans `block-types.ts`
2. Créer `[block-name]-fields.ts`, `[block-name]-mapper.ts`
3. Créer `Block[Name].tsx`, `[Name]Inspector.tsx`
4. Enregistrer dans `block-registry.ts`
5. Intégrer dans `BlockInspector.tsx` et les renderers

---

**Blob UI** — Built with ❤️ for Next.js
