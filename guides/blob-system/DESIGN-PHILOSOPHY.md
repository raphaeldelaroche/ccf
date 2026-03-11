# Guide IA : Système Blob pour Wireframes

**Important :** Les pages générées sont des **wireframes**, pas des designs finaux.
Focus sur la **structure**, la **hiérarchie visuelle** et le **rythme spatial**.

## 🎯 Philosophie : Design par Système, pas par Décoration

Le Blob est un composant de composition qui permet de créer des wireframes professionnels en manipulant **3 variables principales** :

1. **Size** (échelle) : Contrôle la hiérarchie visuelle
2. **Padding** (respiration) : Crée le rythme spatial
3. **Layout** (structure) : Organise le contenu

**Mentalité wireframe :**
- ✅ Hiérarchie par taille (9xl → 2xl → md)
- ✅ Respiration par padding (10xl → 6xl → 5xl)
- ✅ Structure par layout (stack 90%, row 10%)
- ✅ Séparation par borderBottom
- ❌ Pas de décoration (glassmorphism, neonSection, neoBrutalism)
- ❌ Pas de sur-styling (un wireframe ne doit pas être "joli", mais "clair")

---

## 📏 Hiérarchie Visuelle : La Progression de Size

### Pattern Page Complète (Inspiré de "hello")

```
┌─────────────────────────────────────┐
│ HERO         size="9xl"    (Impact) │  ← Première section massive
├─────────────────────────────────────┤
│ LOGOS        size="md"     (Social) │  ← Validation sociale compacte
├─────────────────────────────────────┤
│ FEATURES     size="2xl"    (Valeur) │  ← Section majeure
├─────────────────────────────────────┤
│ METHOD       size="2xl"    (Détail) │  ← Section majeure
├─────────────────────────────────────┤
│ CTA          size="4xl"    (Action) │  ← Relance forte
└─────────────────────────────────────┘
```

### Échelle Complète : 14 Niveaux

```
xs → sm → md → lg → xl → 2xl → 3xl → 4xl → 5xl → 6xl → 7xl → 8xl → 9xl → 10xl
     ↑         ↑              ↑                                              ↑
  Compact  Standard      Sections                                      Mega Hero
```

### Guide d'Usage par Size

**xs, sm** : Footers, mentions légales (très rare)

**md** :
- Logos clients
- Éléments secondaires
- Contenu dense

**lg** :
- Features cards
- Contenu standard enrichi

**xl** :
- Sections importantes
- Heroes secondaires

**2xl, 3xl** :
- **Sections majeures** (90% des sections de contenu)
- Features avec innerBlocks
- Sections explicatives

**4xl, 5xl** :
- CTA sections
- Relances fortes

**6xl, 7xl, 8xl** :
- Très rarement utilisé
- Cas spéciaux uniquement

**9xl, 10xl** :
- **Hero principal uniquement**
- Maximum 1 par page

**💡 Règle d'Or :** Une bonne page wireframe utilise 3-4 sizes max (ex: 9xl → md → 2xl → 4xl)

---

## 🌬️ Rythme Spatial : La Respiration par Padding

### PaddingY : Créer le Rythme Vertical

**Pattern "hello" :**
```
Section 1:  paddingY="10xl"   (Énorme respiration - Hero)
Section 2:  paddingY="xl"     (Compact - Logos)
Section 3:  paddingY="6xl"    (Large - Features)
Section 4:  paddingY="5xl"    (Medium - Method)
Section 5:  paddingY="7xl"    (Relance - CTA)
```

**Principe :** Alternance large → compact → large crée un **rythme de lecture**.

### Échelle PaddingY

```
none → 2xs → xs → sm → md → lg → xl → 2xl → 3xl → 4xl → 5xl → 6xl → 7xl → 8xl → 9xl → 10xl
  ↑                                ↑                      ↑                            ↑
Aucun                          Standard              Sections                      Hero
```

### Guide d'Usage

**none** :
- Cas spécial (row layout full-bleed)
- Nested blocks (le parent gère le padding)

**xl, 2xl** :
- Sections compactes
- Logos, stats, courts éléments

**3xl, 4xl, 5xl** :
- **Standard sections** (usage le plus fréquent)
- Contenu, features, explications

**6xl, 7xl, 8xl** :
- Sections importantes
- CTAs, relances

**9xl, 10xl** :
- Hero principal uniquement

**💡 Pattern Safe :** Utiliser `paddingY="auto"` si pas de besoin spécifique (hérite de `size`)

---

## 📦 Container Mode : Maîtriser la Largeur

### Pattern "hello" : Container avec Override

```json
{
  "size": "9xl",
  "paddingX": "container-xl",        // ← Container max-width
  "headerPaddingX": "container-sm",  // ← Titre plus étroit (effet tunnel)
  "title": "Long titre sur plusieurs lignes"
}
```

**Effet visuel :**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Long titre sur plusieurs lignes            │  ← container-sm
│                                                         │
│  Subtitle plus large qui respire dans le container-xl  │  ← container-xl
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Options PaddingX

**Valeurs directes :**
`none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, etc.

**Valeurs container (max-width) :**
- `container-sm` : ~640px
- `container-md` : ~768px
- `container-lg` : ~1024px
- `container-xl` : ~1280px
- `container-2xl` : ~1536px

**Pattern Recommandé :**
```json
{
  "paddingX": "container-lg",  // ← Container principal
  "headerPaddingX": "auto"     // ← Hérite du container (défaut)
}
```

**Pattern Effet Tunnel (Hero) :**
```json
{
  "paddingX": "container-xl",       // ← Large
  "headerPaddingX": "container-sm"  // ← Étroit (focus sur titre)
}
```

---

## 🎨 Layouts : Stack 90%, Row 10%

### 1. STACK (Layout par Défaut)

**Cas d'usage :** Tout ce qui est vertical

```
┌─────────────────┐
│   [marker]      │
│   Title         │
│   Subtitle      │
│   [content]     │
│   [buttons]     │
└─────────────────┘
```

**Pattern Standard :**
```json
{
  "layout": "stack",
  "align": "center",  // ou "left"
  "size": "2xl"
}
```

**90% de vos sections utilisent stack.**

---

### 2. ROW (Layout Horizontal)

**Cas d'usage :** Contenu + média côte à côte

```
┌──────────────────────────────────┐
│ Title | Subtitle    │  [figure]  │
│ [content]           │   50%      │
└──────────────────────────────────┘
```

**Pattern "hello" : Row Full-Bleed avec GapX Extrême**

```json
{
  "layout": "row",
  "figureType": "image",
  "image": "/placeholder-vertical.svg",
  "figureWidth": "1/2",
  "figureBleed": "full",      // ← Image sort du container
  "paddingX": "xl",
  "paddingY": "none",         // ← Pas de padding vertical (full-bleed)
  "gapX": "10xl"              // ← CRITIQUE : énorme espace latéral
}
```

**Effet visuel :**
```
┌────────────────────────────────────────────────────────────┐
│                  [huge gap]                    │  [Image]  │
│  Titre                                         │  Full     │
│  Subtitle                                      │  Bleed    │
│                                                │           │
└────────────────────────────────────────────────────────────┘
```

**💡 Astuce Row :** Sur wireframes, `gapX="10xl"` + `figureBleed="full"` + `paddingY="none"` créent un impact visuel fort.

**Pattern Direction Alternée :**
```json
// Section 1
{ "layout": "row", "direction": "default" }

// Section 2
{ "layout": "row", "direction": "reverse" }  // ← Image à gauche

// Section 3
{ "layout": "row", "direction": "default" }
```

**FigureWidth Options :** `"1/4"`, `"1/3"`, `"1/2"`, `"2/3"`, `"3/4"`

---

## 🏗️ Nested Blocks : Parent = Espace, Child = Grille

### Pattern Recommandé

**Principe :** Le **parent blob** gère le padding/container. Le **child iterator** gère uniquement la grille.

```json
{
  "id": "parent-section",
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "paddingX": "container-lg",   // ← Parent gère le container
    "paddingY": "5xl",            // ← Parent gère la respiration
    "title": "Les 3 piliers",
    "showContent": "true",
    "contentType": "innerBlocks",
    "appearance": "borderBottom"
  },
  "innerBlocks": [
    {
      "id": "child-iterator",
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "iteratorGapX": "md",
        "iteratorGapY": "md",
        "paddingX": "none",      // ← Child ne gère PAS le padding
        "paddingY": "none",      // ← Déjà géré par parent
        "size": "lg",
        "layout": "stack",
        "markerType": "text",
        "appearance": "outlined",
        "itemFields": "[\"title\",\"subtitle\",\"markerContent\",\"contentText\"]",
        "items": "[...]"
      }
    }
  ]
}
```

**Résultat :**
```
┌──────────────────────────────────────────────────┐
│                                                  │  ← paddingY du parent
│              Les 3 piliers                       │
│                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │   01.    │  │   02.    │  │   03.    │     │
│   │ Feature  │  │ Feature  │  │ Feature  │     │  ← grid-3 du child
│   └──────────┘  └──────────┘  └──────────┘     │
│                                                  │
└──────────────────────────────────────────────────┘
```

**💡 Règle :**
- Parent : `paddingX="container-*"`, `paddingY="5xl"`, `gapY="3xl"`
- Child : `paddingX="none"`, `paddingY="none"`, focus sur `iteratorLayout`

---

## 🔄 Iterator : Shared Structure + Variable Content

### ItemFields : Le Système d'Héritage

**itemFields** = array de champs **gérés individuellement** par chaque item.

**Tout ce qui N'EST PAS dans itemFields est partagé.**

**Pattern Standard :**
```json
{
  "blockType": "blobIterator",
  "data": {
    "iteratorLayout": "grid-3",
    "iteratorGapX": "md",
    "iteratorGapY": "md",

    // ↓ ItemFields : ce qui varie par item
    "itemFields": "[\"title\",\"subtitle\",\"markerContent\",\"contentText\"]",

    // ↓ Props partagées : structure commune
    "size": "lg",
    "layout": "stack",
    "align": "left",
    "markerType": "text",
    "markerStyle": "ghost",
    "markerSize": "md",
    "appearance": "outlined",

    // ↓ Items : contenu variable
    "items": "[
      {
        \"title\": \"Réduire\",
        \"subtitle\": \"Décarboner les opérations\",
        \"markerContent\": \"01.\",
        \"contentText\": \"Texte long...\"
      },
      {
        \"title\": \"Déployer\",
        \"subtitle\": \"Mettre à l'échelle\",
        \"markerContent\": \"02.\",
        \"contentText\": \"Texte long...\"
      }
    ]"
  }
}
```

**Layouts Iterator :**
- `grid-1`, `grid-2`, `grid-3`, `grid-4`, `grid-5`, `grid-6`, `grid-auto`
- `swiper` (carousel)

**💡 Pattern Safe :**
- Grid-3 pour features (3 colonnes)
- Grid-4 pour logos (4 colonnes)
- Grid-5 pour logos très compacts (5 colonnes)

---

## 🎨 Appearances : Minimalisme pour Wireframes

### Les 4 Appearances Recommandées

**`default`** : Clean, minimal, transparent
```json
{ "appearance": "default" }
```

**`borderBottom`** : Séparateur visuel entre sections
```json
{ "appearance": "borderBottom" }  // ← Usage le plus fréquent sur pages
```

**`darkBackground`** : Fond sombre pour CTAs
```json
{
  "appearance": "darkBackground",
  "theme": "brand"
}
```

**`outlined`** : Bordure simple pour cards
```json
{ "appearance": "outlined" }  // ← Pour iterator items
```

### ❌ Appearances à Éviter sur Wireframes

- `glassmorphism` (trop décoratif)
- `neoBrutalism` (trop stylisé)
- `neonSection` (trop futuriste)
- `figma` (cas spécial)

**💡 Règle :** Sur 90% des pages, utiliser uniquement `default`, `borderBottom`, `darkBackground`, `outlined`.

---

## 🎯 Markers : Left Compact vs Top Spacieux

### MarkerPosition="left" : Liste Compacte

**Pattern "demo" :**
```json
{
  "markerType": "text",
  "markerPosition": "left",     // ← Marker à gauche
  "markerStyle": "ghost",
  "markerSize": "md",
  "align": "left"               // ← Obligatoire avec marker left
}
```

**Effet visuel :**
```
01.  Réduire
     Décarboner les opérations et la chaîne de valeur

02.  Déployer
     Mettre à l'échelle les solutions bas-carbone
```

**Compact, dense, liste-like.**

### MarkerPosition="top" : Centré, Aéré

```json
{
  "markerType": "icon",
  "markerPosition": "top",
  "markerIcon": "{\"name\":\"Check\",\"lib\":\"lucide\"}",
  "markerStyle": "default",
  "markerTheme": "green",
  "markerRounded": "rounded-full",
  "align": "center"
}
```

**Effet visuel :**
```
       ✓

    Réduire

 Décarboner les
   opérations
```

**Spacieux, feature-card like.**

**💡 Guide :**
- `markerPosition="left"` → Listes, méthodologie, étapes compactes
- `markerPosition="top"` → Feature cards, services, highlights

---

## 🚀 Patterns Réels (Tirés de "hello" et "demo")

### Pattern 1 : Hero Massif

```json
{
  "id": "hero",
  "blockType": "blob",
  "data": {
    "size": "9xl",
    "layout": "stack",
    "align": "center",
    "paddingX": "container-xl",
    "paddingY": "10xl",
    "headerPaddingX": "container-sm",  // ← Titre plus étroit
    "title": "Nous mesurons toute // votre action climatique. // Enfin.",
    "subtitle": "Le CCF rassemble vos actions climat existantes...",
    "buttons": "[{\"label\":\"Évaluer votre contribution\",\"variant\":\"default\",\"theme\":\"red\"}]",
    "appearance": "borderBottom"
  },
  "innerBlocks": []
}
```

**Clés :**
- `size="9xl"` : Impact maximum
- `paddingY="10xl"` : Respiration énorme
- `headerPaddingX="container-sm"` : Titre étroit (effet tunnel)
- `appearance="borderBottom"` : Séparation nette

---

### Pattern 2 : Logos Compacts

```json
{
  "id": "logos",
  "blockType": "blob",
  "data": {
    "size": "md",
    "paddingX": "container-lg",
    "paddingY": "xl",              // ← Compact
    "showContent": "true",
    "contentType": "innerBlocks",
    "appearance": "borderBottom",
    "gapY": "none"
  },
  "innerBlocks": [
    {
      "id": "logos-iterator",
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-5",
        "iteratorGapX": "none",
        "iteratorGapY": "none",
        "figureType": "image",
        "image": "/placeholder-135x400.svg",
        "paddingX": "none",
        "paddingY": "none",
        "items": "[{},{},{},{},{}]"  // ← 5 logos vides
      }
    }
  ]
}
```

**Clés :**
- `size="md"` : Compact
- `paddingY="xl"` : Respiration minimale
- `grid-5` : 5 colonnes de logos
- `gapY="none"` sur parent : Child colle au parent

---

### Pattern 3 : Section Majeure avec Iterator

```json
{
  "id": "features",
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "layout": "stack",
    "align": "center",
    "paddingX": "container-lg",
    "paddingY": "6xl",
    "title": "Jusqu'à maintenant, personne n'avait mesuré // toutes vos actions climatiques.",
    "subtitle": "Description de la section",
    "buttons": "[{\"label\":\"Évaluer\",\"variant\":\"default\",\"theme\":\"red\"}]",
    "showContent": "true",
    "contentType": "innerBlocks",
    "appearance": "borderBottom",
    "headerPaddingX": "container-md"
  },
  "innerBlocks": [
    {
      "id": "features-iterator",
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "iteratorGapX": "none",
        "iteratorGapY": "none",
        "figureType": "image",
        "image": "/placeholder-vertical.svg",
        "paddingX": "none",
        "paddingY": "none",
        "items": "[{},{},{}]"
      }
    }
  ]
}
```

**Clés :**
- `size="2xl"` : Section majeure
- `paddingY="6xl"` : Respiration large
- Parent gère padding, child gère grille
- `headerPaddingX="container-md"` : Titre un peu plus étroit

---

### Pattern 4 : Method avec Marker Left

```json
{
  "id": "method",
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "paddingX": "container-lg",
    "paddingY": "5xl",
    "eyebrow": "La méthode",
    "eyebrowTheme": "brand",
    "title": "Les 3 piliers de votre action climatique",
    "showContent": "true",
    "contentType": "innerBlocks",
    "appearance": "borderBottom",
    "gapY": "3xl"
  },
  "innerBlocks": [
    {
      "id": "method-iterator",
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "iteratorGapX": "md",
        "iteratorGapY": "md",
        "size": "lg",
        "layout": "stack",
        "align": "left",
        "markerType": "text",
        "markerPosition": "left",    // ← Compact
        "markerStyle": "ghost",
        "markerSize": "md",
        "appearance": "outlined",
        "showContent": "true",
        "contentType": "text",
        "itemFields": "[\"title\",\"subtitle\",\"markerContent\",\"contentText\"]",
        "items": "[
          {\"title\":\"Réduire\",\"subtitle\":\"Décarboner...\",\"markerContent\":\"01.\",\"contentText\":\"Long...\"},
          {\"title\":\"Déployer\",\"subtitle\":\"Mettre à l'échelle...\",\"markerContent\":\"02.\",\"contentText\":\"Long...\"},
          {\"title\":\"Financer\",\"subtitle\":\"Orienter les capitaux...\",\"markerContent\":\"03.\",\"contentText\":\"Long...\"}
        ]"
      }
    }
  ]
}
```

**Clés :**
- `gapY="3xl"` sur parent : Espace entre header et iterator
- `markerPosition="left"` : Style liste compacte
- `appearance="outlined"` : Cards avec bordure
- `align="left"` : Obligatoire avec marker left

---

### Pattern 5 : CTA Section

```json
{
  "id": "cta",
  "blockType": "blob",
  "data": {
    "size": "4xl",
    "layout": "stack",
    "align": "center",
    "paddingY": "7xl",
    "title": "Prêt à commencer ?",
    "buttons": "[{\"label\":\"Évaluer votre contribution\",\"variant\":\"default\",\"theme\":\"red\"}]",
    "appearance": "darkBackground",
    "headerPaddingX": "container-md"
  },
  "innerBlocks": []
}
```

**Clés :**
- `size="4xl"` : Relance forte
- `appearance="darkBackground"` : Contraste visuel
- `paddingY="7xl"` : Respiration importante

---

### Pattern 6 : Row Full-Bleed Alternée

```json
// Section A (image à droite)
{
  "id": "row-1",
  "blockType": "blob",
  "data": {
    "size": "3xl",
    "layout": "row",
    "direction": "default",
    "figureType": "image",
    "image": "/placeholder-vertical.svg",
    "figureWidth": "1/2",
    "figureBleed": "full",
    "paddingX": "xl",
    "paddingY": "none",
    "gapX": "10xl",
    "title": "Titre Section A",
    "subtitle": "Description...",
    "appearance": "borderBottom"
  }
}

// Section B (image à gauche)
{
  "id": "row-2",
  "blockType": "blob",
  "data": {
    "size": "3xl",
    "layout": "row",
    "direction": "reverse",        // ← Alternance
    "figureType": "image",
    "image": "/placeholder-vertical.svg",
    "figureWidth": "1/2",
    "figureBleed": "full",
    "paddingX": "xl",
    "paddingY": "none",
    "gapX": "10xl",
    "title": "Titre Section B",
    "subtitle": "Description...",
    "appearance": "borderBottom"
  }
}
```

**Clés :**
- `direction="reverse"` : Alternance droite/gauche
- `gapX="10xl"` : Espace latéral énorme
- `paddingY="none"` : Full-bleed vertical
- `figureBleed="full"` : Image sort du container

---

## ⚙️ Règles de Compatibilité Critiques

### Layout → Marker

| Layout | Markers Supportés | Défaut |
|--------|------------------|--------|
| stack  | top, left, right | top    |
| row    | **top uniquement** | top    |
| bar    | top, left        | left   |

**❌ INVALIDE :**
```json
{ "layout": "row", "markerPosition": "left" }  // ← Impossible !
```

---

### Marker Left/Right → Align

**Si `markerPosition="left"` ou `"right"`, alors `align` doit être `"left"` ou `"right"` (pas center).**

**❌ INVALIDE :**
```json
{
  "markerPosition": "left",
  "align": "center"  // ← Impossible !
}
```

**✅ VALIDE :**
```json
{
  "markerPosition": "left",
  "align": "left"  // ← OK
}
```

---

## 🚫 Anti-Patterns Wireframe

### ❌ Trop de Sizes Différentes

```json
// Page avec 8 sizes différentes
{ "size": "9xl" }
{ "size": "7xl" }
{ "size": "5xl" }
{ "size": "3xl" }
{ "size": "2xl" }
{ "size": "xl" }
{ "size": "lg" }
{ "size": "md" }
```

**✅ Mieux :** 3-4 sizes max
```json
{ "size": "9xl" }  // Hero
{ "size": "md" }   // Logos
{ "size": "2xl" }  // Sections majeures (×3)
{ "size": "4xl" }  // CTA
```

---

### ❌ Padding Aléatoire

```json
{ "paddingY": "3xl" }
{ "paddingY": "8xl" }
{ "paddingY": "2xl" }
{ "paddingY": "9xl" }
{ "paddingY": "5xl" }
```

**✅ Mieux :** Rythme cohérent
```json
{ "paddingY": "10xl" }  // Hero (énorme)
{ "paddingY": "xl" }    // Compact
{ "paddingY": "6xl" }   // Large
{ "paddingY": "5xl" }   // Medium
{ "paddingY": "7xl" }   // CTA (relance)
```

**Principe :** Alternance large → compact → large

---

### ❌ Sur-Décoration

```json
{
  "appearance": "glassmorphism",
  "theme": "purple",
  "markerStyle": "neon",
  "backgroundType": "gradient"
}
```

**✅ Mieux :** Minimalisme
```json
{
  "appearance": "borderBottom",
  "theme": "brand"
}
```

---

### ❌ Row Sans GapX Fort

```json
{
  "layout": "row",
  "figureWidth": "1/2",
  "gapX": "md"  // ← Trop serré visuellement
}
```

**✅ Mieux :**
```json
{
  "layout": "row",
  "figureWidth": "1/2",
  "gapX": "10xl",        // ← Impact visuel
  "figureBleed": "full",
  "paddingY": "none"
}
```

---

### ❌ Iterator Sans ItemFields

```json
{
  "blockType": "blobIterator",
  "data": {
    "items": "[{\"title\":\"A\"}, {\"title\":\"B\"}]"
    // ❌ Pas de itemFields !
  }
}
```

**Résultat :** Tous les items auront le même titre.

**✅ Mieux :**
```json
{
  "blockType": "blobIterator",
  "data": {
    "itemFields": "[\"title\",\"subtitle\"]",
    "items": "[{\"title\":\"A\"}, {\"title\":\"B\"}]"
  }
}
```

---

## 🎯 Checklist Wireframe de Qualité

### Hiérarchie
- [ ] **Progression de size claire** (9xl → 2xl-3xl → 4xl, pas de chaos)
- [ ] **3-4 sizes max** sur toute la page
- [ ] **Hero en 9xl-10xl** (1 seul par page)
- [ ] **Sections majeures en 2xl-3xl** (features, méthode, etc.)
- [ ] **CTA en 4xl-5xl** (relance)

### Respiration
- [ ] **Rythme de paddingY cohérent** (alternance large → compact → large)
- [ ] **Hero avec paddingY énorme** (9xl, 10xl)
- [ ] **Sections compactes** (logos, stats) en xl-2xl
- [ ] **Sections standard** en 5xl-6xl

### Container
- [ ] **Container mode utilisé** (`paddingX="container-lg"`)
- [ ] **Override header si besoin** (`headerPaddingX="container-sm"` pour effet tunnel)

### Layout
- [ ] **Stack 90%** (vertical, safe)
- [ ] **Row 10%** (contenu+média uniquement)
- [ ] **GapX="10xl" sur row** (impact visuel)
- [ ] **FigureBleed="full" + paddingY="none"** sur row full-bleed
- [ ] **Direction alternée** sur rows multiples

### Nested Blocks
- [ ] **Parent gère padding** (`paddingX="container-*"`, `paddingY="5xl"`)
- [ ] **Child gère grille** (`paddingX="none"`, `paddingY="none"`)
- [ ] **GapY sur parent** si besoin d'espace entre header et iterator

### Iterator
- [ ] **ItemFields défini** explicitement
- [ ] **Props partagées** (size, layout, markerStyle, appearance)
- [ ] **Items** avec seulement les champs dans itemFields

### Style
- [ ] **Appearances minimalistes** (default, borderBottom, darkBackground, outlined)
- [ ] **Thème cohérent** (1-2 couleurs max : brand + slate)
- [ ] **BorderBottom** sur 80% des sections (séparation)

### Markers
- [ ] **Marker left** pour listes compactes (méthodologie, étapes)
- [ ] **Marker top** pour feature cards (centré, aéré)
- [ ] **Align cohérent** avec markerPosition (left si marker left)

### Technique
- [ ] **Tous les champs sont des strings** (`"true"` pas `true`)
- [ ] **Arrays stringifiés** (buttons, items, itemFields en JSON)
- [ ] **IDs uniques** (UUID v4)
- [ ] **innerBlocks = []** si vide (jamais undefined)

---

## 📚 Pour Aller Plus Loin

- **PATTERNS.md** : 12 patterns complets annotés
- **FIELD-REFERENCE.md** : Référence complète des 61 champs
- **PAGE-STRUCTURE.md** : Format JSON exact
- **../workflows/AI-GENERATION-WORKFLOW.md** : Guide d'utilisation

---

**Version :** 2.0 (Wireframe Focus)
**Dernière mise à jour :** 2025-01-15
