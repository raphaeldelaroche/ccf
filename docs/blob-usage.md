# Guide d'utilisation du composant Blob

Ce guide explique comment utiliser le composant `Blob` dans votre code, avec une attention particulière au typage TypeScript et à l'architecture réutilisable.

---

## Table des matières

1. [Introduction](#introduction)
2. [Configuration type-safe avec BlobConfig](#configuration-type-safe-avec-blobconfig)
3. [Pourquoi `as const` était nécessaire](#pourquoi-as-const-était-nécessaire)
4. [Architecture : Blob réutilisable vs styling site-spécifique](#architecture--blob-réutilisable-vs-styling-site-spécifique)
5. [Exemples complets](#exemples-complets)
6. [Auto-complétion et validation](#auto-complétion-et-validation)

---

## Introduction

Le composant `Blob` est un composant Server Component (RSC) ultra-flexible pour construire des sections de contenu. Il est **réutilisable entre différents sites** et accepte une configuration responsive complète.

**Props principales** :
- `responsive` : Objet contenant toutes les configurations par breakpoint
- `theme` : Nom du thème de couleur (ex: `"brand"`, `"blue"`, `"red"`)
- `className` : Classes CSS additionnelles

---

## Configuration type-safe avec BlobConfig

### ✅ Pattern recommandé (avec BlobConfig)

```tsx
import { Blob } from "@/components/blob/blob"
import type { BlobConfig } from "@/lib/blob-compose"

export function MyComponent() {
  const blobConfig: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",         // ✅ Auto-complétion !
        size: "xl",              // ✅ Validation en temps réel
        align: "center",
        paddingX: "container-xl",
        paddingY: "2xl",
      },
      md: {
        layout: "row",           // ✅ Suggestions : "stack" | "bar" | "row"
        size: "2xl",
        paddingY: "4xl",
      },
    },
    theme: "brand",
  }

  return (
    <Blob {...blobConfig}>
      <Blob.Header>
        <h1>Mon titre</h1>
      </Blob.Header>
    </Blob>
  )
}
```

### ❌ Ancien pattern (à éviter)

```tsx
// ❌ AVANT : Nécessitait `as const` partout
const blobConfig = {
  responsive: {
    base: {
      layout: "stack" as const,    // Verbose et répétitif
      size: "xl" as const,
      align: "center" as const,
      // ...
    },
  },
}
```

---

## Pourquoi `as const` était nécessaire

### Le problème : Type Widening de TypeScript

Par défaut, TypeScript **élargit** les types littéraux en types génériques :

```typescript
const config = {
  responsive: {
    base: {
      layout: "stack",  // TypeScript infère : string (trop large)
    }
  }
}

// TypeScript voit "string" au lieu de "stack" | "bar" | "row"
```

Quand vous passez cet objet au composant `Blob` :

```typescript
// Attendu : Layout (= "stack" | "bar" | "row")
// Reçu : string
// ❌ Erreur TypeScript !
```

### La solution : Annotation de type

En annotant l'objet avec `BlobConfig`, TypeScript **sait** que `layout` doit être de type `Layout` (union de littéraux) :

```typescript
const config: BlobConfig = {
  responsive: {
    base: {
      layout: "stack",  // ✅ TypeScript accepte : "stack" ∈ ("stack" | "bar" | "row")
    }
  }
}
```

### Pourquoi ça marche ?

TypeScript utilise le **type attendu** pour inférer le bon type littéral :

1. Vous annotez : `config: BlobConfig`
2. TypeScript lit la définition : `layout?: Layout` (où `Layout = "stack" | "bar" | "row"`)
3. TypeScript accepte `"stack"` car c'est une valeur valide de `Layout`
4. ✅ Plus besoin de `as const` !

---

## Architecture : Blob réutilisable vs styling site-spécifique

### Séparation des responsabilités

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE RÉUTILISABLE                      │
│  components/blob/blob.tsx (Server Component)                │
│  - Props : responsive, theme, className, children           │
│  - Zéro import depuis config/                               │
│  - Pure primitive de layout/theming                         │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ Props flow
                          │
┌─────────────────────────────────────────────────────────────┐
│                  COUCHE SITE-SPÉCIFIQUE                     │
│  config/blob-appearances.ts (catalogue de styles CSS)       │
│  config/blob-backgrounds.tsx (composants background)        │
│  components/blob/blob-background.tsx (rendu backgrounds)    │
│  - Résolus HORS du Blob                                     │
│  - Appliqués via className ou composants siblings           │
└─────────────────────────────────────────────────────────────┘
```

### Ce que Blob accepte (réutilisable)

```typescript
export type BlobConfig = {
  responsive?: ResponsiveProps  // Configuration layout/spacing/size
  theme?: string                // Nom du thème
  className?: string            // Classes CSS additionnelles
}
```

### Ce que Blob N'accepte PAS (site-spécifique)

- ❌ `appearance` : Résolu externally via `resolveAppearances()`
- ❌ `background` : Résolu externally via `resolveBackgrounds()`

Ces propriétés sont **site-spécifiques** et appliquées via :
1. **Appearance** : Classes CSS mergées dans `className`
2. **Background** : Composant `<BlobBackground>` rendu en sibling

### Exemple complet avec appearance/background

```tsx
import { Blob } from "@/components/blob/blob"
import { BlobBackground } from "@/components/blob/blob-background"
import { resolveAppearances } from "@/config/blob-appearances"
import { resolveBackgrounds, resolveBackgroundClasses } from "@/config/blob-backgrounds"
import { cn } from "@/lib/utils"
import type { BlobConfig } from "@/lib/blob-compose"

export function MyHero() {
  // ✅ SITE-SPÉCIFIQUE : Résolution externe
  const appearanceConfig = resolveAppearances(["headerCentered", "titleLarge"])
  const backgrounds = resolveBackgrounds(["plusCorners", "grid"])
  const backgroundClasses = resolveBackgroundClasses(["plusCorners", "grid"])

  // ✅ RÉUTILISABLE : Config Blob
  const blobConfig: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        size: "xl",
        align: "center",
        paddingX: "container-xl",
        paddingY: "2xl",
      },
    },
    theme: "brand",
  }

  return (
    <Blob
      {...blobConfig}
      className={cn(
        appearanceConfig.blobClassName,  // Appearance classes
        backgroundClasses,                 // Background classes
        backgrounds.length > 0 && "relative"
      )}
    >
      {/* Background rendu en sibling */}
      <BlobBackground backgrounds={backgrounds} />

      {/* Contenu du Blob */}
      <Blob.Header className={appearanceConfig.headerClassName}>
        <h1>Mon titre</h1>
      </Blob.Header>
    </Blob>
  )
}
```

---

## Exemples complets

### Exemple 1 : Hero simple

```tsx
import { Blob } from "@/components/blob/blob"
import type { BlobConfig } from "@/lib/blob-compose"

export function SimpleHero() {
  const config: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        size: "lg",
        align: "center",
        paddingY: "2xl",
      },
    },
  }

  return (
    <Blob {...config}>
      <Blob.Header>
        <h1>Bienvenue</h1>
        <p>Une description courte</p>
      </Blob.Header>
    </Blob>
  )
}
```

### Exemple 2 : Section responsive avec figure

```tsx
import { Blob } from "@/components/blob/blob"
import type { BlobConfig } from "@/lib/blob-compose"

export function FeatureSection() {
  const config: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        size: "md",
        paddingX: "container-md",
        paddingY: "xl",
      },
      md: {
        layout: "row",         // Desktop : layout horizontal
        figureWidth: "1/2",    // Figure prend 50%
      },
    },
    theme: "blue",
  }

  return (
    <Blob {...config}>
      <Blob.Header>
        <h2>Notre solution</h2>
        <p>Description de la fonctionnalité</p>
      </Blob.Header>

      <Blob.Figure>
        <img src="/feature.jpg" alt="Feature" />
      </Blob.Figure>
    </Blob>
  )
}
```

### Exemple 3 : Card avec actions

```tsx
import { Blob } from "@/components/blob/blob"
import { Button } from "@/components/ui/button"
import type { BlobConfig } from "@/lib/blob-compose"

export function PricingCard() {
  const config: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        size: "lg",
        align: "center",
        actions: "after",      // Actions en bas
        paddingX: "xl",
        paddingY: "2xl",
        gapY: "lg",
      },
    },
  }

  return (
    <Blob {...config}>
      <Blob.Header>
        <h3>Plan Premium</h3>
        <p>49€/mois</p>
      </Blob.Header>

      <Blob.Content>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </Blob.Content>

      <Blob.Actions>
        <Button>Souscrire</Button>
      </Blob.Actions>
    </Blob>
  )
}
```

---

## Auto-complétion et validation

### Ce que vous obtenez avec BlobConfig

#### 1. Auto-complétion intelligente

Quand vous tapez dans votre IDE :

```typescript
const config: BlobConfig = {
  responsive: {
    base: {
      layout: "█"  // Ctrl+Space → "stack" | "bar" | "row"
```

VSCode vous proposera automatiquement toutes les valeurs valides.

#### 2. Validation en temps réel

```typescript
const config: BlobConfig = {
  responsive: {
    base: {
      layout: "stackk",  // ⚠️ Erreur TypeScript immédiate
      //      ~~~~~~~
      // Type '"stackk"' is not assignable to type 'Layout'
```

#### 3. IntelliSense sur les propriétés

Tapez `base: {█}` et vous verrez toutes les options :

- `layout` : Layout du blob
- `size` : Taille des tokens (heading, body, gaps, etc.)
- `marker` : Position du marker
- `actions` : Position des actions
- `align` : Alignement horizontal
- `direction` : Direction (default/reverse)
- `gapX` : Espacement horizontal
- `gapY` : Espacement vertical
- `paddingX` : Padding horizontal
- `paddingY` : Padding vertical
- `figureWidth` : Largeur de la figure (1/3, 1/2, 2/3, etc.)
- `figureBleed` : Figure en débordement (full/none)
- Et plus...

#### 4. Documentation inline

Survolez n'importe quelle propriété pour voir sa documentation :

```typescript
size: "xl"  // ← Hover : SizeValue = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | ...
```

---

## Références

- **Types** : [`lib/blob-compose.ts`](../lib/blob-compose.ts)
- **Composant Blob** : [`components/blob/blob.tsx`](../components/blob/blob.tsx)
- **Configuration** : [`config/blob-appearances.ts`](../config/blob-appearances.ts), [`config/blob-backgrounds.tsx`](../config/blob-backgrounds.tsx)
- **Architecture complète** : [`docs/blob-system.md`](./blob-system.md)
- **Système responsive** : [`CLAUDE_CONTEXT.md`](../CLAUDE_CONTEXT.md#responsive-basé-sur-objets-toujours-actif)

---

**Version** : 2026-03-26
