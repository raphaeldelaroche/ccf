# Structure d'une Page Blob

Ce document définit le format JSON exact attendu par le New Editor pour les pages Blob.

---

## 📄 Format Racine de la Page

```json
{
  "version": "1.0",
  "slug": "page-slug",
  "title": "Page Title",
  "blocks": [
    /* Array de BlockNode */
  ],
  "meta": {
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Champs Racine

**version** (string) - Version du format de données
*Valeur :* `"1.0"`
*Obligatoire :* Oui

**slug** (string) - Identifiant unique de la page (URL-friendly)
*Format :* Kebab-case, uniquement `[a-z0-9-]`
*Exemples :* `"home"`, `"about-us"`, `"climate-framework-overview"`
*Obligatoire :* Oui

**title** (string) - Titre de la page (affiché dans l'éditeur)
*Format :* Texte libre
*Exemples :* `"Accueil"`, `"À propos"`, `"Climate Framework Overview"`
*Obligatoire :* Oui

**blocks** (array) - Liste des blocs de la page
*Type :* Array de `BlockNode`
*Obligatoire :* Oui
*Peut être vide :* Oui (`[]` pour une page vide)

**meta** (object) - Métadonnées de la page
*Champs :*
- `createdAt` : Date de création (ISO 8601 string)
- `updatedAt` : Date de dernière modification (ISO 8601 string)
*Obligatoire :* Oui

---

## 🧱 Structure d'un BlockNode

Un `BlockNode` représente un bloc Blob ou BlobIterator.

```typescript
{
  "id": "uuid-v4-string",
  "blockType": "blob" | "blobIterator",
  "data": {
    /* Objet avec les props du bloc */
  },
  "innerBlocks": [
    /* Array récursif de BlockNode (optionnel) */
  ]
}
```

### Champs BlockNode

**id** (string) - Identifiant unique du bloc
*Format :* UUID v4 (ex: `"f7e3a9b2-4c1d-4e8f-9a6b-2d5c8f1e3a7b"`)
*Génération :* `crypto.randomUUID()` en JavaScript
*Obligatoire :* Oui

**blockType** (string) - Type de bloc
*Valeurs :*
- `"blob"` : Blob standard
- `"blobIterator"` : Collection de blobs (iterator)
*Obligatoire :* Oui

**data** (object) - Props du bloc
*Type :* `Record<string, string>`
*Contenu :* Tous les champs Blob (voir [FIELD-REFERENCE.md](./FIELD-REFERENCE.md))
*⚠️ Important :* **Toutes les valeurs sont des strings** (même booléens, arrays)
*Obligatoire :* Oui

**innerBlocks** (array) - Blocs enfants (imbrication)
*Type :* Array de `BlockNode` (récursif, profondeur illimitée)
*Obligatoire :* Non (peut être omis si pas d'enfants)
*Défaut :* `[]` (array vide, **jamais** `null` ou `undefined`)

---

## ⚠️ Règles Critiques de Sérialisation

### 1. Toutes les Valeurs sont des Strings

```json
{
  "data": {
    "size": "lg",              // ✅ String
    "showContent": "true",     // ✅ String (pas boolean!)
    "showSeparator": "false",  // ✅ String (pas boolean!)
    "markerType": "icon",      // ✅ String
    "title": "Mon titre"       // ✅ String
  }
}
```

**❌ INVALIDE :**
```json
{
  "data": {
    "showContent": true,       // ❌ Boolean natif
    "showSeparator": false,    // ❌ Boolean natif
    "buttons": [{...}]         // ❌ Array natif
  }
}
```

---

### 2. Arrays Stringifiés en JSON

Les champs de type array (buttons, items, itemFields) doivent être **stringifiés en JSON** :

```json
{
  "data": {
    "buttons": "[{\"label\":\"Découvrir\",\"variant\":\"default\",\"theme\":\"brand\",\"linkType\":\"internal\",\"internalHref\":\"/demo\"}]",
    "itemFields": "[\"title\",\"subtitle\",\"markerIcon\"]",
    "items": "[{\"title\":\"Item 1\"},{\"title\":\"Item 2\"}]"
  }
}
```

> ⚠️ **Critique pour les BlobIterators** : `items` et `itemFields` **doivent impérativement être des strings JSON**, exactement comme `buttons`. Si ces champs sont de vrais arrays JavaScript (non stringifiés), le mapper ne pourra pas les lire et le rendu sera vide (aucun item affiché, aucun style appliqué).
>
> ✅ Correct en script Node.js :
> ```javascript
> items: JSON.stringify([{ title: "A" }, { title: "B" }]),
> itemFields: JSON.stringify(["title", "subtitle", "markerContent"]),
> ```
> ❌ Incorrect :
> ```javascript
> items: [{ title: "A" }, { title: "B" }],   // array JS → rendu vide
> itemFields: ["title", "subtitle"],           // array JS → props ignorées
> ```

**Structure avant stringification :**
```javascript
// buttons (array d'objets)
const buttons = [
  {
    label: "Découvrir",
    variant: "default",
    theme: "brand",
    linkType: "internal",
    internalHref: "/demo",
    opensInNewTab: "false"  // ← String aussi!
  }
];

// Après stringification
const data = {
  buttons: JSON.stringify(buttons)
};
```

---

### 3. Champs Vides = String Vide

Si un champ n'est pas utilisé, sa valeur est `""` (string vide) :

```json
{
  "data": {
    "emphasisText": "",       // ✅ Pas utilisé
    "eyebrow": "",            // ✅ Pas utilisé
    "markerIcon": "",         // ✅ Pas utilisé (markerType="text")
    "image": "",              // ✅ Pas utilisé (figureType="none")
    "direction": ""           // ✅ Valeur par défaut
  }
}
```

**❌ INVALIDE :**
```json
{
  "data": {
    "emphasisText": null,     // ❌ Null
    "eyebrow": undefined      // ❌ Undefined
  }
}
```

---

### 4. InnerBlocks = Array Vide ou Omis

Si un bloc n'a pas d'enfants :

```json
{
  "id": "...",
  "blockType": "blob",
  "data": {...},
  "innerBlocks": []           // ✅ Array vide
}
```

Ou :

```json
{
  "id": "...",
  "blockType": "blob",
  "data": {...}
  // ✅ innerBlocks omis (équivalent à [])
}
```

**❌ INVALIDE :**
```json
{
  "innerBlocks": null         // ❌ Null
}
```

---

## 📚 Exemples Complets

### Exemple 1 : Page Simple (1 Hero Blob)

```json
{
  "version": "1.0",
  "slug": "home",
  "title": "Accueil",
  "blocks": [
    {
      "id": "f7e3a9b2-4c1d-4e8f-9a6b-2d5c8f1e3a7b",
      "blockType": "blob",
      "data": {
        "size": "xl",
        "layout": "stack",
        "align": "center",
        "eyebrow": "NOUVEAU",
        "eyebrowTheme": "brand",
        "title": "Mesurez votre impact climat",
        "emphasisText": "impact",
        "subtitle": "Le framework de référence pour les entreprises",
        "buttons": "[{\"label\":\"Découvrir\",\"variant\":\"default\",\"theme\":\"brand\",\"linkType\":\"internal\",\"internalHref\":\"/demo\"}]",
        "appearance": "minimal",
        "theme": "brand",
        "markerType": "none",
        "figureType": "none",
        "showContent": "false",
        "showSeparator": "false",
        "paddingX": "auto",
        "paddingY": "auto",
        "gapX": "auto",
        "gapY": "auto",
        "direction": "",
        "actions": "",
        "backgroundType": "none",
        "titleAs": "h1",
        "eyebrowAs": "div"
      },
      "innerBlocks": []
    }
  ],
  "meta": {
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Exemple 2 : Page avec Iterator (Feature Grid)

```json
{
  "version": "1.0",
  "slug": "features",
  "title": "Fonctionnalités",
  "blocks": [
    {
      "id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "blockType": "blob",
      "data": {
        "size": "xl",
        "layout": "stack",
        "align": "center",
        "title": "Nos Fonctionnalités",
        "subtitle": "Tout ce dont vous avez besoin",
        "appearance": "minimal",
        "markerType": "none",
        "figureType": "none",
        "showContent": "false",
        "showSeparator": "false",
        "paddingX": "auto",
        "paddingY": "auto",
        "titleAs": "h1"
      },
      "innerBlocks": []
    },
    {
      "id": "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "blockType": "blobIterator",
      "data": {
        "iteratorLayout": "grid-3",
        "iteratorGapX": "lg",
        "iteratorGapY": "lg",
        "itemFields": "[\"title\",\"subtitle\",\"markerIcon\"]",
        "size": "md",
        "layout": "stack",
        "align": "center",
        "markerType": "icon",
        "markerStyle": "default",
        "markerTheme": "blue",
        "markerSize": "auto",
        "markerRounded": "rounded-full",
        "appearance": "cardElevated",
        "theme": "slate",
        "figureType": "none",
        "showContent": "false",
        "paddingX": "auto",
        "paddingY": "auto",
        "items": "[{\"title\":\"Rapidité\",\"subtitle\":\"Déployez en minutes\",\"markerIcon\":\"{\\\"name\\\":\\\"Zap\\\",\\\"lib\\\":\\\"lucide\\\"}\"},{\"title\":\"Sécurité\",\"subtitle\":\"Chiffrement de bout en bout\",\"markerIcon\":\"{\\\"name\\\":\\\"Shield\\\",\\\"lib\\\":\\\"lucide\\\"}\"},{\"title\":\"Évolutivité\",\"subtitle\":\"Scalez sans limites\",\"markerIcon\":\"{\\\"name\\\":\\\"TrendingUp\\\",\\\"lib\\\":\\\"lucide\\\"}\"}]"
      },
      "innerBlocks": []
    }
  ],
  "meta": {
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Exemple 3 : Page avec InnerBlocks Imbriqués (FAQ)

```json
{
  "version": "1.0",
  "slug": "faq",
  "title": "FAQ",
  "blocks": [
    {
      "id": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
      "blockType": "blob",
      "data": {
        "size": "lg",
        "layout": "stack",
        "align": "left",
        "title": "Questions Fréquentes",
        "subtitle": "Trouvez les réponses à vos questions",
        "showContent": "true",
        "contentType": "innerBlocks",
        "appearance": "minimal",
        "markerType": "none",
        "figureType": "none",
        "paddingX": "auto",
        "titleAs": "h1"
      },
      "innerBlocks": [
        {
          "id": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
          "blockType": "blob",
          "data": {
            "size": "md",
            "layout": "stack",
            "title": "Combien de temps dure l'essai gratuit ?",
            "showContent": "true",
            "contentType": "text",
            "contentText": "Notre essai gratuit dure 14 jours, sans engagement.",
            "appearance": "borderBottom",
            "markerType": "none",
            "figureType": "none",
            "titleAs": "h3"
          },
          "innerBlocks": []
        },
        {
          "id": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
          "blockType": "blob",
          "data": {
            "size": "md",
            "layout": "stack",
            "title": "Puis-je annuler à tout moment ?",
            "showContent": "true",
            "contentType": "text",
            "contentText": "Oui, vous pouvez annuler depuis votre tableau de bord.",
            "appearance": "borderBottom",
            "markerType": "none",
            "figureType": "none",
            "titleAs": "h3"
          },
          "innerBlocks": []
        }
      ]
    }
  ],
  "meta": {
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

## 🛠️ Template de Page Vide

Utilisez ce template comme point de départ :

```json
{
  "version": "1.0",
  "slug": "nouvelle-page",
  "title": "Nouvelle Page",
  "blocks": [],
  "meta": {
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 🛠️ Template de Blob Minimal

Blob avec uniquement les champs essentiels :

```json
{
  "id": "GENERATE-UUID-HERE",
  "blockType": "blob",
  "data": {
    "size": "md",
    "layout": "stack",
    "align": "left",
    "title": "Titre du bloc",
    "subtitle": "",
    "emphasisText": "",
    "eyebrow": "",
    "eyebrowTheme": "brand",
    "markerType": "none",
    "markerContent": "",
    "markerIcon": "",
    "markerPosition": "top",
    "markerStyle": "default",
    "markerSize": "auto",
    "markerTheme": "brand",
    "markerRounded": "rounded-square",
    "figureType": "none",
    "figureWidth": "",
    "figureBleed": "none",
    "image": "",
    "video": "",
    "actions": "",
    "buttons": "",
    "showContent": "false",
    "contentType": "text",
    "contentText": "",
    "fontSize": "md",
    "direction": "",
    "paddingX": "auto",
    "paddingY": "auto",
    "headerPaddingX": "",
    "headerPaddingY": "",
    "gapX": "auto",
    "gapY": "auto",
    "appearance": "default",
    "theme": "brand",
    "backgroundType": "none",
    "backgroundColor": "",
    "backgroundImage": "",
    "backgroundStyle": "",
    "showSeparator": "false",
    "separatorType": "line",
    "separatorPosition": "afterTitle",
    "separatorColor": "brand",
    "titleAs": "div",
    "eyebrowAs": "div"
  },
  "innerBlocks": []
}
```

---

## 🛠️ Template de BlobIterator Minimal

Iterator avec structure partagée et items :

```json
{
  "id": "GENERATE-UUID-HERE",
  "blockType": "blobIterator",
  "data": {
    "iteratorLayout": "grid-3",
    "iteratorGapX": "lg",
    "iteratorGapY": "lg",
    "itemFields": "[\"title\",\"subtitle\"]",
    "size": "md",
    "layout": "stack",
    "align": "center",
    "markerType": "none",
    "figureType": "none",
    "showContent": "false",
    "appearance": "card",
    "theme": "slate",
    "paddingX": "auto",
    "paddingY": "auto",
    "gapX": "auto",
    "gapY": "auto",
    "items": "[{\"title\":\"Item 1\",\"subtitle\":\"Description 1\"},{\"title\":\"Item 2\",\"subtitle\":\"Description 2\"}]"
  },
  "innerBlocks": []
}
```

---

## ✅ Checklist de Validation

Avant de sauvegarder une page générée, vérifiez :

### Structure
- [ ] Champ `version` présent et = `"1.0"`
- [ ] Champ `slug` présent, format kebab-case
- [ ] Champ `title` présent
- [ ] Champ `blocks` présent (array)
- [ ] Champ `meta` présent avec `createdAt` et `updatedAt`

### Blocs
- [ ] Chaque bloc a un `id` UUID unique
- [ ] Chaque bloc a un `blockType` valide (`"blob"` ou `"blobIterator"`)
- [ ] Chaque bloc a un objet `data`
- [ ] `innerBlocks` est soit absent, soit un array (jamais null)

### Sérialisation
- [ ] Toutes les valeurs dans `data` sont des **strings**
- [ ] Booléens écrits en strings (`"true"` / `"false"`)
- [ ] Arrays stringifiés en JSON (`"[...]"`) — notamment `buttons`, `items`, `itemFields`
- [ ] Champs vides = `""` (string vide, pas null)

### Compatibilité
- [ ] Pas de combinaisons invalides (ex: row + marker left)
- [ ] `itemFields` défini pour les BlobIterator **(string JSON, pas array JS)**
- [ ] `items` array présent pour les BlobIterator **(string JSON, pas array JS)**
- [ ] Les champs dans `items[n]` correspondent aux champs déclarés dans `itemFields`
## 🔗 Références

- **Liste complète des champs :** [FIELD-REFERENCE.md](./FIELD-REFERENCE.md)
- **Exemples de patterns :** [PATTERNS.md](./PATTERNS.md)
- **Guide conceptuel :** [DESIGN-PHILOSOPHY.md](./DESIGN-PHILOSOPHY.md)
- **Workflow de génération :** [../workflows/AI-GENERATION-WORKFLOW.md](./../workflows/AI-GENERATION-WORKFLOW.md)

---

**Version :** 1.0
**Dernière mise à jour :** 2024-01-15
