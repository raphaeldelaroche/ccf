# Quick Start : Générer une Page Wireframe

**Temps de lecture : 5 minutes**

Ce guide te permet de générer rapidement une page wireframe en comprenant les 3 principes fondamentaux + 6 patterns essentiels.

---

## 🎯 Les 3 Principes Wireframe

### 1. Size (Hiérarchie Visuelle)

**Concept :** Un seul token `size` contrôle l'échelle de toute la section (typo + spacing + dimensions).

**Échelle : 14 niveaux**
```
xs → sm → md → lg → xl → 2xl → 3xl → 4xl → 5xl → 6xl → 7xl → 8xl → 9xl → 10xl
```

**Usage recommandé :**
- **9xl-10xl** : Hero principal (1 seul par page)
- **2xl-3xl** : Sections majeures (90% du contenu)
- **4xl-5xl** : CTA, relances
- **md** : Sections compactes (logos, stats)
- **lg** : Contenu standard

**💡 Règle d'Or :** Utiliser **3-4 sizes max** par page (ex: 9xl → md → 2xl → 4xl)

---

### 2. Padding (Rythme Spatial)

**Concept :** `paddingY` crée le rythme de lecture par alternance large → compact → large.

**Pattern type (page "hello") :**
```
Section 1:  paddingY="10xl"   (Hero - Énorme respiration)
Section 2:  paddingY="xl"     (Logos - Compact)
Section 3:  paddingY="6xl"    (Features - Large)
Section 4:  paddingY="5xl"    (Method - Medium)
Section 5:  paddingY="7xl"    (CTA - Relance)
```

**Usage recommandé :**
- **9xl-10xl** : Hero uniquement
- **6xl-8xl** : Sections importantes, CTAs
- **3xl-5xl** : Sections standard (le plus fréquent)
- **xl-2xl** : Sections compactes (logos, stats)
- **none** : Row layouts full-bleed, nested blocks (parent gère le padding)

**💡 Principe :** Alternance crée le rythme (pas de paddingY uniforme)

---

### 3. Layout (Structure)

**3 layouts disponibles :**

**Stack (90% des cas) :** Vertical, mobile-first
```
┌─────────────┐
│  [marker]   │
│   Title     │
│   Subtitle  │
│  [content]  │
│  [buttons]  │
└─────────────┘
```

**Row (10% des cas) :** Horizontal, contenu + média
```
┌──────────────────────────┐
│ Title      │   [figure]  │
│ Subtitle   │     50%     │
└──────────────────────────┘
```

**Bar (rare) :** Compact horizontal
```
┌─────────────────────────┐
│ [marker] Title [buttons]│
└─────────────────────────┘
```

**💡 Recommandation :** Stack par défaut, Row uniquement pour contenu + image

---

## 🎨 Les 6 Patterns Essentiels

### Pattern 1 : Hero Massif (9xl)

**Usage :** Première section de landing page

**Clés :**
- `size="9xl"` + `paddingY="10xl"`
- `paddingX="container-xl"` + `headerPaddingX="container-sm"` (effet tunnel)
- `appearance="borderBottom"`

```json
{
  "size": "9xl",
  "layout": "stack",
  "align": "center",
  "paddingX": "container-xl",
  "paddingY": "10xl",
  "headerPaddingX": "container-sm",
  "title": "Titre impactant",
  "subtitle": "Description...",
  "buttons": "[{\"label\":\"CTA Principal\",\"variant\":\"default\"}]",
  "appearance": "borderBottom"
}
```

---

### Pattern 2 : Logos Compacts (md)

**Usage :** Logos clients, partenaires (social proof)

**Clés :**
- `size="md"` + `paddingY="xl"` (compact)
- `gapY="none"` sur parent (child colle)
- Iterator `grid-5` (5 colonnes)

```json
{
  "size": "md",
  "paddingX": "container-lg",
  "paddingY": "xl",
  "showContent": "true",
  "contentType": "innerBlocks",
  "appearance": "borderBottom",
  "gapY": "none",
  "innerBlocks": [
    {
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-5",
        "figureType": "image",
        "image": "/placeholder.svg",
        "paddingX": "none",
        "paddingY": "none",
        "items": "[{},{},{},{},{}]"
      }
    }
  ]
}
```

---

### Pattern 3 : Section Majeure avec Iterator (2xl)

**Usage :** Features, valeur, explication

**Clés :**
- `size="2xl"` + `paddingY="6xl"`
- Parent gère padding, child gère grille
- `headerPaddingX="container-md"` (titre étroit)

```json
{
  "size": "2xl",
  "paddingX": "container-lg",
  "paddingY": "6xl",
  "headerPaddingX": "container-md",
  "title": "Titre section majeure",
  "showContent": "true",
  "contentType": "innerBlocks",
  "appearance": "borderBottom",
  "innerBlocks": [
    {
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "paddingX": "none",
        "paddingY": "none",
        "items": "[{},{},{}]"
      }
    }
  ]
}
```

---

### Pattern 4 : Method avec Marker Left (2xl)

**Usage :** Méthodologie, process, étapes

**Clés :**
- `size="2xl"` + `paddingY="5xl"`
- `gapY="3xl"` sur parent (espace header ↔ iterator)
- `markerPosition="left"` + `markerStyle="ghost"`
- `appearance="outlined"` sur items

```json
{
  "size": "2xl",
  "paddingX": "container-lg",
  "paddingY": "5xl",
  "title": "Notre approche en 3 piliers",
  "showContent": "true",
  "contentType": "innerBlocks",
  "appearance": "borderBottom",
  "gapY": "3xl",
  "innerBlocks": [
    {
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "size": "lg",
        "markerType": "text",
        "markerPosition": "left",
        "markerStyle": "ghost",
        "appearance": "outlined",
        "align": "left",
        "itemFields": "[\"title\",\"subtitle\",\"markerContent\"]",
        "items": "[{\"markerContent\":\"01.\",\"title\":\"...\",\"subtitle\":\"...\"}]"
      }
    }
  ]
}
```

---

### Pattern 5 : CTA Section (4xl)

**Usage :** Relance, conversion

**Clés :**
- `size="4xl"` + `paddingY="7xl"`
- `appearance="darkBackground"`
- `headerPaddingX="container-md"` (focus)

```json
{
  "size": "4xl",
  "layout": "stack",
  "align": "center",
  "paddingY": "7xl",
  "headerPaddingX": "container-md",
  "title": "Prêt à commencer ?",
  "buttons": "[{\"label\":\"Essayer\",\"variant\":\"default\"}]",
  "appearance": "darkBackground"
}
```

---

### Pattern 6 : Row Full-Bleed (3xl)

**Usage :** Contenu + média côte à côte

**Clés :**
- `layout="row"` + `gapX="10xl"` (espace latéral énorme)
- `figureBleed="full"` + `paddingY="none"` (full-bleed)
- `direction="reverse"` sur sections suivantes (alternance)

```json
{
  "size": "3xl",
  "layout": "row",
  "direction": "default",
  "figureType": "image",
  "image": "/placeholder.svg",
  "figureWidth": "1/2",
  "figureBleed": "full",
  "paddingX": "xl",
  "paddingY": "none",
  "gapX": "10xl",
  "title": "Titre section",
  "subtitle": "Description...",
  "appearance": "borderBottom"
}
```

---

## ✅ Checklist Rapide Avant Génération

### Hiérarchie
- [ ] **3-4 sizes max** sur toute la page (pas de chaos)
- [ ] **Hero en 9xl-10xl** (1 seul par page)
- [ ] **Sections majeures en 2xl-3xl**
- [ ] **CTA en 4xl-5xl**

### Respiration
- [ ] **Rythme paddingY cohérent** (alternance large → compact → large)
- [ ] **Hero avec paddingY énorme** (9xl-10xl)
- [ ] **Sections compactes** (logos, stats) en xl-2xl

### Container
- [ ] **Container mode** : `paddingX="container-lg"` sur toutes sections
- [ ] **Override header** : `headerPaddingX="container-sm"` sur hero (effet tunnel)

### Layout
- [ ] **Stack 90%** (défaut, safe)
- [ ] **Row 10%** (contenu + média uniquement)
- [ ] **GapX="10xl" sur row** (impact visuel)
- [ ] **Direction alternée** sur rows multiples

### Nested Blocks
- [ ] **Parent gère padding** (`paddingX="container-*"`, `paddingY="5xl"`)
- [ ] **Child gère grille** (`paddingX="none"`, `paddingY="none"`)
- [ ] **GapY sur parent** si besoin d'espace entre header et iterator

### Style
- [ ] **Appearances minimalistes** : borderBottom (80%), darkBackground (CTA), outlined (items)
- [ ] **Thème cohérent** : 1-2 couleurs max (brand + slate)

### Technique
- [ ] **Tous les champs en strings** (`"true"` pas `true`)
- [ ] **Arrays stringifiés** : `"buttons": "[{...}]"`, `"items": "[{...}]"`
- [ ] **UUID v4 unique** pour chaque bloc
- [ ] **innerBlocks = []** si vide (jamais `undefined`)
- [ ] **meta.createdAt / updatedAt** en ISO 8601

---

## 🚀 Workflow Complet

### 1. Lire le Contexte Projet
→ [@guides/project/BRIEF.md](../project/BRIEF.md) - Mission, valeurs, 3 piliers
→ [@guides/project/TARGET.md](../project/TARGET.md) - Audiences, ton

### 2. Consulter les Patterns Détaillés
→ [@guides/blob-system/PATTERNS.md](PATTERNS.md) - 6 patterns avec JSON complets

### 3. Générer le JSON
→ [@guides/blob-system/PAGE-STRUCTURE.md](PAGE-STRUCTURE.md) - Format attendu

### 4. Publier via API
→ [@guides/blob-system/API-PUBLISHING.md](API-PUBLISHING.md) - Script + fetch

### 5. Vérifier
→ `http://localhost:3000/[slug]`

---

## 📐 Progression Type d'une Page Complète

```
Section 1:  size="9xl"   paddingY="10xl"   (Hero - Impact massif)
Section 2:  size="md"    paddingY="xl"     (Logos - Compact)
Section 3:  size="2xl"   paddingY="6xl"    (Features - Majeure)
Section 4:  size="2xl"   paddingY="5xl"    (Method - Majeure)
Section 5:  size="4xl"   paddingY="7xl"    (CTA - Relance)
```

**Principe :** 9xl → md → 2xl → 2xl → 4xl (4 sizes, rythme clair)

---

## 🎯 Appearances Wireframe

**4 appearances recommandées :**

- **`default`** : Clean, transparent (10% des cas)
- **`borderBottom`** : Séparateur visuel (80% des cas) ← **LE PLUS FRÉQUENT**
- **`darkBackground`** : Fond sombre pour CTAs (5% des cas)
- **`outlined`** : Bordure simple pour cards (5% des cas)

**❌ À éviter :** `glassmorphism`, `neoBrutalism`, `neonSection`, `figma` (trop décoratif pour wireframes)

---

## 🏗️ Architecture Nested Blocks (Parent/Child)

**Principe :** Le parent blob gère le padding/container. Le child iterator gère uniquement la grille.

```json
{
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "paddingX": "container-lg",   // ← Parent gère container
    "paddingY": "5xl",            // ← Parent gère respiration
    "gapY": "3xl",                // ← Espace entre header et iterator
    "showContent": "true",
    "contentType": "innerBlocks"
  },
  "innerBlocks": [
    {
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "paddingX": "none",       // ← Child ne gère PAS le padding
        "paddingY": "none",       // ← Déjà géré par parent
        "itemFields": "[...]",
        "items": "[...]"
      }
    }
  ]
}
```

**Règle :** Parent = espace, Child = grille

---

## 📚 Pour Aller Plus Loin

### Guides Détaillés
- **Design complet** → [DESIGN-PHILOSOPHY.md](DESIGN-PHILOSOPHY.md) (25 KB, principes avancés)
- **Patterns annotés** → [PATTERNS.md](PATTERNS.md) (17 KB, 6 patterns réels avec rationale)
- **Référence champs** → [FIELD-REFERENCE.md](FIELD-REFERENCE.md) (17 KB, 61 champs documentés)
- **Format JSON** → [PAGE-STRUCTURE.md](PAGE-STRUCTURE.md) (14 KB, validation)
- **Publication API** → [API-PUBLISHING.md](API-PUBLISHING.md) (12 KB, GET/PUT/DELETE)

### Workflows
- **Génération conversationnelle** → [../workflows/../workflows/AI-GENERATION-WORKFLOW.md](../workflows/../workflows/AI-GENERATION-WORKFLOW.md)

---

**Version :** 1.0
**Dernière mise à jour :** 2025-01-15
**Temps de lecture :** 5 minutes
