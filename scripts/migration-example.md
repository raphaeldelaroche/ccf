# Exemple de migration responsive

Ce document montre un exemple concret de transformation de données lors de la migration.

## Avant la migration (format string)

```json
{
  "id": "block-123",
  "blockType": "blob",
  "data": {
    "title": "Notre mission",
    "subtitle": "Accompagner les entreprises",
    "layout": "stack md:row lg:bar",
    "marker": "top md:left",
    "size": "md lg:xl",
    "paddingX": "sm md:md lg:lg",
    "paddingY": "md",
    "figureWidth": "1/2",
    "theme": "brand"
  },
  "innerBlocks": []
}
```

## Après la migration (format objet)

```json
{
  "id": "block-123",
  "blockType": "blob",
  "data": {
    "title": "Notre mission",
    "subtitle": "Accompagner les entreprises",
    "theme": "brand",
    "responsive": {
      "base": {
        "layout": "stack",
        "marker": "top",
        "size": "md",
        "paddingX": "sm",
        "paddingY": "md",
        "figureWidth": "1/2"
      },
      "md": {
        "layout": "row",
        "marker": "left",
        "paddingX": "md"
      },
      "lg": {
        "layout": "bar",
        "size": "xl",
        "paddingX": "lg"
      }
    }
  },
  "innerBlocks": []
}
```

## Changements clés

### 1. Héritage mobile-first

Dans le nouveau format, les valeurs sont **héritées** des breakpoints plus petits :

```json
{
  "base": { "size": "md", "paddingY": "md" },
  "md": { "paddingX": "lg" },
  "lg": { "size": "xl" }
}
```

Au breakpoint `lg` :
- `size` = `"xl"` (défini à lg)
- `paddingX` = `"lg"` (hérité de md)
- `paddingY` = `"md"` (hérité de base)

### 2. Champs non-responsive

Les champs qui ne varient pas selon le breakpoint restent en dehors de `responsive` :

```json
{
  "title": "Notre mission",
  "subtitle": "Accompagner les entreprises",
  "theme": "brand",
  "responsive": { ... }
}
```

### 3. Normalisation markerPosition → marker

L'ancien champ `markerPosition` devient `marker` dans l'objet responsive :

**Avant :**
```json
{
  "markerPosition": "top md:left"
}
```

**Après :**
```json
{
  "responsive": {
    "base": { "marker": "top" },
    "md": { "marker": "left" }
  }
}
```

## Exemple avec Iterator

Les Iterators ont deux niveaux de responsive : global et per-item.

### Avant

```json
{
  "id": "iterator-1",
  "blockType": "blob-iterator",
  "data": {
    "iteratorLayout": "grid-3",
    "size": "sm md:md",
    "layout": "stack",
    "itemFields": ["title", "subtitle", "markerIcon"],
    "items": [
      {
        "id": "item-1",
        "blockType": "blob",
        "data": {
          "title": "Item 1",
          "markerIcon": "check"
        }
      }
    ]
  }
}
```

### Après

```json
{
  "id": "iterator-1",
  "blockType": "blob-iterator",
  "data": {
    "iteratorLayout": "grid-3",
    "itemFields": ["title", "subtitle", "markerIcon"],
    "responsive": {
      "base": {
        "size": "sm",
        "layout": "stack"
      },
      "md": {
        "size": "md"
      }
    },
    "items": [
      {
        "id": "item-1",
        "blockType": "blob",
        "data": {
          "title": "Item 1",
          "markerIcon": "check"
        }
      }
    ]
  }
}
```

## Récursivité avec innerBlocks

Le script migre **récursivement** tous les innerBlocks.

### Avant

```json
{
  "id": "parent",
  "blockType": "blob",
  "data": {
    "layout": "stack md:row"
  },
  "innerBlocks": [
    {
      "id": "child",
      "blockType": "blob",
      "data": {
        "layout": "bar",
        "marker": "left md:top"
      },
      "innerBlocks": []
    }
  ]
}
```

### Après

```json
{
  "id": "parent",
  "blockType": "blob",
  "data": {
    "responsive": {
      "base": { "layout": "stack" },
      "md": { "layout": "row" }
    }
  },
  "innerBlocks": [
    {
      "id": "child",
      "blockType": "blob",
      "data": {
        "responsive": {
          "base": { "layout": "bar", "marker": "left" },
          "md": { "marker": "top" }
        }
      },
      "innerBlocks": []
    }
  ]
}
```

Tous les blocs à tous les niveaux de profondeur sont migrés.

## Cas particuliers

### Valeur simple (non-responsive)

**Avant :**
```json
{ "layout": "stack" }
```

**Après :**
```json
{
  "responsive": {
    "base": { "layout": "stack" }
  }
}
```

### Déjà au bon format

Si un bloc a déjà un objet `responsive`, il est **ignoré** :

```json
{
  "responsive": {
    "base": { "layout": "stack" }
  }
}
```

→ Aucune modification

### Champs vides ou null

Les valeurs vides/null sont ignorées :

**Avant :**
```json
{
  "layout": "stack",
  "marker": "",
  "size": null
}
```

**Après :**
```json
{
  "responsive": {
    "base": { "layout": "stack" }
  }
}
```

Seul `layout` est migré.
