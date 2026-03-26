# Plan : Simplification de l'API Blob avec injection de config

**Date** : 2026-03-26
**Statut** : Proposition
**Objectif** : Simplifier l'utilisation de background/appearance dans Blob tout en préservant sa réutilisabilité

---

## 🎯 Contraintes et objectifs

### Contraintes non-négociables

1. **Blob DOIT rester un Server Component** (aucun "use client")
2. **Blob DOIT être réutilisable entre différents sites**
3. **Background et appearance sont site-spécifiques** (dans `config/`)
4. **L'architecture doit respecter la séparation réutilisable/site-spécifique**

### Objectifs DX

1. **API simplifiée** : `<Blob background={["grid"]} appearance={["titleLarge"]}>` au lieu de résolutions manuelles
2. **Zéro import de config** dans le code utilisateur
3. **Classes appliquées automatiquement** aux compound components (Header, Content, etc.)
4. **Un seul composant Blob** (pas de Blob/BlobStyled séparé)

---

## 🏗️ Architecture proposée : Pattern d'injection de config

### Principe

Blob reste réutilisable mais **requiert** un fichier de config dans chaque site qui implémente un contrat standardisé.

```
Blob (réutilisable)
  ↓ importe depuis chemin standardisé
@/config/blob-config.tsx (site-spécifique)
  ↓ importe
@/config/blob-appearances.ts (site-spécifique)
@/config/blob-backgrounds.tsx (site-spécifique)
```

### Avantages

- ✅ Blob reste pur (pas de couplage à un site spécifique)
- ✅ Contrat TypeScript standardisé
- ✅ Chaque site implémente sa propre logique de résolution
- ✅ DX parfaite : `<Blob background={["grid"]}>`
- ✅ Server Component (toute la chaîne est server-safe)

---

## 📋 Plan d'implémentation

### Étape 1 : Créer le contrat (interface)

**Fichier** : `lib/blob-config-contract.ts` (nouveau)

```typescript
import type { ReactNode } from 'react'

/**
 * Résultat de la résolution du styling Blob.
 * Retourné par la fonction resolveBlobStyling() que chaque site doit implémenter.
 */
export interface BlobStylingResult {
  /** Background components React à rendre dans le Blob */
  backgrounds: ReactNode[]

  /** Classes CSS à appliquer au conteneur Blob */
  blobClassName?: string

  /** Classes CSS pour les compound components (optionnel) */
  headerClassName?: string
  contentClassName?: string
  actionsClassName?: string
  figureClassName?: string
  markerClassName?: string
}

/**
 * Signature de la fonction que chaque site doit implémenter dans config/blob-config.tsx
 *
 * @param background - Keys du registre backgrounds (ex: ["grid", "plusCorners"])
 * @param appearance - Keys du registre appearances (ex: ["titleLarge", "headerCentered"])
 * @returns Object contenant les backgrounds à rendre et les classes CSS à appliquer
 */
export type ResolveBlobStyling = (
  background?: string | string[],
  appearance?: string | string[]
) => BlobStylingResult
```

**Pourquoi** : Définit le contrat que tous les sites doivent respecter.

---

### Étape 2 : Implémenter la config du site actuel

**Fichier** : `config/blob-config.tsx` (nouveau)

```typescript
import type { BlobStylingResult } from '@/lib/blob-config-contract'
import { resolveAppearances } from './blob-appearances'
import { resolveBackgrounds, resolveBackgroundClasses } from './blob-backgrounds'
import { BlobBackground } from '@/components/blob/blob-background'
import { cn } from '@/lib/utils'

/**
 * Implémentation site-spécifique de la résolution Blob styling.
 *
 * Cette fonction est appelée par le composant Blob pour résoudre
 * les backgrounds et appearances en classes CSS et composants React.
 */
export function resolveBlobStyling(
  background?: string | string[],
  appearance?: string | string[]
): BlobStylingResult {
  // Résolution background
  const backgroundDefs = background ? resolveBackgrounds(background) : []
  const backgroundClasses = background ? resolveBackgroundClasses(background) : ""

  // Résolution appearance
  const appearanceConfig = appearance ? resolveAppearances(appearance) : undefined

  // Construction des backgrounds React
  const backgrounds = backgroundDefs.length > 0
    ? [<BlobBackground key="blob-bg" backgrounds={backgroundDefs} />]
    : []

  return {
    backgrounds,
    blobClassName: cn(
      backgroundClasses,
      appearanceConfig?.blobClassName,
      backgroundDefs.length > 0 && "relative"
    ),
    headerClassName: appearanceConfig?.headerClassName,
    contentClassName: appearanceConfig?.contentClassName,
    actionsClassName: appearanceConfig?.actionsClassName,
    figureClassName: appearanceConfig?.figureClassName,
    markerClassName: appearanceConfig?.markerClassName,
  }
}
```

**Pourquoi** : Implémente le contrat pour ce site spécifique.

---

### Étape 3 : Modifier le composant Blob

**Fichier** : `components/blob/blob.tsx`

**Changements** :

1. **Ajouter imports** :
```typescript
import { resolveBlobStyling } from '@/config/blob-config'
import { createContext, useContext } from 'react'
```

2. **Créer un Context pour partager les classes** :
```typescript
interface BlobStylingContextValue {
  headerClassName?: string
  contentClassName?: string
  actionsClassName?: string
  figureClassName?: string
  markerClassName?: string
}

const BlobStylingContext = createContext<BlobStylingContextValue | null>(null)
```

3. **Étendre BlobProps** :
```typescript
interface BlobProps extends React.ComponentProps<"div">, BlobComposableProps {
  background?: string | string[]
  appearance?: string | string[]
}
```

4. **Modifier le composant Blob** :
```typescript
export function Blob({
  background,
  appearance,
  className,
  responsive,
  theme,
  children,
  ...divProps
}: BlobProps) {
  // Résolution du styling via la config du site
  const styling = resolveBlobStyling(background, appearance)

  // Composition des classes
  const composedClassName = cn(
    composeBlobClasses({ responsive, theme }),
    styling.blobClassName,
    className
  )

  return (
    <BlobStylingContext.Provider value={{
      headerClassName: styling.headerClassName,
      contentClassName: styling.contentClassName,
      actionsClassName: styling.actionsClassName,
      figureClassName: styling.figureClassName,
      markerClassName: styling.markerClassName,
    }}>
      <div {...divProps} className={composedClassName} data-slot="blob">
        {/* Backgrounds injectés automatiquement */}
        {styling.backgrounds}

        {/* Contenu */}
        {children}
      </div>
    </BlobStylingContext.Provider>
  )
}
```

5. **Modifier les compound components pour utiliser le Context** :

```typescript
// BlobHeader
const BlobHeader = React.forwardRef<HTMLDivElement, BlobHeaderProps>(
  ({ className, ...props }, ref) => {
    const styling = useContext(BlobStylingContext)

    return (
      <div
        ref={ref}
        className={cn(styling?.headerClassName, className)}
        data-slot="blob-header"
        {...props}
      />
    )
  }
)
BlobHeader.displayName = "Blob.Header"
Blob.Header = BlobHeader

// BlobContent
const BlobContent = React.forwardRef<HTMLDivElement, BlobContentProps>(
  ({ className, ...props }, ref) => {
    const styling = useContext(BlobStylingContext)

    return (
      <div
        ref={ref}
        className={cn(styling?.contentClassName, className)}
        data-slot="blob-content"
        {...props}
      />
    )
  }
)
BlobContent.displayName = "Blob.Content"
Blob.Content = BlobContent

// Pareil pour Actions, Figure, Marker...
```

**Pourquoi** : Blob appelle la config injectée et partage les classes via Context.

---

### Étape 4 : Mettre à jour BlobComposableProps

**Fichier** : `lib/blob-compose.ts`

**Changements** :

```typescript
export type BlobComposableProps = {
  /** Objet responsive contenant toutes les props par breakpoint */
  responsive?: ResponsiveProps
  /** Thème de couleur (ex: "brand", "blue", "red") */
  theme?: string
  /** Backgrounds à appliquer (keys du registre site-spécifique) */
  background?: string | string[]
  /** Appearances à appliquer (keys du registre site-spécifique) */
  appearance?: string | string[]
}
```

Et mettre à jour `BlobConfig` :

```typescript
/**
 * Type helper pour construire des configs Blob manuellement dans votre code.
 *
 * @example
 * ```tsx
 * const config: BlobConfig = {
 *   responsive: { base: { layout: "stack", size: "xl" } },
 *   background: ["grid", "plusCorners"],
 *   appearance: ["titleLarge"]
 * }
 * ```
 */
export type BlobConfig = BlobComposableProps & {
  className?: string
}
```

**Pourquoi** : Ajoute les nouvelles props au type de base.

---

### Étape 5 : Migrer les usages existants

#### 5.1 `components/benchmark/benchmark-hero.tsx`

**Avant** :
```typescript
import { Blob } from "@/components/blob/blob"
import { BlobBackground } from "@/components/blob/blob-background"
import { resolveBackgrounds, resolveBackgroundClasses } from "@/config/blob-backgrounds"
import { cn } from "@/lib/utils"
import type { BlobConfig } from "@/lib/blob-compose"

export function BenchmarkHero() {
  const backgrounds = resolveBackgrounds(["plusCorners", "grid"])
  const backgroundClasses = resolveBackgroundClasses(["plusCorners", "grid"])

  const blobConfig: BlobConfig = {
    responsive: {
      base: { layout: "stack", size: "xl", align: "left", paddingX: "container-xl", paddingY: "2xl" },
      md: { size: "2xl", paddingY: "4xl" },
    },
  }

  return (
    <section className="bg-background border-b border-border">
      <Blob {...blobConfig} className={cn(backgroundClasses, backgrounds.length > 0 && "relative")}>
        <BlobBackground backgrounds={backgrounds} />
        <Blob.Header>
          <Title as="h1">...</Title>
        </Blob.Header>
      </Blob>
    </section>
  )
}
```

**Après** :
```typescript
import { Blob } from "@/components/blob/blob"
import type { BlobConfig } from "@/lib/blob-compose"

export function BenchmarkHero() {
  const blobConfig: BlobConfig = {
    responsive: {
      base: { layout: "stack", size: "xl", align: "left", paddingX: "container-xl", paddingY: "2xl" },
      md: { size: "2xl", paddingY: "4xl" },
    },
    background: ["plusCorners", "grid"],
  }

  return (
    <section className="bg-background border-b border-border">
      <Blob {...blobConfig}>
        <Blob.Header>
          <Title as="h1">...</Title>
        </Blob.Header>
      </Blob>
    </section>
  )
}
```

**Suppressions** :
- ❌ Import `BlobBackground`
- ❌ Import `resolveBackgrounds`, `resolveBackgroundClasses`
- ❌ Import `cn`
- ❌ Variables `backgrounds`, `backgroundClasses`
- ❌ Prop `className` manuelle
- ❌ `<BlobBackground>` explicite

#### 5.2 `components/benchmark/benchmark-question-card.tsx`

**Avant** :
```typescript
const appearanceConfig = resolveAppearances(["eyebrowAsBadge", "eyebrowBadgeOutline"])

const blobConfig: BlobConfig = {
  responsive: {
    base: { actions: "after", layout: "stack", size: "lg", align: "center", paddingX: "none", paddingY: "xl", gapY: "10xl" },
    md: { size: "2xl" }
  },
}

return (
  <Blob {...blobConfig} className={appearanceConfig.blobClassName}>
    <Blob.Header className={appearanceConfig.headerClassName}>
      ...
    </Blob.Header>
  </Blob>
)
```

**Après** :
```typescript
const blobConfig: BlobConfig = {
  responsive: {
    base: { actions: "after", layout: "stack", size: "lg", align: "center", paddingX: "none", paddingY: "xl", gapY: "10xl" },
    md: { size: "2xl" }
  },
  appearance: ["eyebrowAsBadge", "eyebrowBadgeOutline"],
}

return (
  <Blob {...blobConfig}>
    <Blob.Header>
      ...
    </Blob.Header>
  </Blob>
)
```

**Suppressions** :
- ❌ Import `resolveAppearances`
- ❌ Variable `appearanceConfig`
- ❌ Props `className` manuelles sur Blob et compound components

#### 5.3 Autres fichiers à migrer

Rechercher tous les usages de :
- `resolveBackgrounds()` + `resolveBackgroundClasses()`
- `resolveAppearances()`
- `<BlobBackground>`

Et appliquer le même pattern de simplification.

---

### Étape 6 : Documenter

#### 6.1 Mettre à jour `docs/blob-usage.md`

Ajouter section "Utiliser background et appearance" :

```markdown
## Background et Appearance

Le composant Blob supporte des props simplifiées pour appliquer backgrounds et appearances :

```tsx
<Blob
  responsive={{ base: { layout: "stack", size: "lg" } }}
  background={["grid", "plusCorners"]}
  appearance={["titleLarge", "headerCentered"]}
>
  <Blob.Header>
    <h1>Title</h1>
  </Blob.Header>
</Blob>
```

Les classes CSS sont appliquées automatiquement :
- `background` → injecte `<BlobBackground>` et ajoute classes au root
- `appearance` → ajoute classes au root et aux compound components via Context

**Note** : Nécessite que le site implémente `config/blob-config.tsx` (voir ci-dessous).
```

Ajouter section "Configuration requise pour chaque site" :

```markdown
## Configuration requise (pour sites réutilisant Blob)

Chaque site utilisant Blob doit créer `/config/blob-config.tsx` :

```tsx
import type { BlobStylingResult } from '@/lib/blob-config-contract'

export function resolveBlobStyling(
  background?: string | string[],
  appearance?: string | string[]
): BlobStylingResult {
  // Implémentation site-spécifique
  // Voir docs/blob-usage.md pour exemple complet
}
```

Site minimal (sans styling avancé) :
```tsx
export function resolveBlobStyling(): BlobStylingResult {
  return { backgrounds: [], blobClassName: undefined }
}
```
```

#### 6.2 Mettre à jour `CLAUDE_CONTEXT.md`

Mettre à jour la section architecture :

```markdown
### Configuration (`/config`)

| Fichier | Rôle |
|---------|------|
| `blob-appearances.ts` | Registre des apparences (site-spécifique) |
| `blob-backgrounds.tsx` | Registre des arrière-plans (site-spécifique) |
| `blob-config.tsx` | **Contrat requis** : résolution background/appearance pour Blob |
| `iconify-collections.ts` | Configuration collections Iconify |
```

Et mettre à jour la section "Typage des configs Blob manuelles" :

```markdown
### Typage des configs Blob manuelles

```typescript
import type { BlobConfig } from '@/lib/blob-compose'

const config: BlobConfig = {
  responsive: {
    base: { layout: "stack", size: "xl" }
  },
  background: ["grid", "plusCorners"],  // ✅ Simplifié !
  appearance: ["titleLarge"],           // ✅ Simplifié !
  theme: "brand"
}

<Blob {...config}>...</Blob>
```

**Nouvelles props** : `background` et `appearance` gèrent automatiquement :
- Injection de `<BlobBackground>`
- Application des classes CSS au root et compound components
- Via config site-spécifique `config/blob-config.tsx` (pattern injection)
```

---

### Étape 7 : Tests de compilation

Vérifier que tout compile :

```bash
pnpm tsc --noEmit
```

Et tester visuellement :
```bash
pnpm dev
```

Pages à vérifier :
- `/benchmark` (BenchmarkHero avec background)
- Autres pages utilisant Blob

---

## 📊 Résumé des changements

### Fichiers créés

1. `lib/blob-config-contract.ts` - Contrat TypeScript
2. `config/blob-config.tsx` - Implémentation site actuel

### Fichiers modifiés

1. `components/blob/blob.tsx` - Ajout background/appearance props + Context
2. `lib/blob-compose.ts` - Ajout props dans `BlobComposableProps` et `BlobConfig`
3. `components/benchmark/benchmark-hero.tsx` - Migration usage
4. `components/benchmark/benchmark-question-card.tsx` - Migration usage
5. `docs/blob-usage.md` - Documentation
6. `CLAUDE_CONTEXT.md` - Mise à jour architecture

### Fichiers à analyser pour migration

- Tous les fichiers important `resolveBackgrounds`, `resolveBackgroundClasses`, `resolveAppearances`
- Tous les fichiers utilisant `<BlobBackground>` explicitement

---

## 🎯 Résultat final

### Avant

```tsx
const backgrounds = resolveBackgrounds(["grid"])
const backgroundClasses = resolveBackgroundClasses(["grid"])
const appearanceConfig = resolveAppearances(["titleLarge"])

<Blob className={cn(backgroundClasses, appearanceConfig.blobClassName, backgrounds.length > 0 && "relative")}>
  <BlobBackground backgrounds={backgrounds} />
  <Blob.Header className={appearanceConfig.headerClassName}>
    <h1>Title</h1>
  </Blob.Header>
</Blob>
```

### Après

```tsx
<Blob
  background={["grid"]}
  appearance={["titleLarge"]}
>
  <Blob.Header>
    <h1>Title</h1>
  </Blob.Header>
</Blob>
```

### Bénéfices

- ✅ **-5 imports** (BlobBackground, resolveX, cn)
- ✅ **-3 variables** de résolution
- ✅ **-1 composant explicite** (`<BlobBackground>`)
- ✅ **-Tous les className manuels** sur compound components
- ✅ **Blob reste réutilisable** (config injectable)
- ✅ **Server Component** (toute la chaîne)

---

**Version** : 2026-03-26
