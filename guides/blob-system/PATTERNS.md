# Bibliothèque de Patterns Blob (Wireframe)

Ce document contient **6 patterns réels** tirés des pages "hello" et "demo", annotés pour servir de référence lors de la génération de pages wireframe via IA.

**Focus :** Structure, hiérarchie visuelle, rythme spatial. Pas de décoration.

Chaque exemple inclut :
- **Cas d'usage** : Quand utiliser ce pattern
- **Principes wireframe** : Pourquoi ces choix fonctionnent structurellement
- **JSON complet** : Structure prête à utiliser
- **Clés de succès** : Points critiques à respecter

---

## Pattern 1 : Hero Massif (9xl)

### Cas d'usage
Première section d'une landing page. Objectif : Impact visuel maximum, accroche claire.

### Principes wireframe
- **Size 9xl** : Échelle maximale pour le hero (1 seul par page)
- **PaddingY 10xl** : Respiration énorme (crée l'espace, l'importance)
- **Container + Header Override** : `paddingX="container-xl"` + `headerPaddingX="container-sm"` = effet tunnel (titre étroit, subtitle large)
- **BorderBottom** : Séparation nette avec la section suivante
- **Buttons** : 2 CTAs (principal + secondaire)

### Hiérarchie
```
Size: 9xl (Massif)
PaddingY: 10xl (Énorme respiration)
PaddingX: container-xl (Large container)
HeaderPaddingX: container-sm (Titre étroit - effet tunnel)
```

### JSON
```json
{
  "id": "hero-massif",
  "blockType": "blob",
  "data": {
    "size": "9xl",
    "layout": "stack",
    "align": "center",
    "paddingX": "container-xl",
    "paddingY": "10xl",
    "headerPaddingX": "container-sm",
    "title": "Nous mesurons toute // votre action climatique. // Enfin.",
    "subtitle": "Le CCF rassemble vos actions climat existantes en un score unique, comparable et ajusté à votre secteur. Sans reporting supplémentaire.",
    "buttons": "[{\"label\":\"Évaluer votre contribution\",\"variant\":\"default\",\"theme\":\"red\",\"linkType\":\"internal\",\"internalHref\":\"\",\"opensInNewTab\":\"false\"},{\"label\":\"Contacter l'équipe\",\"variant\":\"ghost\",\"theme\":\"red\",\"linkType\":\"internal\",\"internalHref\":\"\",\"opensInNewTab\":\"false\"}]",
    "showContent": "false",
    "figureType": "none",
    "markerType": "none",
    "appearance": "borderBottom"
  },
  "innerBlocks": []
}
```

### Clés de succès
- ✅ `size="9xl"` : Réservé au hero uniquement
- ✅ `paddingY="10xl"` : Respiration proportionnelle au size
- ✅ `headerPaddingX="container-sm"` : Titre plus étroit que le container = focus
- ✅ `appearance="borderBottom"` : Séparation visuelle forte
- ❌ Ne pas utiliser 9xl ailleurs sur la page (dilue l'impact)

---

## Pattern 2 : Logos Compacts (md)

### Cas d'usage
Section de validation sociale (logos clients, partenaires). Objectif : Crédibilité sans prendre trop d'espace.

### Principes wireframe
- **Size md** : Compact (contraste avec le hero 9xl)
- **PaddingY xl** : Respiration minimale (section secondaire)
- **GapY none sur parent** : Le child iterator colle au parent (pas d'espace)
- **Grid-5** : 5 colonnes de logos très compacts
- **BorderBottom** : Séparation nette

### Hiérarchie
```
Size: md (Compact)
PaddingY: xl (Respiration minimale)
GapY: none (Child colle au parent)
Iterator: grid-5 (5 colonnes)
```

### JSON
```json
{
  "id": "logos-compacts",
  "blockType": "blob",
  "data": {
    "size": "md",
    "layout": "stack",
    "align": "center",
    "paddingX": "container-lg",
    "paddingY": "xl",
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
        "items": "[{},{},{},{},{}]"
      }
    },
    {
      "id": "logos-caption",
      "blockType": "blob",
      "data": {
        "size": "md",
        "layout": "stack",
        "align": "center",
        "showContent": "true",
        "contentType": "text",
        "contentText": "— Sweep & Mirova —",
        "paddingY": "none"
      },
      "innerBlocks": []
    }
  ]
}
```

### Clés de succès
- ✅ `size="md"` : Compact (opposition au hero 9xl)
- ✅ `paddingY="xl"` : Minimal, cette section ne doit pas respirer trop
- ✅ `gapY="none"` sur parent : Child colle directement (pas d'espace entre header et iterator)
- ✅ `grid-5` : Maximum de logos sur une ligne (compact)
- ✅ Caption en nested block avec `paddingY="none"` : Colle à l'iterator

---

## Pattern 3 : Section Majeure avec Iterator (2xl)

### Cas d'usage
Section de contenu importante (features, valeur, explication). Objectif : Hiérarchie visuelle forte, respiration large.

### Principes wireframe
- **Size 2xl** : Section majeure (90% des sections de contenu)
- **PaddingY 6xl** : Respiration large (balance entre compact et énorme)
- **HeaderPaddingX container-md** : Titre légèrement plus étroit que le container
- **Parent gère padding, child gère grille** : Architecture nested blocks
- **BorderBottom** : Séparation

### Hiérarchie
```
Size: 2xl (Section majeure)
PaddingY: 6xl (Respiration large)
HeaderPaddingX: container-md (Titre un peu étroit)
Parent: Espace + container
Child: Grille uniquement
```

### JSON
```json
{
  "id": "section-majeure",
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "layout": "stack",
    "align": "center",
    "paddingX": "container-lg",
    "paddingY": "6xl",
    "headerPaddingX": "container-md",
    "title": "Jusqu'à maintenant, personne n'avait mesuré // toutes vos actions climatiques.",
    "subtitle": "Lorem ipsum dolor sit amet consectetur. Nunc nisl at sed lorem mattis.",
    "buttons": "[{\"label\":\"Évaluer votre contribution\",\"variant\":\"default\",\"theme\":\"red\",\"linkType\":\"internal\",\"internalHref\":\"\",\"opensInNewTab\":\"false\"}]",
    "showContent": "true",
    "contentType": "innerBlocks",
    "appearance": "borderBottom",
    "actions": "after"
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

### Clés de succès
- ✅ `size="2xl"` : Standard pour sections majeures (ni trop grand, ni trop petit)
- ✅ `paddingY="6xl"` : Respiration proportionnelle au size
- ✅ `headerPaddingX="container-md"` : Titre un peu plus étroit (focus)
- ✅ Parent : `paddingX="container-lg"`, `paddingY="6xl"`
- ✅ Child : `paddingX="none"`, `paddingY="none"` (grille seulement)

---

## Pattern 4 : Method avec Marker Left (2xl)

### Cas d'usage
Section méthodologie, process, étapes. Objectif : Liste compacte avec numérotation, 3 piliers structurés.

### Principes wireframe
- **Size 2xl** : Section majeure
- **PaddingY 5xl** : Respiration medium (un peu moins que 6xl)
- **GapY 3xl sur parent** : Espace entre le header et l'iterator (respiration interne)
- **Marker left** : Style liste compacte (01. Titre)
- **Appearance outlined** : Bordure simple (wireframe minimal)
- **BorderBottom** : Séparation

### Hiérarchie
```
Size: 2xl (Section majeure)
PaddingY: 5xl (Medium)
GapY: 3xl (Espace header ↔ iterator)
Marker: left (Liste compacte)
Appearance: outlined (Bordure simple)
```

### JSON
```json
{
  "id": "method-section",
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "layout": "stack",
    "align": "center",
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
        "markerPosition": "left",
        "markerStyle": "ghost",
        "markerSize": "md",
        "appearance": "outlined",
        "showContent": "true",
        "contentType": "text",
        "itemFields": "[\"title\",\"subtitle\",\"markerContent\",\"contentText\"]",
        "items": "[{\"title\":\"Réduire\",\"subtitle\":\"Décarboner les opérations et la chaîne de valeur\",\"markerContent\":\"01.\",\"contentText\":\"Réduire les émissions sur les Scopes 1, 2 et 3 grâce à des plans de transition...\"},{\"title\":\"Déployer\",\"subtitle\":\"Mettre à l'échelle les solutions bas-carbone\",\"markerContent\":\"02.\",\"contentText\":\"Accélérer la transition via des solutions concrètes...\"},{\"title\":\"Financer\",\"subtitle\":\"Orienter les capitaux vers des projets Net Zero\",\"markerContent\":\"03.\",\"contentText\":\"Investir au-delà de sa chaîne de valeur grâce aux crédits carbone...\"}]"
      }
    }
  ]
}
```

### Clés de succès
- ✅ `gapY="3xl"` sur parent : Espace entre title et iterator (respiration interne)
- ✅ `markerPosition="left"` : Style liste compacte (marker à gauche du titre)
- ✅ `markerStyle="ghost"` : Transparent, bordure (1.5× plus grand que default)
- ✅ `appearance="outlined"` : Bordure simple (wireframe minimal)
- ✅ `align="left"` : Obligatoire avec marker left
- ✅ `itemFields` : `"title"`, `"subtitle"`, `"markerContent"`, `"contentText"` (tout varie)

---

## Pattern 5 : CTA Section (4xl)

### Cas d'usage
Section de relance, appel à l'action, conversion. Objectif : Contraste visuel fort, impossible à rater.

### Principes wireframe
- **Size 4xl** : Relance forte (plus grand que sections majeures 2xl-3xl)
- **PaddingY 7xl** : Respiration importante (relance l'attention)
- **Appearance darkBackground** : Fond sombre (contraste visuel maximal)
- **HeaderPaddingX container-md** : Titre légèrement étroit (focus)

### Hiérarchie
```
Size: 4xl (Relance forte)
PaddingY: 7xl (Respiration importante)
Appearance: darkBackground (Contraste)
HeaderPaddingX: container-md (Focus)
```

### JSON
```json
{
  "id": "cta-section",
  "blockType": "blob",
  "data": {
    "size": "4xl",
    "layout": "stack",
    "align": "center",
    "paddingY": "7xl",
    "title": "Lorem ipsum dolor sit amet consectetur. Nunc nisl at sed lorem mattis. Blandit amet et risus molestie",
    "buttons": "[{\"label\":\"Évaluer votre contribution\",\"variant\":\"default\",\"theme\":\"red\",\"linkType\":\"internal\",\"internalHref\":\"\",\"opensInNewTab\":\"false\"}]",
    "appearance": "darkBackground",
    "gapY": "auto",
    "headerPaddingX": "container-md"
  },
  "innerBlocks": []
}
```

### Clés de succès
- ✅ `size="4xl"` : Plus grand que sections majeures (2xl-3xl) = relance
- ✅ `paddingY="7xl"` : Respiration importante (attire l'attention)
- ✅ `appearance="darkBackground"` : Contraste visuel fort (se détache)
- ✅ `headerPaddingX="container-md"` : Titre étroit (focus sur message)
- ✅ Pas de subtitle, pas de content : Simple, direct, action

---

## Pattern 6 : Row Full-Bleed avec GapX Extrême (3xl)

### Cas d'usage
Section contenu + média côte à côte. Objectif : Impact visuel fort, alternance texte/image.

### Principes wireframe
- **Layout row** : Horizontal (50% texte, 50% image)
- **FigureBleed full** : L'image sort du container (full-bleed)
- **PaddingY none** : Pas de padding vertical (full-bleed vertical aussi)
- **GapX 10xl** : Espace latéral ÉNORME (crée un effet visuel fort)
- **Direction alternée** : reverse sur sections suivantes (alternance gauche/droite)
- **Size 3xl** : Section majeure (un peu plus grand que 2xl)

### Hiérarchie
```
Size: 3xl (Section majeure+)
Layout: row (Horizontal)
GapX: 10xl (Espace latéral énorme)
FigureBleed: full (Image sort du container)
PaddingY: none (Full-bleed vertical)
Direction: reverse (Alternance)
```

### JSON
```json
{
  "id": "row-full-bleed",
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
    "title": "Titre Section",
    "subtitle": "Description de la section...",
    "appearance": "borderBottom"
  },
  "innerBlocks": []
}
```

### JSON (Section suivante avec direction reverse)
```json
{
  "id": "row-full-bleed-2",
  "blockType": "blob",
  "data": {
    "size": "3xl",
    "layout": "row",
    "direction": "reverse",
    "figureType": "image",
    "image": "/placeholder-vertical.svg",
    "figureWidth": "1/2",
    "figureBleed": "full",
    "paddingX": "xl",
    "paddingY": "none",
    "gapX": "10xl",
    "title": "Titre Section 2",
    "subtitle": "Description de la section...",
    "appearance": "borderBottom"
  },
  "innerBlocks": []
}
```

### Clés de succès
- ✅ `gapX="10xl"` : CRITIQUE - espace latéral énorme (impact visuel wireframe)
- ✅ `figureBleed="full"` : Image sort du container (full-bleed)
- ✅ `paddingY="none"` : Pas de padding vertical (full-bleed vertical)
- ✅ `direction="reverse"` : Alterner sur sections multiples (gauche → droite → gauche)
- ✅ `figureWidth="1/2"` : 50/50 (équilibre)
- ✅ `paddingX="xl"` : Padding horizontal minimal (texte ne colle pas)

---

## 📋 Récapitulatif des Patterns Réels

| Pattern | Size | PaddingY | Layout | Clé Wireframe |
|---------|------|----------|--------|---------------|
| 1. Hero Massif | 9xl | 10xl | stack | headerPaddingX override (effet tunnel) |
| 2. Logos Compacts | md | xl | stack | gapY="none" (child colle) |
| 3. Section Majeure | 2xl | 6xl | stack | Parent padding, child grille |
| 4. Method Marker Left | 2xl | 5xl | stack | gapY="3xl", markerPosition="left" |
| 5. CTA Section | 4xl | 7xl | stack | darkBackground, relance |
| 6. Row Full-Bleed | 3xl | none | row | gapX="10xl", figureBleed="full" |

---

## 🎯 Progression Size Recommandée (Page Complète)

```
Section 1: size="9xl"   paddingY="10xl"   (Hero - Impact massif)
Section 2: size="md"    paddingY="xl"     (Logos - Compact)
Section 3: size="2xl"   paddingY="6xl"    (Features - Majeure)
Section 4: size="2xl"   paddingY="5xl"    (Method - Majeure)
Section 5: size="4xl"   paddingY="7xl"    (CTA - Relance)
```

**Principe :** 3-4 sizes max sur toute la page (9xl → md → 2xl → 4xl)

---

## 🌬️ Rythme PaddingY Recommandé

**Pattern "hello" :**
```
10xl → xl → 6xl → 5xl → 7xl
```

**Principe :** Alternance large → compact → large crée un rythme de lecture.

---

## 🏗️ Architecture Nested Blocks (Pattern Recommandé)

```json
{
  "blockType": "blob",
  "data": {
    "size": "2xl",
    "paddingX": "container-lg",    // ← Parent gère container
    "paddingY": "5xl",             // ← Parent gère respiration
    "title": "...",
    "showContent": "true",
    "contentType": "innerBlocks",
    "gapY": "3xl"                  // ← Espace entre header et iterator
  },
  "innerBlocks": [
    {
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "paddingX": "none",        // ← Child ne gère PAS le padding
        "paddingY": "none",        // ← Déjà géré par parent
        "itemFields": "[...]",
        "items": "[...]"
      }
    }
  ]
}
```

**Règle d'Or :**
- **Parent** : `paddingX="container-*"`, `paddingY="5xl"`, `gapY="3xl"`
- **Child** : `paddingX="none"`, `paddingY="none"`, focus sur `iteratorLayout`

---

## 🎨 Appearances Wireframe (4 Recommandées)

**`default`** : Clean, transparent (10% des cas)

**`borderBottom`** : Séparateur visuel (80% des cas)
```json
{ "appearance": "borderBottom" }
```

**`darkBackground`** : Fond sombre pour CTAs (5% des cas)
```json
{ "appearance": "darkBackground", "theme": "brand" }
```

**`outlined`** : Bordure simple pour cards (5% des cas)
```json
{ "appearance": "outlined" }
```

**❌ Éviter :** `glassmorphism`, `neoBrutalism`, `neonSection`, `figma` (trop décoratif pour wireframes)

---

## 🎯 Markers : Left vs Top

### Marker Left : Liste Compacte
```json
{
  "markerType": "text",
  "markerPosition": "left",
  "markerStyle": "ghost",
  "align": "left"
}
```

**Usage :** Méthodologie, process, étapes (01. Titre)

### Marker Top : Feature Card
```json
{
  "markerType": "icon",
  "markerPosition": "top",
  "markerStyle": "default",
  "align": "center"
}
```

**Usage :** Features, services, highlights

---

## 📚 Pour Aller Plus Loin

- **DESIGN-PHILOSOPHY.md** : Guide conceptuel complet (wireframe focus)
- **FIELD-REFERENCE.md** : Référence complète des 61 champs
- **PAGE-STRUCTURE.md** : Format JSON exact attendu
- **../workflows/AI-GENERATION-WORKFLOW.md** : Guide d'utilisation avec Claude Code

---

**Version :** 2.0 (Patterns Réels - Wireframe)
**Dernière mise à jour :** 2025-01-15
