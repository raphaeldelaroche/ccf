# Étude : Migration vers un système de preview basé sur iframe

**Date :** 2026-03-25
**Auteur :** Claude Code
**Statut :** Étude de faisabilité

---

## 📋 Résumé exécutif

Cette étude analyse la faisabilité et les approches possibles pour migrer le système de preview responsive actuel (basé sur container queries) vers une architecture iframe qui permettra d'utiliser des media queries standard tout en conservant une expérience d'édition interactive.

**Problème identifié :** Le dual-system actuel (container queries en preview, media queries en production) crée des frictions dans l'expérience développeur, notamment pour les configurations d'apparences qui ne fonctionnent pas en mode preview.

**Recommandation :** Migration vers une preview basée sur iframe en utilisant un stack moderne et éprouvé (react-frame-component + Penpal).

**Estimation :** 7-11 jours de développement.

---

## 🔍 Analyse du problème actuel

### Architecture existante

Le projet utilise actuellement **deux systèmes CSS parallèles** pour gérer le responsive :

#### 1. Mode Production (Media Queries)
- **Localisation :** Pages publiques via `/app/[slug]/page.tsx` et `render-page-blocks.tsx`
- **Composants :** `Blob` et `BlobIterator` (Server Components)
- **Classes CSS :** Breakpoints Tailwind standard (`md:`, `lg:`, `xl:`, `2xl:`)
- **Mécanisme :** Media queries basées sur la taille du viewport

**Exemple :**
```typescript
<Blob
  responsive={{
    base: { layout: "stack", size: "md" },
    md: { layout: "row" },
    lg: { size: "xl" }
  }}
/>
// Génère : "blob-stack md:blob-row md:blob-size-md lg:blob-size-xl"
```

#### 2. Mode Preview (Container Queries)
- **Localisation :** `/components/new-editor/BlockCanvas.tsx`
- **Composants :** `ClientBlob` et `ClientBlobIterator` (Client Components wrappers)
- **Classes CSS :** Variantes avec préfixe `@` (`@md:`, `@lg:`, `@xl:`, `@2xl:`)
- **Mécanisme :** Container queries basées sur la taille du conteneur parent

**Implémentation technique :**
```typescript
// BlockCanvas.tsx (lignes 92-98)
<div style={{
  containerType: 'inline-size',
  maxWidth: breakpointWidths[previewBreakpoint]
}}>
  <PreviewProvider value={{ isPreviewMode: true }}>
    <ClientBlob {...props} />
  </PreviewProvider>
</div>

// ClientBlob.tsx
const { isPreviewMode } = usePreview()
const classes = composeBlobClasses(responsive, isPreviewMode) // Active les @md: variants
```

**Génération des classes CSS :**
```typescript
// blob-compose.ts (lignes 208-224)
function parseResponsiveClass(
  value: string,
  breakpoint: string,
  containerMode: boolean
) {
  const prefix = containerMode ? `@${breakpoint}:` : `${breakpoint}:`
  return `${prefix}${value}`
}
// Exemple : "blob-stack" → "@md:blob-stack" en preview
```

**Safelist CSS extensive :**
```css
/* styles/blob.css (lignes 50-82) */
/* 82 lignes de patterns dupliqués : */
@media (min-width: 768px) { .md\:blob-stack { ... } }
@container (min-width: 768px) { .\@md\:blob-stack { ... } }
/* Répété pour : sm, md, lg, xl, 2xl × ~20 classes blob */
```

---

### Le conflit architectural

#### Pourquoi ce dual-system ?

**Contrainte technique fondamentale :**
- Les **media queries** réagissent à la **taille du viewport** (fenêtre du navigateur)
- En mode édition, le viewport fait 1920px (ou plus)
- Le canvas de preview fait seulement 375-1200px selon le breakpoint
- **Impossible** de simuler un mobile (375px) quand le viewport réel fait 1920px

**Solution actuelle : Container queries**
- Réagissent à la **taille du conteneur parent**, pas du viewport
- Permettent de simuler différents breakpoints dans un canvas réduit
- Activées via `containerType: 'inline-size'` sur le wrapper

#### Points de friction identifiés

**A. Configurations d'apparences cassées en preview**

Localisation : `config/blob-appearances.ts` (lignes 89-90, 93-94, 111-116)

```typescript
// Exemple : apparence "subtitleOffset"
export const APPEARANCES: Record<string, AppearanceDefinition> = {
  subtitleOffset: {
    slots: {
      subtitle: 'md:col-start-2', // ❌ Ne fonctionne PAS en preview
      // ...
    }
  },
  ratio2to1: {
    slots: {
      figure: 'xl:aspect-[2/1]', // ❌ Ne fonctionne PAS en preview
    }
  }
}
```

**Problème :** Ces classes passent par le prop `className`, pas par `composeBlobClasses()`, donc elles ne sont jamais transformées en `@md:` ou `@xl:`. Résultat : les apparences ne s'affichent pas correctement en mode preview.

**B. Bloat CSS**
- Chaque classe responsive existe en **2 versions** (media + container)
- 82 lignes de safelist à maintenir manuellement
- Tailwind JIT génère les deux variantes systématiquement
- Taille du bundle CSS augmentée inutilement

**C. Split mental model**
- Les développeurs doivent se demander : "Cette classe fonctionnera-t-elle en preview ET en production ?"
- Deux systèmes CSS différents pour la même UI
- Debugging complexe : "Pourquoi ça marche en prod mais pas en preview ?"
- Impossible d'utiliser des patterns Tailwind standard dans les configs

**D. Limitation framework**
- Tailwind JIT ne supporte pas nativement le concept de "dual-mode"
- Safelist manuelle fragile (facile d'oublier une classe)
- Incompatible avec des plugins Tailwind tiers qui génèrent des classes responsive

---

### Exemple concret du problème

**Scénario :** Un développeur veut créer une apparence "heroImage" qui affiche l'image en pleine largeur sur mobile, et avec un ratio 16:9 sur desktop.

```typescript
// config/blob-appearances.ts
heroImage: {
  slots: {
    figure: 'w-full md:aspect-video md:object-cover'
  }
}
```

**Résultat :**
- ✅ **En production** : Fonctionne parfaitement (media queries standard)
- ❌ **En preview** : L'image reste pleine largeur même en mode "MD", car `md:aspect-video` n'est pas transformé en `@md:aspect-video`

**Workaround actuel :** Impossible sans dupliquer la logique dans `composeBlobClasses()`, ce qui casse l'architecture déclarative des apparences.

---

## 🛠 Solutions explorées

### Solution 1 : Preview basée sur iframe ⭐ **RECOMMANDÉE**

#### Concept

Rendre la preview dans une **iframe** qui possède sa propre viewport, puis contrôler la largeur de l'iframe selon le breakpoint sélectionné. Les media queries fonctionnent naturellement car le "viewport" de l'iframe correspond à la largeur simulée.

#### Architecture proposée

```typescript
// components/new-editor/IframePreview.tsx
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { connectToChild } from 'penpal'

function IframePreview({ blocks, previewBreakpoint }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const widths = { base: 375, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }

  // Setup communication bridge
  useEffect(() => {
    if (!frameRef.current) return

    const connection = connectToChild({
      iframe: frameRef.current,
      methods: {
        onBlockSelect: (id: string) => updateEditorState({ selectedBlockId: id }),
        onBlockHover: (id: string) => setHoveredBlock(id)
      }
    })

    connection.promise.then(child => {
      // Parent peut appeler des méthodes dans l'iframe
      child.highlightBlock(selectedBlockId)
    })
  }, [selectedBlockId])

  return (
    <Frame
      ref={frameRef}
      style={{ width: widths[previewBreakpoint], border: 'none' }}
    >
      <FrameContextConsumer>
        {({ document }) => (
          <>
            {/* Injection CSS */}
            <style>{getAllStyles()}</style>

            {/* Rendu des blocs */}
            <PreviewContent blocks={blocks} />
          </>
        )}
      </FrameContextConsumer>
    </Frame>
  )
}

// components/new-editor/PreviewContent.tsx (s'exécute dans l'iframe)
function PreviewContent({ blocks }: Props) {
  const parent = usePenpalParent({
    methods: {
      highlightBlock: (id: string) => { /* apply visual highlight */ },
      scrollToBlock: (id: string) => { /* scroll into view */ }
    }
  })

  const handleClick = (blockId: string) => {
    parent.onBlockSelect?.(blockId) // Appel via postMessage
  }

  return <BlockRenderer blocks={blocks} onClick={handleClick} />
}
```

#### Avantages

✅ **Une seule source de vérité CSS**
- Tout le monde utilise des media queries standard (`md:`, `lg:`, `xl:`)
- Supprime complètement le dual-system
- Les apparences fonctionnent immédiatement sans modification

✅ **Standard industrie**
- Storybook utilise des iframes pour Canvas preview
- Figma plugins utilisent des iframes pour l'isolation
- Chrome DevTools utilise des iframes pour le responsive mode
- Pattern éprouvé et documenté

✅ **Preview ultra-précise**
- Rendu strictement identique à la production
- Mêmes media queries, mêmes breakpoints, même cascade CSS
- Possibilité d'utiliser les DevTools du navigateur sur l'iframe

✅ **Réduction du code**
- Supprime 82 lignes de safelist CSS
- Supprime `ClientBlob.tsx` et `ClientBlobIterator.tsx`
- Supprime la logique `containerMode` dans `blob-compose.ts`
- Supprime le context `isPreviewMode`
- Estimation : **-500 lignes de code**

✅ **Isolation CSS complète**
- L'iframe est un document isolé, pas de collision de styles
- Possibilité de tester différents thèmes sans impact sur l'éditeur
- Meilleure séparation des responsabilités

#### Défis techniques

❌ **Communication React Context impossible**
- Le Context React ne traverse pas la frontière iframe
- **Solution :** Utiliser postMessage via une librairie type-safe (Penpal)
- Pattern : Parent et Child exposent des méthodes appelables via Promises

❌ **Sélection et interaction de blocs**
- Click dans iframe → événement capturé dans iframe, pas dans parent
- **Solution :** Event listeners dans l'iframe qui envoient des messages au parent
- Le parent met à jour `selectedBlockId`, puis notifie l'iframe via Penpal

❌ **Serialization React → HTML**
- Besoin de convertir les composants React en HTML pour `srcDoc`
- **Solution :** Réutiliser `render-page-blocks.tsx` (déjà existant) ou utiliser `renderToStaticMarkup()`
- Alternatively : utiliser `react-frame-component` qui permet de rendre du JSX directement (pas de serialization)

❌ **Injection CSS**
- L'iframe a son propre `<head>`, il faut injecter tous les styles
- **Solution :** Via `<FrameContextConsumer>` de `react-frame-component` qui donne accès au `document` de l'iframe
- Injecter Tailwind, blob.css, themes.css, globals.css

❌ **Hot reload / HMR**
- Re-render du parent → iframe se recharge complètement (perte d'état)
- **Solution :** Updates ciblées via postMessage (`updateBlockData()`) plutôt que full reload
- Garder l'état de l'iframe séparé de l'état du parent

#### Estimation de complexité

**Niveau :** Moyen-Élevé
**Durée estimée :** 7-11 jours
**Risque technique :** Moyen (patterns éprouvés, librairies matures)

---

### Solution 2 : Transformation des classes d'apparence (Hybrid)

#### Concept

Garder le système dual actuel, mais ajouter une fonction qui transforme automatiquement les classes d'apparence de `md:` → `@md:` en mode preview.

#### Architecture proposée

```typescript
// lib/transform-appearance-classes.ts
export function transformAppearanceClasses(
  className: string,
  isPreviewMode: boolean
): string {
  if (!isPreviewMode) return className

  // Transform md: → @md:, xl: → @xl:, etc.
  return className.replace(/\b(sm|md|lg|xl|2xl):/g, '@$1:')
}

// components/new-editor/BlockRenderer.tsx (ou ClientBlob.tsx)
const appearanceClasses = resolveAppearances(data.appearance)
const transformedClasses = transformAppearanceClasses(
  appearanceClasses.blobClassName,
  isPreviewMode
)

<Blob className={cn(transformedClasses, ...)} />
```

#### Avantages

✅ **Quick win**
- Implémentation en 1-2 jours maximum
- Changements localisés (une fonction utility + quelques call sites)
- Risque minimal

✅ **Déblocage immédiat**
- Les apparences fonctionnent immédiatement en preview
- Permet de continuer le développement sans friction
- Pas de refonte architecturale

✅ **Backward compatible**
- Aucun changement breaking
- Les apparences existantes fonctionnent sans modification
- Peut coexister avec le système actuel

#### Inconvénients

❌ **Ne résout pas le problème de fond**
- Le dual-system reste en place
- Toujours 82 lignes de safelist à maintenir
- CSS bloat continue

❌ **Manipulation de strings**
- Approche moins robuste que de la vraie transformation AST
- Risque de regex qui match des faux positifs
- Difficile de gérer les edge cases (classes custom, variantes complexes)

❌ **Coverage incomplète**
- Ne couvre que les classes passées par `transformAppearanceClasses()`
- Si un développeur ajoute des classes custom via `className` ailleurs, elles ne seront pas transformées
- Nécessite de penser à appliquer la transformation partout

❌ **Dette technique**
- Ajoute de la complexité au lieu d'en retirer
- Ne simplifie pas le système, le rend plus opaque
- Futur: migration vers iframe sera plus difficile (plus de code à retirer)

#### Estimation de complexité

**Niveau :** Faible
**Durée estimée :** 1-2 jours
**Risque technique :** Faible

#### Verdict

Cette solution est un **palliatif acceptable** si le temps ou les ressources manquent pour faire la migration iframe. Recommandé comme **solution temporaire** en attendant une vraie refonte.

---

### Solution 3 : CSS Transform/Scale (Non recommandée)

#### Concept exploré

Utiliser `transform: scale()` pour zoomer/dézoomer un canvas plus large et simuler des viewports plus petits.

```typescript
// Pour simuler MD (768px) dans un container de 1200px
<div style={{ width: '1200px', overflow: 'hidden' }}>
  <div style={{
    width: '768px',
    transform: 'scale(1.5625)', // 1200/768
    transformOrigin: 'top left'
  }}>
    {/* Contenu à 768px "réel" */}
  </div>
</div>
```

#### Pourquoi ça ne fonctionne PAS

❌ **Fundamental flaw :** Les media queries se basent sur la **vraie taille du viewport**, pas sur la taille apparente après `transform: scale()`.

**Exemple :**
- Viewport navigateur : 1920px
- Canvas avec scale : `width: 768px; transform: scale(1.5)`
- Taille visuelle : 1152px
- **Media query `@media (min-width: 768px)` se déclenche quand même** car le viewport réel fait 1920px, pas 768px

C'est exactement la raison pour laquelle les container queries étaient nécessaires au départ.

#### Verdict

**Abandonné.** Cette approche ne résout pas le problème fondamental.

---

### Solution 4 : Dynamic Stylesheet Injection (Non recommandée)

#### Concept exploré

Réécrire dynamiquement les media queries en container queries à la volée via le CSS Object Model (CSSOM).

```typescript
function transformStylesheet() {
  const sheets = document.styleSheets

  sheets.forEach(sheet => {
    Array.from(sheet.cssRules).forEach(rule => {
      if (rule instanceof CSSMediaRule) {
        // Transform @media (min-width: 768px)
        // → @container (min-width: 768px)
        const newRule = createContainerRule(rule)
        sheet.insertRule(newRule)
      }
    })
  })
}
```

#### Pourquoi c'est trop complexe

❌ **CSSOM manipulation est fragile**
- API bas niveau avec de nombreux edge cases
- Difficile de gérer les règles imbriquées, les at-rules complexes
- Performance médiocre (parsing et transformation à chaque render)

❌ **Conflits avec Tailwind JIT**
- Tailwind génère des classes à la demande
- Impossible d'intercepter la génération pour transformer les classes
- Nécessiterait de hooker dans le build process de Tailwind

❌ **CORS et CSP**
- Impossible d'accéder aux stylesheets externes (CDN, fonts)
- Les Content Security Policies strictes peuvent bloquer la manipulation dynamique
- Risques de sécurité

❌ **Maintenance nightmare**
- Code extrêmement fragile
- Différences entre navigateurs (Safari vs Chrome)
- Incompatible avec les mises à jour de Tailwind ou autres frameworks CSS
- Quasi impossible à déboguer

#### Verdict

**Fortement déconseillé.** Trop complexe, trop fragile, pas maintenable. Ne jamais implémenter cette approche.

---

## 📦 Stack technique recommandée

Suite à une recherche approfondie sur l'écosystème npm et GitHub, voici les librairies recommandées pour implémenter la solution iframe.

### Librairies principales

#### 1. **react-frame-component** (Rendering)

**Package npm :** `react-frame-component`
**GitHub :** ryanseddon/react-frame-component
**Stars :** 1,800 | **Dernière mise à jour :** Mars 2026 (v5.3.0)
**Downloads :** 232,073/semaine

**Pourquoi cette librairie :**
- Encapsule des composants React dans une iframe de manière transparente
- Hook `useFrame()` pour accéder au `window` et `document` de l'iframe
- `FrameContextConsumer` pour injection de CSS dans le `<head>` de l'iframe
- Support TypeScript natif (pas de `@types` séparé)
- Compatible styled-components et Emotion via `StyleSheetManager`
- Maintenance active (dernière release il y a quelques jours)
- Largement adopté dans l'écosystème React

**Usage :**
```typescript
import Frame, { FrameContextConsumer } from 'react-frame-component'

<Frame>
  <FrameContextConsumer>
    {({ document }) => (
      <>
        <style>{cssContent}</style>
        <YourComponent />
      </>
    )}
  </FrameContextConsumer>
</Frame>
```

**Alternatives évaluées :**
- `@uiw/react-iframe` (29 stars, 6.8k downloads/semaine) : Moins mature, communauté plus petite
- `react-iframe` : Trop basique (simple wrapper HTML), pas de Context propagation

---

#### 2. **Penpal** (Communication)

**Package npm :** `penpal`
**GitHub :** Aaronius/penpal
**Stars :** 528 | **Dernière mise à jour :** 2024-2025 (Actif)
**Downloads :** 158,184/semaine

**Pourquoi cette librairie :**
- Communication postMessage **basée sur Promises** (appel de méthodes avec valeurs de retour)
- **Type-safe** avec TypeScript natif (définir les interfaces Parent ↔ Child)
- Bidirectionnel : parent peut appeler des méthodes dans l'iframe ET vice-versa
- Zéro dépendances
- Supporte iframes, workers, et windows
- API moderne et intuitive
- Version 7 actuellement, développement actif

**Usage :**
```typescript
// Parent window
import { connectToChild } from 'penpal'

const connection = connectToChild({
  iframe: iframeElement,
  methods: {
    // Méthodes exposées à l'iframe
    onElementSelect(id: string) {
      console.log('Selected:', id)
    }
  }
})

const child = await connection.promise
// Appeler des méthodes dans l'iframe
await child.highlightElement(selectedId)
```

**Alternatives évaluées :**
- `@weblivion/react-penpal` : Wrapper React hooks pour Penpal, intéressant mais ajoute une dépendance
- `@yzfe/react-use-bridge` : Inactif depuis 2021, éviter
- `react-iframe-comm` : 9 ans, obsolète
- `use-iframe` : Archivé en avril 2024
- `esdeka` : Trop peu adopté (7 downloads/semaine)

**Recommandation :** Utiliser Penpal directement (vanilla), créer nos propres hooks React si besoin. Plus de contrôle, moins de dépendances.

---

#### 3. **iframe-resizer** (Auto-resize - optionnel)

**Package npm :** `iframe-resizer` + `iframe-resizer-react`
**GitHub :** davidjbradshaw/iframe-resizer
**Stars :** 6,900 | **Dernière mise à jour :** Février 2026 (v5.5.9)

**Pourquoi cette librairie :**
- Resize automatique de la hauteur de l'iframe selon le contenu
- Supporte same-domain et cross-domain
- Version React disponible
- Standard de l'industrie (6.9k stars)
- Réécriture moderne pour utiliser les APIs récentes du navigateur

**Usage :**
```typescript
import { IframeResizer } from 'iframe-resizer-react'

<IframeResizer
  src="preview.html"
  style={{ width: '768px', minHeight: '100vh' }}
/>
```

**Note :** Probablement pas nécessaire dans notre cas car nous contrôlons la hauteur manuellement, mais bon à connaître si besoin.

---

### Injection CSS : Stratégies

#### Option A : Emotion (si utilisé dans le projet)

**Package npm :** `@emotion/cache`

```typescript
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import Frame, { useFrame } from 'react-frame-component'

function StyledIframe() {
  const { document } = useFrame()
  const cache = createCache({
    key: 'iframe',
    container: document?.head // Injecte dans le <head> de l'iframe
  })

  return (
    <CacheProvider value={cache}>
      <YourStyledComponent />
    </CacheProvider>
  )
}
```

#### Option B : styled-components (si utilisé dans le projet)

```typescript
import { StyleSheetManager } from 'styled-components'
import Frame, { FrameContextConsumer } from 'react-frame-component'

<Frame>
  <FrameContextConsumer>
    {({ document }) => (
      <StyleSheetManager target={document.head}>
        <YourStyledComponent />
      </StyleSheetManager>
    )}
  </FrameContextConsumer>
</Frame>
```

#### Option C : CSS statique (Tailwind + fichiers CSS)

Pour notre projet qui utilise Tailwind + fichiers CSS custom :

```typescript
<Frame>
  <FrameContextConsumer>
    {({ document }) => (
      <>
        {/* Injection Tailwind */}
        <link rel="stylesheet" href="/path/to/tailwind.css" />

        {/* Injection CSS custom */}
        <style>{blobCss}</style>
        <style>{blobComposedCss}</style>
        <style>{blobSizeCss}</style>
        <style>{themesCss}</style>
        <style>{globalsCss}</style>

        {/* Contenu */}
        <YourComponent />
      </>
    )}
  </FrameContextConsumer>
</Frame>
```

**Note :** Peut nécessiter d'importer les CSS en tant que strings (via webpack raw-loader ou imports Next.js).

---

### Références architecturales open-source

#### 1. **Puck Editor** ⭐ EXCELLENTE RÉFÉRENCE

**Package npm :** `@measured/puck`
**GitHub :** measuredco/puck
**Stars :** 12,400 | **Dernière mise à jour :** Janvier 2026 (v0.21.1)
**License :** MIT

**Pourquoi étudier Puck :**
- Visual editor React/Next.js avec **preview iframe** (depuis v0.14)
- Architecture quasi-identique à notre besoin
- Open-source, code lisible et bien structuré
- Drag-and-drop fonctionne à travers l'iframe (librairie patchée)
- Gestion de la synchronisation de styles parent ↔ iframe
- Viewport switching intégré

**Fonctionnalités clés :**
```typescript
import { Puck } from '@measured/puck'

<Puck
  data={initialData}
  config={config}
  iframes={{
    enabled: true, // Active la preview iframe (défaut)
    breakpoints: { mobile: 375, tablet: 768, desktop: 1280 }
  }}
/>
```

**Ce qu'on peut apprendre :**
- Comment gérer le drag-and-drop à travers l'iframe
- Comment synchroniser les styles entre host et iframe
- Comment implémenter le viewport switching
- Patterns pour l'injection de CSS dans l'iframe

**Lien :** https://github.com/measuredco/puck
**Docs iframe :** https://puckeditor.com/docs/integrating-puck/viewports

---

#### 2. **Builder.io**

**GitHub :** BuilderIO/builder
**Stars :** 8,700 | **Dernière mise à jour :** Mars 2026

**Pourquoi étudier Builder.io :**
- Visual CMS professionnel avec preview iframe
- Architecture SDK bien pensée
- Pattern de communication via postMessage documenté

**Architecture :**
- Site utilisateur chargé dans une iframe
- SDK dans l'iframe écoute les messages du parent
- Parent envoie des JSON patches pour les updates
- SDK applique les changes et re-render en temps réel
- Code final ne contient pas le SDK (splitté build/runtime)

**Ce qu'on peut apprendre :**
- Pattern de "SDK" dans l'iframe qui écoute les messages
- Approche JSON patch pour des updates incrémentielles
- Séparation build-time vs runtime code

**Lien :** https://github.com/BuilderIO/builder

---

#### 3. **Storybook**

**Architecture :**
- Stories rendues dans une iframe "Canvas"
- Module "page-bus" pour communication parent ↔ iframe
- Event-based architecture (event bus)
- Preview.js s'exécute pour chaque story

**Ce qu'on peut apprendre :**
- Pattern d'event bus pour les interactions
- Gestion des addons qui communiquent avec l'iframe
- Hot Module Replacement dans l'iframe

**Note :** Code plus complexe (énorme codebase), mais patterns intéressants pour l'architecture d'événements.

---

### Stack technique finale recommandée

**Pour implémenter la solution iframe, utiliser :**

1. **Rendering :** `react-frame-component` (1.8k stars, 232k DL/semaine)
2. **Communication :** `penpal` (528 stars, 158k DL/semaine)
3. **CSS Injection :** Approche native avec `<FrameContextConsumer>` + imports CSS
4. **Resizing :** Optionnel, manuel ou `iframe-resizer-react` si besoin

**Références à étudier :**
- Puck Editor (code source + docs)
- Builder.io SDK (patterns de communication)

**Total des stars combinées :** ~9,000 GitHub stars → validation de la communauté
**Maintenance :** Toutes les librairies ont des releases en 2025-2026 → actives
**TypeScript :** Support natif dans toutes les librairies → type-safety garantie

---

## 🎯 Recommandation finale

### Approche préconisée : Migration progressive en 2 phases

#### Phase 1 : Quick Fix (1-2 jours) - **OPTIONNEL**

**Si besoin de débloquer rapidement les apparences :**

Implémenter **Solution 2 (Hybrid)** :
- Fonction `transformAppearanceClasses()`
- Application dans `BlockRenderer.tsx` ou `ClientBlob.tsx`
- Toutes les apparences fonctionnent immédiatement en preview
- Permet de continuer le développement sans friction

**Livrables :**
- Fichier `lib/transform-appearance-classes.ts`
- 5-10 lignes de code dans les composants existants
- Tests des apparences en mode preview

**Conditions pour skip cette phase :**
- Si les apparences ne sont pas bloquantes immédiatement
- Si vous préférez investir directement dans la solution définitive
- Si vous avez 2 semaines disponibles pour la refonte complète

---

#### Phase 2 : Refonte iframe (7-11 jours) - **RECOMMANDÉ**

**Implémentation complète de la Solution 1 :**

**Étape 1 : POC (1-2 jours)**
- Installer `react-frame-component` et `penpal`
- Créer `components/new-editor/IframePreview.tsx` basique
- Rendre un blob statique dans l'iframe
- Injecter CSS (Tailwind + styles custom)
- Valider que les media queries fonctionnent

**Étape 2 : Communication Bridge (2-3 jours)**
- Créer `lib/new-editor/iframe-bridge.ts` avec interfaces TypeScript
- Setup Penpal parent ↔ child
- Implémenter sélection de bloc (click dans iframe → inspector)
- Implémenter hover state (sync bidirectionnel)
- Connecter avec `useEditorState` et `HoveredBlockContext`

**Étape 3 : Rendu Complet (2-3 jours)**
- Injection complète du CSS (blob.css, themes.css, globals.css)
- Réutiliser `render-page-blocks.tsx` pour le rendu
- Support des innerBlocks récursifs
- Gestion des images et assets (paths relatifs)
- Support des icônes Iconify
- Mapper breakpoints → largeurs d'iframe

**Étape 4 : Optimisations (1-2 jours)**
- Hot reload intelligent (updates ciblées via Penpal, pas full reload)
- Loading states et error boundaries
- Performance (debounce, memoization)
- Polish UX (animations, scroll, highlight visuel)
- Tests (sélection, hover, inspection, responsive switching)

**Étape 5 : Nettoyage (1 jour)**
- Supprimer `ClientBlob.tsx` et `ClientBlobIterator.tsx`
- Supprimer la logique `containerMode` dans `blob-compose.ts`
- Retirer `isPreviewMode` de `PreviewContext`
- Supprimer 82 lignes de safelist CSS (`@md:`, `@lg:`, etc.)
- Mettre à jour la documentation (`CLAUDE_CONTEXT.md`)

**Livrables finaux :**
- Preview iframe fonctionnelle avec media queries natives
- Toutes les apparences fonctionnent sans modification
- Système unifié (plus de dual-CSS)
- Codebase allégée de ~500 lignes
- Documentation mise à jour

---

### Roadmap suggérée

**Si temps disponible :**
- **Semaine 1-2 :** Implémentation iframe complète (Phase 2 directement)
- **Résultat :** Système propre et définitif

**Si besoin de quick win :**
- **Jour 1-2 :** Quick fix transformation classes (Phase 1)
- **Semaine 2-3 :** Migration iframe (Phase 2)
- **Résultat :** Déblocage immédiat + refonte progressive

**Recommandation personnelle :**
Investir directement dans la **Phase 2** (skip Phase 1). Raisons :
1. Phase 1 ajoute de la dette technique qui devra être retirée après
2. 7-11 jours est un investissement raisonnable pour éliminer définitivement le problème
3. Les bénéfices à long terme justifient largement le coût initial
4. Le code résultant sera plus simple et plus maintenable

---

## ⚠️ Risques et mitigations

### Risques identifiés

#### 1. Communication Penpal : Edge cases avec événements rapides

**Risque :** Hover/click rapides → flood de messages postMessage → performance dégradée

**Mitigation :**
- Throttle pour les événements hover (max 1 message / 16ms = 60fps)
- Debounce pour les updates d'inspector → iframe (300ms)
- Batching : grouper plusieurs updates en un seul message

**Code exemple :**
```typescript
const throttledHover = throttle((id: string) => {
  parent.onBlockHover?.(id)
}, 16)
```

#### 2. Injection CSS : Tailwind pourrait nécessiter un build custom

**Risque :** Tailwind génère du CSS à la volée (JIT), difficile de capturer tout le CSS nécessaire pour l'iframe

**Mitigation principale :**
- Utiliser le même build Tailwind que la production
- Ajouter un `<link>` vers le fichier CSS buildé dans l'iframe
- Next.js génère déjà un bundle CSS complet, le réutiliser

**Fallback :**
- CDN Tailwind Play si vraiment nécessaire (pas idéal pour perfs)
- Ou générer un build CSS statique spécifiquement pour l'iframe

**Code exemple :**
```typescript
<Frame>
  <link rel="stylesheet" href="/_next/static/css/app-layout.css" />
  <style>{customBlobCss}</style>
</Frame>
```

#### 3. Performance : Re-renders iframe excessifs

**Risque :** Chaque changement dans l'inspector → full re-render de l'iframe → lent et perte de scroll position

**Mitigation :**
- Updates ciblées via Penpal : `child.updateBlockData(id, partialData)` au lieu de full re-render
- Memoization dans l'iframe : `useMemo()` pour éviter re-renders inutiles de blocs non modifiés
- Stratégie reconciliation : identifier quel bloc a changé, update seulement celui-là

**Architecture :**
```typescript
// Parent
const handleInspectorChange = (blockId: string, field: string, value: any) => {
  // Update local state
  updateBlock(blockId, { [field]: value })

  // Send targeted update to iframe
  iframeChild?.updateBlockField(blockId, field, value)
}

// Child (dans iframe)
const methods = {
  updateBlockField(blockId: string, field: string, value: any) {
    // Update seulement le champ spécifique du bloc
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, data: { ...b.data, [field]: value } } : b
    ))
  }
}
```

#### 4. Drag & Drop : Ne fonctionne pas à travers iframe par défaut

**Risque :** Si vous avez du drag & drop de blocs, les événements ne traversent pas la frontière iframe

**Mitigation :**
- Étudier l'implémentation de **Puck Editor** qui a résolu ce problème
- Puck a patché leur librairie de drag-and-drop pour supporter les iframes
- Alternative : désactiver le drag dans la preview iframe, le faire uniquement dans le tree view (sidebar)

**Recommandation :** Si pas de drag & drop actuellement, ne pas s'en préoccuper. Si ajouté plus tard, s'inspirer de Puck.

---

### Validation incrémentale

**Principe :** Chaque phase livre un incrément fonctionnel et testable

**Phase 1 - POC :**
- ✅ Validation : iframe rend du contenu, CSS fonctionne, media queries actives
- 🔄 Rollback : simple, retour au système actuel

**Phase 2 - Bridge :**
- ✅ Validation : click dans iframe → sélection dans inspector, hover fonctionne
- 🔄 Rollback : désactiver la communication, iframe reste en lecture seule

**Phase 3 - Rendu :**
- ✅ Validation : tous les blocs s'affichent correctement, apparences fonctionnent
- 🔄 Rollback : retour à la Phase 2 avec contenu simplifié

**Phase 4 - Optimisations :**
- ✅ Validation : performance acceptable (<100ms pour updates), pas de jank
- 🔄 Rollback : revenir à Phase 3 (fonctionne, mais moins optimisé)

**Phase 5 - Nettoyage :**
- ✅ Validation : aucune régression, tous les tests passent, bundle size réduit
- 🔄 Rollback : garder l'ancien code en commentaire le temps de valider en staging

---

## 📚 Ressources et documentation

### Librairies npm

- **react-frame-component :** https://www.npmjs.com/package/react-frame-component
- **Penpal :** https://www.npmjs.com/package/penpal
- **iframe-resizer :** https://www.npmjs.com/package/iframe-resizer
- **@weblivion/react-penpal :** https://www.npmjs.com/package/@weblivion/react-penpal

### Repositories GitHub à étudier

- **Puck Editor :** https://github.com/measuredco/puck
  - Focus : `packages/core/components/Puck/components/Preview.tsx`
  - Focus : Documentation iframe : https://puckeditor.com/docs/integrating-puck/viewports
- **Builder.io :** https://github.com/BuilderIO/builder
  - Focus : SDK architecture et communication patterns

### Articles techniques

- **React renderToStaticMarkup :** https://react.dev/reference/react-dom/server/renderToStaticMarkup
- **CSS Container Queries :** https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- **postMessage API :** https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

### Patterns architecturaux

- **Iframe-based preview pattern :** Standard dans Storybook, Figma plugins, Chrome DevTools
- **postMessage communication :** Standard pour cross-frame communication
- **Promise-based RPC :** Pattern moderne pour APIs asynchrones (Penpal)

---

## ✅ Checklist de validation finale

Avant de commencer l'implémentation, valider :

- [ ] **Budget temps :** 7-11 jours disponibles pour la refonte complète
- [ ] **Buy-in stakeholders :** Équipe d'accord sur l'investissement
- [ ] **Backup plan :** Solution 2 (Hybrid) comme fallback si blocage majeur
- [ ] **Tests existants :** S'assurer que des tests existent pour valider la non-régression
- [ ] **Environnement de staging :** Avoir un env pour tester avant production
- [ ] **Rollback strategy :** Plan B si problèmes en production

Une fois validé, suivre la roadmap Phase 2 décrite ci-dessus.

---

## 🎬 Conclusion

Le système de preview actuel basé sur container queries crée une **dette technique significative** (dual-system CSS, safelist extensive, apparences cassées en preview).

La **migration vers une architecture iframe** est la solution recommandée car :

1. ✅ **Élimine le problème à la racine** (une seule source de vérité CSS)
2. ✅ **Standard industrie** (Storybook, Figma, DevTools)
3. ✅ **Améliore la DX** (développeurs utilisent des patterns CSS standard)
4. ✅ **Réduit la complexité** (~500 lignes de code en moins)
5. ✅ **Maintenable à long terme** (pas de dual-system à maintenir)

**Stack technique validée :**
- `react-frame-component` (rendering)
- `penpal` (communication type-safe)
- CSS injection native via `FrameContextConsumer`
- Inspiration de Puck Editor (12.4k stars, MIT)

**Estimation :** 7-11 jours pour une implémentation complète et propre.

**Prochaine étape :** Valider le budget temps et ressources, puis démarrer par un POC d'1-2 jours pour confirmer la faisabilité technique avant de s'engager sur la refonte complète.

---

**Document maintenu par :** Claude Code
**Dernière mise à jour :** 2026-03-25
**Statut :** Prêt pour review et décision d'implémentation
