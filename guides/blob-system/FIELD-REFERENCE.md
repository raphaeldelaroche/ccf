# Référence Complète des Champs Blob

Ce document liste les **61 champs** disponibles dans le système Blob, organisés par section.

**Légende de fréquence :**
- ★★★ = Utilisé très fréquemment (essentiel)
- ★★ = Utilisé régulièrement (important)
- ★ = Utilisé occasionnellement (situationnel)

**Format :** `nomChamp` (type) **fréquence** - Description | Valeurs possibles | Défaut

---

## 1. HEADER (Textes) - 5 champs

Hiérarchie textuelle principale du blob.

**title** (text) ★★★
Titre principal du bloc
*Exemples :* "Mesurez votre impact climat", "Fonctionnalités", "À propos"

**emphasisText** (text) ★★
Portion du titre à mettre en évidence (colorée selon le thème)
*Exemple :* Si title="Mesurez votre **impact** climat" → emphasisText="impact"

**eyebrow** (text) ★★
Texte court au-dessus du titre (catégorie, contexte, urgence)
*Exemples :* "NOUVEAU", "ÉTAPE 1", "FINANCE DURABLE"
*Convention :* Souvent en UPPERCASE, 1-3 mots max

**eyebrowTheme** (dropdown) ★
Couleur de l'eyebrow
*Valeurs :* red, blue, green, yellow, purple, pink, orange, teal, cyan, indigo, violet, fuchsia, rose, amber, lime, emerald, sky, slate, brand
*Défaut :* "brand"

**subtitle** (text) ★★★
Texte de support sous le titre (description, pitch, complément)
*Exemples :* "Le framework de référence pour les entreprises", "Déployez en quelques minutes"

---

## 2. MARKER (Marqueur) - 8 champs

Indicateur visuel qui précède ou accompagne le contenu.

**markerType** (dropdown) ★★
Type de marqueur
*Valeurs :*
- `none` : Aucun marqueur (défaut)
- `text` : Texte court (ex: "01", "★★★★★")
- `icon` : Icône (ex: checkmark, star, arrow)

**markerContent** (text) ★
Contenu textuel du marqueur (si markerType="text")
*Exemples :* "01", "02", "★★★★★", "NEW"
*Condition :* Visible uniquement si markerType="text"

**markerIcon** (icon) ★★
Icône du marqueur (si markerType="icon")
*Format :* Objet JSON `{"name":"IconName","lib":"lucide"}`
*Exemples :* Check, Zap, Shield, TrendingUp, Star, Heart
*Condition :* Visible uniquement si markerType="icon"

**markerPosition** (dropdown) ★★
Position du marqueur par rapport au contenu
*Valeurs :*
- `top` : Au-dessus du titre (défaut, compatible tous layouts)
- `left` : À gauche du titre (stack/bar uniquement)
- `right` : À droite du titre (stack uniquement)
*⚠️ Compatibilité :* row ne supporte que "top"
*⚠️ Contrainte croisée :* Sur stack, si left/right → align ≠ center

**markerStyle** (dropdown) ★
Style visuel du marqueur
*Valeurs :*
- `default` : Rempli, coloré (défaut)
- `ghost` : Transparent, bordure (1.5× plus grand)
- `secondary` : Gris, subtil

**markerSize** (dropdown) ★
Taille du marqueur
*Valeurs :* auto, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl, 10xl
*Défaut :* "auto" (calculé selon size global)

**markerTheme** (dropdown) ★
Couleur du marqueur
*Valeurs :* 18 couleurs + brand (même liste que eyebrowTheme)
*Défaut :* Hérite du theme global

**markerRounded** (dropdown) ★
Forme du marqueur
*Valeurs :*
- `rounded-square` : Carré aux coins arrondis
- `rounded-full` : Cercle complet

---

## 3. FIGURE (Média) - 5 champs

Élément visuel (image ou vidéo) associé au contenu.

**figureType** (dropdown) ★★
Type de média
*Valeurs :*
- `none` : Aucun média (défaut)
- `image` : Image statique
- `video` : Vidéo

**figureWidth** (dropdown) ★
Largeur de la figure (layout row uniquement)
*Valeurs :*
- `1/4` : 25% largeur
- `1/3` : 33% largeur
- `1/2` : 50% largeur (défaut)
- `2/3` : 66% largeur
- `3/4` : 75% largeur
*⚠️ Compatibilité :* Supporté uniquement sur layout="row"
*Condition :* Visible uniquement si figureType="image" ou "video"

**figureBleed** (dropdown) ★
Débordement de la figure hors du container
*Valeurs :*
- `none` : Contenu dans le padding (défaut)
- `full` : Sort du container (full-bleed effect)
*Use case :* Combiné avec paddingX="container-*" pour effet dramatic
*Condition :* Visible uniquement si figureType="image" ou "video"

**image** (image) ★★
Chemin vers le fichier image
*Format :* String "/path/to/image.jpg"
*Condition :* Visible uniquement si figureType="image"

**video** (video) ★
Chemin vers le fichier vidéo
*Format :* String "/path/to/video.mp4"
*Condition :* Visible uniquement si figureType="video"

---

## 4. BUTTONS (Actions) - 2 champs + 8 champs nested

Appels à l'action cliquables.

**actions** (dropdown) ★
Position des boutons par rapport au contenu
*Valeurs :*
- `after` : Après le contenu (défaut)
- `before` : Avant le contenu
*⚠️ Compatibilité :* bar ne supporte que "before"

**buttons** (repeater) ★★★
Liste des boutons (array d'objets)
*⚠️ Important :* Stocké en **JSON stringifié** : `"[{...}, {...}]"`

### Champs nested du repeater buttons :

**label** (text) ★★★
Texte affiché sur le bouton
*Exemples :* "Découvrir", "Commencer", "En savoir plus"
*Convention :* Verbe d'action, court (1-3 mots)

**linkType** (dropdown) ★★★
Type de lien
*Valeurs :*
- `internal` : Page interne du site
- `external` : URL externe
- `custom` : Action personnalisée (ex: open modal)

**internalHref** (text) ★★
Chemin vers page interne
*Format :* "/page-slug"
*Condition :* Visible uniquement si linkType="internal"

**externalHref** (text) ★
URL externe complète
*Format :* "https://example.com"
*Condition :* Visible uniquement si linkType="external"

**customAction** (dropdown) ★
Action personnalisée à déclencher
*Valeurs :* action1, action2 (définies par l'implémentation)
*Condition :* Visible uniquement si linkType="custom"

**variant** (dropdown) ★★
Style visuel du bouton
*Valeurs :*
- `default` : Plein, coloré (CTA principal)
- `outline` : Bordure seule (CTA secondaire)
- `secondary` : Gris neutre
- `ghost` : Transparent, survol coloré
- `link` : Texte simple souligné

**theme** (dropdown) ★
Couleur du bouton
*Valeurs :* 18 couleurs + brand
*Défaut :* Hérite du theme global

**opensInNewTab** (checkbox) ★
Ouvrir le lien dans un nouvel onglet
*Valeur :* true / false
*Défaut :* false

---

## 5. CONTENT (Contenu) - 5 champs

Section de contenu étendu (texte long ou blocs imbriqués).

**showContent** (checkbox) ★★
Activer la section de contenu
*Valeur :* true / false
*Défaut :* false

**contentType** (dropdown) ★★
Type de contenu à afficher
*Valeurs :*
- `text` : Texte simple (paragraphes)
- `innerBlocks` : Blocs Blob imbriqués (récursif)
*Condition :* Visible uniquement si showContent=true

**contentText** (textarea) ★★
Texte du contenu (paragraphes, listes)
*Format :* Multi-lignes, supporte `\n` pour sauts de ligne
*Condition :* Visible uniquement si showContent=true ET contentType="text"

**fontSize** (dropdown) ★
Taille de police du contentText
*Valeurs :* xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl, 10xl
*Défaut :* Calculé selon size global
*Condition :* Visible uniquement si showContent=true ET contentType="text"

**innerBlocks** (innerBlocks) ★
Array de blocs Blob imbriqués
*Format :* Array de BlockNode (récursif, profondeur illimitée)
*Condition :* Visible uniquement si showContent=true ET contentType="innerBlocks"

---

## 6. LAYOUT (Disposition) - 4 champs

Structure visuelle et organisation spatiale du blob.

**size** (dropdown) ★★★
Token de taille global (contrôle typographie + espacement + dimensions)
*Valeurs :* xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl, 10xl
*Défaut :* "md"
*Impact :* Définit ~15 variables CSS (heading-size, padding, gaps, button-height, etc.)

**layout** (dropdown) ★★★
Structure de mise en page
*Valeurs :*
- `stack` : Vertical, empilé (défaut, mobile-first)
- `row` : Horizontal, 2 colonnes (desktop)
- `bar` : Compact horizontal, une ligne
*⚠️ Important :* Choix détermine les options disponibles pour marker, actions, figureWidth

**direction** (dropdown) ★
Ordre d'affichage
*Valeurs :*
- `default` : Ordre normal (défaut)
- `reverse` : Ordre inversé
*Use case :* Inverser visuel sans changer HTML (ex: image à droite → gauche)

**align** (dropdown) ★★
Alignement horizontal du contenu
*Valeurs :*
- `left` : Gauche (défaut safe)
- `center` : Centré
- `right` : Droite
*⚠️ Compatibilité :* bar ne supporte pas "center"
*⚠️ Contrainte croisée :* stack + marker left/right → align ≠ center

---

## 7. SPACING (Espacement) - 6 champs

Contrôle fin de l'espacement interne et externe.

**paddingX** (dropdown) ★
Padding horizontal du container
*Valeurs :* auto, none, xs→10xl, container-sm, container-md, container-lg, container-xl, container-2xl
*Défaut :* "auto" (utilise size)
*Spécial container-* :* Calcule padding pour contraindre largeur max (full-bleed background)

**paddingY** (dropdown) ★
Padding vertical du container
*Valeurs :* auto, none, xs→10xl
*Défaut :* "auto" (utilise size)

**headerPaddingX** (dropdown) ★
Override padding horizontal pour la section header
*Valeurs :* Même que paddingX
*Use case :* Header plus étroit que le reste

**headerPaddingY** (dropdown) ★
Override padding vertical pour la section header
*Valeurs :* Même que paddingY

**gapX** (dropdown) ★
Espacement interne horizontal entre éléments
*Valeurs :* auto, none, xs→10xl
*Défaut :* "auto" (utilise size)

**gapY** (dropdown) ★
Espacement interne vertical entre éléments
*Valeurs :* auto, none, xs→10xl
*Défaut :* "auto" (utilise size)

---

## 8. STYLE (Apparence) - 7 champs

Styling visuel, couleurs, backgrounds.

**appearance** (dropdown) ★★
Preset visuel prédéfini
*Valeurs :*
- `default` : Clean, minimal, fond transparent
- `card` : Bordure subtile, fond blanc, padding
- `cardElevated` : Card + ombre portée
- `darkBackground` : Fond sombre, texte clair
- `borderBottom` : Bordure en bas uniquement
- `glassmorphism` : Effet verre dépoli (blur + transparence)
- `figma` : Style design system
- `neoBrutalism` : Bordures épaisses, ombres fortes
- `outlined` : Bordure épaisse, pas de fond
- `minimal` : Ultra-clean, typographie seule
- `neonSection` : Néons, bordures lumineuses

**theme** (dropdown) ★★
Thème de couleur principal
*Valeurs :* 18 couleurs + brand (voir eyebrowTheme)
*Impact :* Appliqué au background, liens, accents

**backgroundType** (dropdown) ★
Type d'arrière-plan
*Valeurs :*
- `none` : Transparent (défaut)
- `color` : Couleur unie
- `image` : Image de fond
- `custom` : Style personnalisé

**backgroundColor** (dropdown) ★
Couleur de fond (si backgroundType="color")
*Valeurs :* 18 couleurs + brand
*Condition :* Visible uniquement si backgroundType="color"

**backgroundImage** (image) ★
Image de fond (si backgroundType="image")
*Format :* String "/path/to/bg.jpg"
*Condition :* Visible uniquement si backgroundType="image"

**backgroundStyle** (dropdown) ★
Style de fond personnalisé (si backgroundType="custom")
*Valeurs :* style1, style2 (définis par l'implémentation)
*Condition :* Visible uniquement si backgroundType="custom"

---

## 9. SEPARATOR (Séparateur) - 4 champs

Ligne de séparation visuelle dans le contenu.

**showSeparator** (checkbox) ★
Activer le séparateur
*Valeur :* true / false
*Défaut :* false

**separatorType** (dropdown) ★
Type visuel du séparateur
*Valeurs :*
- `line` : Ligne horizontale
- `dot` : Pointillés
- `wave` : Ligne ondulée
*Condition :* Visible uniquement si showSeparator=true

**separatorPosition** (dropdown) ★
Position du séparateur
*Valeurs :*
- `afterTitle` : Après le titre
- `afterSubtitle` : Après le sous-titre
*Condition :* Visible uniquement si showSeparator=true

**separatorColor** (dropdown) ★
Couleur du séparateur
*Valeurs :* 18 couleurs + brand
*Condition :* Visible uniquement si showSeparator=true

---

## 10. SEO (Sémantique HTML) - 2 champs

Balises HTML sémantiques pour le référencement.

**titleAs** (dropdown) ★
Balise HTML du titre
*Valeurs :* div, h1, h2, h3, h4, h5, h6
*Défaut :* "div"
*Recommandation :* h1 pour hero, h2 pour sections, h3 pour cards

**eyebrowAs** (dropdown) ★
Balise HTML de l'eyebrow
*Valeurs :* div, h1, h2, h3, h4, h5, h6
*Défaut :* "div"

---

## 📋 Récapitulatif par Section

| Section | Champs | Utilisation |
|---------|--------|-------------|
| **Header** | 5 | Hiérarchie textuelle (title, subtitle, eyebrow) |
| **Marker** | 8 | Indicateur visuel (text/icon, position, style) |
| **Figure** | 5 | Média (image/video, width, bleed) |
| **Buttons** | 2+8 | Actions (position, array de boutons avec props) |
| **Content** | 5 | Contenu étendu (text ou innerBlocks) |
| **Layout** | 4 | Structure (size, layout, direction, align) |
| **Spacing** | 6 | Paddings et gaps (overrides du size token) |
| **Style** | 7 | Apparence (preset, theme, background) |
| **Separator** | 4 | Ligne de séparation (type, position, couleur) |
| **SEO** | 2 | Balises HTML sémantiques |
| **TOTAL** | **61 champs** | |

---

## 🎯 Champs par Fréquence d'Utilisation

### Essentiels (★★★) - 8 champs
Utilisés dans presque tous les blobs.

1. `title` - Message principal
2. `subtitle` - Description
3. `size` - Échelle d'espacement
4. `layout` - Structure (stack/row/bar)
5. `align` - Alignement
6. `buttons` - CTAs

### Importants (★★) - 15 champs
Utilisés régulièrement selon le contexte.

7. `emphasisText` - Mot-clé surligné
8. `eyebrow` - Contexte/catégorie
9. `markerType` - Indicateur visuel
10. `markerIcon` - Icône du marker
11. `markerPosition` - Placement marker
12. `figureType` - Présence média
13. `image` - Fichier image
14. `contentText` - Texte long
15. `showContent` - Activation contenu
16. `contentType` - Type de contenu
17. `appearance` - Preset visuel
18. `theme` - Couleur principale
19. `variant` (buttons) - Style bouton
20. `label` (buttons) - Texte bouton
21. `linkType` (buttons) - Type de lien

### Occasionnels (★) - 38 champs
Utilisés pour des cas spécifiques ou des overrides fins.

Tous les autres champs (spacing overrides, separator, SEO, background custom, etc.)

---

## 💡 Règles d'Usage Rapides

### Valeurs "auto"
Plusieurs champs acceptent `"auto"` qui signifie "hérite de size" :
- `paddingX`, `paddingY`, `gapX`, `gapY` → utilisent le token size
- `markerSize` → calculé automatiquement proportionnel

### Gating Props
Certains props "débloquent" d'autres champs :
- `markerType="none"` → tous les champs marker* ignorés
- `figureType="none"` → image/video/figureWidth ignorés
- `showContent=false` → contentText/fontSize/innerBlocks ignorés
- `showSeparator=false` → separator* ignorés

### Compatibilité Layout
- **stack** : Supporte tout (défaut safe)
- **row** : Marker top only, figureWidth supporté
- **bar** : Marker top/left only, actions before only, align ≠ center

### Contraintes Croisées
- `layout="stack"` + `markerPosition="left"|"right"` → `align` ≠ `"center"`
- `layout="row"` → `markerPosition` force à `"top"`
- `layout="bar"` → `actions` force à `"before"`

### Sérialisation JSON
⚠️ **Très important** pour l'IA :
- Tous les champs sont des **strings** (même booléens : `"true"` / `"false"`)
- Arrays sont **JSON stringifiés** : `buttons="[{...}]"`, `items="[{...}]"`
- Champs vides = `""` (string vide, pas null/undefined)

---

## 🔄 Champs Spécifiques Iterator

Quand blockType="blobIterator", ajoutez ces 3 champs :

**iteratorLayout** (dropdown) ★★★
Layout de la collection
*Valeurs :* swiper, grid-1, grid-2, grid-3, grid-4, grid-5, grid-6, grid-auto

**iteratorGapX** (dropdown) ★★
Espace horizontal entre items
*Valeurs :* auto, none, xs→10xl

**iteratorGapY** (dropdown) ★★
Espace vertical entre items
*Valeurs :* auto, none, xs→10xl

**itemFields** (multiselect) ★★★
Champs gérés par item (vs partagés)
*Format :* **String JSON** (comme `buttons`) : `"[\"title\",\"subtitle\",\"image\"]"`
*Logique :* Si un champ EST dans itemFields → valeur de l'item, sinon → valeur partagée
⚠️ Doit être `JSON.stringify([...])` — un vrai array JS sera ignoré par le mapper

**items** (repeater) ★★★
Array des items de la collection
*Format :* **String JSON** (comme `buttons`) : `"[{...}, {...}]"`
*Contenu :* Chaque objet contient les props des champs dans itemFields
⚠️ Doit être `JSON.stringify([...])` — un vrai array JS sera ignoré et le rendu sera vide

**Défaut recommandé itemFields :**
```json
{
  "itemFields": "[\"title\",\"subtitle\",\"markerIcon\",\"image\",\"buttons\",\"contentText\"]"
}
```
→ Contenu varié, structure partagée

---

**Prochaines étapes :**
- [PAGE-STRUCTURE.md](./PAGE-STRUCTURE.md) : Format JSON exact des pages
- [../workflows/AI-GENERATION-WORKFLOW.md](./../workflows/AI-GENERATION-WORKFLOW.md) : Workflow de génération
- [PATTERNS.md](./PATTERNS.md) : 12 patterns prêts à l'emploi

**Version :** 1.0
**Dernière mise à jour :** 2024-01-15
