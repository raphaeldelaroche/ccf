# Système BlobIterator

## Vue d'ensemble

Le BlobIterator est un système de conteneur pour créer des collections de blobs avec :

* **Layouts responsives** : grilles (1-4 colonnes, auto) et swiper/carrousel
* **Système de champs partagés** : par défaut tout est partagé (layout, spacing, style), on liste explicitement les champs gérés par item via `itemFields`
* **Blocs imbriqués dans les items** : Chaque item peut contenir des `innerBlocks` avec profondeur illimitée — les items sont des `BlockNode` complets avec `id`, `blockType`, `data`, `innerBlocks`
* **Optimisation Server/Client** : détection automatique (Server Component pour grilles, Client Component pour swiper)

## Composants Iterator (`/components/blob`)

### `blob-iterator.tsx` — Container responsif

* Détection automatique Server/Client Component (grille = Server, swiper = Client)
* Parse les valeurs responsive (ex: `"swiper lg:grid-3"`)
* Layouts disponibles : `grid-1` à `grid-4`, `grid-auto`, `swiper`

### `blob-grid.tsx` / `blob-swiper.tsx` — Implémentations spécialisées

* `BlobGrid` : Server Component pour les grilles statiques, gap via `blob-gutter-*` → `var(--spacing-section)`
* `BlobSwiper` : Client Component avec Swiper.js (navigation, pagination, autoplay, etc.)
* Prop `gutter` : utilise les mêmes tokens de taille que Blob (via `blob-gutter-*` CSS utilities)

## Système de champs partagés (Iterator)

### Principe

Par défaut, tout est **partagé** (layout, spacing, style, structure). On liste explicitement les champs gérés **par item** via `itemFields`.

### Multiselect `itemFields` organisé par sections

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

### Valeurs par défaut

Le contenu (textes, images, boutons) est géré par item. La forme (layout, spacing, style) est partagée.

### Sections dynamiques

`generateSharedSections()` crée automatiquement une section accordion par catégorie, dont les champs ne s'affichent que s'ils ne sont pas dans `itemFields`.

## Notes pour les contributeurs

### Iterator

* **Ajouter un champ partageable** :
  1. Marquer le champ comme `inheritable: true` dans `blob-fields.ts` pour qu'il apparaisse dans le multiselect `itemFields`
  2. Le champ sera automatiquement pris en charge par `generateItemFieldsOptions()`, `generateSharedSections()` et `withSharedFieldCondition()`
  3. Gérer dans `buildSharedBlobProps()` et `mapIteratorItem()` de `blob-iterator-mapper.ts`
* **Modifier les valeurs par défaut** : éditer `initialValues.itemFields` dans `blob-iterator-definition.ts`

## Utilisation pratique

### Grille simple (Server Component)

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

### Carrousel (Client Component automatique)

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

### Responsive : Swiper mobile, Grid desktop

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
