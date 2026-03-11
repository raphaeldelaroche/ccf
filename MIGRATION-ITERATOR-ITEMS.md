# Migration des items d'iterator : Format Legacy → BlockNode

## Contexte

Depuis la version 2.0 du système BlobUI, les **items des BlobIterator** doivent être des objets `BlockNode` complets au lieu de simples objets plats (`Record<string, FormDataValue>`).

Cette migration permet de supporter les **blocs imbriqués** (`innerBlocks`) dans les items d'iterator, offrant ainsi une profondeur d'imbrication infinie.

---

## Format Legacy (ancien)

```json
{
  "id": "iterator-1",
  "blockType": "blobIterator",
  "data": {
    "iteratorLayout": "grid-3",
    "items": [
      {
        "title": "Item 1",
        "image": "/image1.jpg",
        "buttons": "[{\"label\":\"En savoir plus\"}]"
      },
      {
        "title": "Item 2",
        "image": "/image2.jpg"
      }
    ]
  },
  "innerBlocks": []
}
```

### Problèmes du format legacy
- ❌ Les items sont des objets plats sans `id`, `blockType`, `data`, `innerBlocks`
- ❌ Impossible d'ajouter des blocs imbriqués dans les items
- ❌ Pas de métadonnées sur les items

---

## Nouveau Format (BlockNode)

```json
{
  "id": "iterator-1",
  "blockType": "blobIterator",
  "data": {
    "iteratorLayout": "grid-3",
    "items": [
      {
        "id": "iterator-1-item-1234567890-abc123",
        "blockType": "blob",
        "data": {
          "title": "Item 1",
          "image": "/image1.jpg",
          "buttons": "[{\"label\":\"En savoir plus\"}]",
          "showContent": true,
          "contentType": "innerBlocks"
        },
        "innerBlocks": [
          {
            "id": "block-1234567890-xyz789",
            "blockType": "blob",
            "data": {
              "title": "Bloc imbriqué dans l'item",
              "layout": "stack"
            },
            "innerBlocks": []
          }
        ]
      },
      {
        "id": "iterator-1-item-1234567891-def456",
        "blockType": "blob",
        "data": {
          "title": "Item 2",
          "image": "/image2.jpg"
        },
        "innerBlocks": []
      }
    ]
  },
  "innerBlocks": []
}
```

### Avantages du nouveau format
- ✅ Chaque item a un `id` unique et stable
- ✅ Support des `innerBlocks` dans les items
- ✅ Structure cohérente avec les autres blocs
- ✅ Profondeur d'imbrication infinie

---

## Migration Manuelle

### Transformation d'un item legacy

**Avant :**
```json
{
  "title": "Mon item",
  "image": "/image.jpg",
  "subtitle": "Description"
}
```

**Après :**
```json
{
  "id": "iterator-XXX-item-TIMESTAMP-RANDOM",
  "blockType": "blob",
  "data": {
    "title": "Mon item",
    "image": "/image.jpg",
    "subtitle": "Description"
  },
  "innerBlocks": []
}
```

### Étapes de transformation

1. **Créer un ID unique** pour chaque item
   - Format recommandé : `${iteratorId}-item-${timestamp}-${random}`
   - Exemple : `iterator-1-item-1710245123456-abc123`

2. **Envelopper les données** dans la structure BlockNode
   ```javascript
   const newItem = {
     id: generateUniqueId(),
     blockType: "blob",
     data: { ...ancienItem },  // Toutes les propriétés de l'ancien item
     innerBlocks: []
   }
   ```

3. **Remplacer le tableau items** dans le BlobIterator
   ```javascript
   iteratorBlock.data.items = items.map(transformLegacyItem)
   ```

---

## Migration Automatique

### Script de migration fourni

Un script de migration automatique est disponible : `scripts/migrate-iterator-items.mjs`

#### Usage

```bash
# Test en mode dry-run (simulation sans modification)
node scripts/migrate-iterator-items.mjs --dry-run --port=3000

# Migration réelle
node scripts/migrate-iterator-items.mjs --port=3000
```

#### Paramètres

- `--dry-run` : Simule la migration sans modifier les données (recommandé en premier)
- `--port=XXXX` : Port du serveur de développement (par défaut : 3001)

#### Exemple de sortie

```
🔄 Migration des items d'iterator vers BlockNode

🌐 Serveur API: http://localhost:3000

⚠️  Mode DRY-RUN activé : aucune modification ne sera appliquée

📦 Récupération des pages...
   Trouvé 3 page(s)

📄 Page: home
   ✓ 5 item(s) migré(s)

📄 Page: about
   Aucun item legacy trouvé

📄 Page: methodology
   ✓ 12 item(s) migré(s)

📊 Résumé (DRY-RUN):
   2 page(s) à migrer
   17 item(s) à convertir

💡 Relancez sans --dry-run pour appliquer les changements
```

### Fonctionnement du script

Le script :
1. Récupère toutes les pages via l'API `/api/pages`
2. Parcourt chaque page et détecte les items legacy (objets sans `blockType` et `id`)
3. Transforme les items legacy en BlockNode complets
4. Sauvegarde les pages modifiées via l'API

---

## Détection d'un item legacy

### En JavaScript/TypeScript

```typescript
function isLegacyItem(item: unknown): boolean {
  return !(
    typeof item === "object" &&
    item !== null &&
    "blockType" in item &&
    "id" in item
  )
}
```

### Exemples

```javascript
isLegacyItem({ title: "Item" })                          // true (legacy)
isLegacyItem({ id: "...", blockType: "blob", data: {} }) // false (nouveau format)
```

---

## Génération d'ID unique

### Méthode recommandée

```javascript
function generateItemId(iteratorId) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 9)
  return `${iteratorId}-item-${timestamp}-${random}`
}
```

### Exemple

```javascript
generateItemId("iterator-abc123")
// → "iterator-abc123-item-1710245123456-xyz789"
```

---

## Vérification post-migration

### 1. Vérifier la structure des items

```javascript
// ✅ Bon format
{
  "id": "iterator-1-item-...",
  "blockType": "blob",
  "data": { /* ... */ },
  "innerBlocks": []
}

// ❌ Ancien format (à migrer)
{
  "title": "...",
  "image": "..."
}
```

### 2. Tester dans l'éditeur

1. Ouvrir l'éditeur `/new-editor`
2. Sélectionner un BlobIterator
3. Dans l'Inspector, aller dans "Items"
4. Vérifier que chaque item a un ID visible
5. Tester l'ajout de blocs imbriqués dans un item

### 3. Vérifier le rendu public

1. Ouvrir une page publique contenant un BlobIterator
2. Vérifier que les items s'affichent correctement
3. Si des blocs imbriqués ont été ajoutés, vérifier qu'ils apparaissent

---

## Cas particuliers

### Items avec des innerBlocks existants

Si un item legacy avait déjà un champ `innerBlocks` (rare), il sera préservé :

```javascript
// Legacy avec innerBlocks (cas rare)
{
  "title": "Item",
  "innerBlocks": [{ /* ancien bloc */ }]
}

// Devient
{
  "id": "...",
  "blockType": "blob",
  "data": { "title": "Item" },
  "innerBlocks": [{ /* bloc préservé et possiblement migré */ }]
}
```

### Migration récursive

Le script de migration traite **récursivement** tous les blocs et items, y compris les blocs imbriqués dans les items.

---

## Breaking Changes

### ⚠️ Attention

- Les items au format legacy ne sont **plus supportés** depuis la version 2.0
- Le schéma Zod (`lib/schemas/block.ts`) rejette les items non-BlockNode
- Les mappers (`blob-iterator-mapper.ts`) s'attendent à recevoir des BlockNode

### Rétrocompatibilité

Une **migration à la volée** est implémentée dans `IteratorInspector.tsx` (lignes 50-62) pour convertir automatiquement les items legacy lors de l'édition dans l'éditeur.

Cependant, il est **fortement recommandé** de migrer toutes les pages existantes avec le script pour éviter toute perte de données.

---

## Support

### En cas de problème

1. Vérifier que le serveur de développement est démarré (`pnpm dev`)
2. Tester d'abord en mode `--dry-run`
3. Faire une **sauvegarde** de la base de données avant migration réelle
4. Consulter les logs du script pour identifier les erreurs

### Contacts

- Documentation : `/README.md`
- Issues : Créer une issue sur le repo du projet
- Code source du script : `scripts/migrate-iterator-items.mjs`

---

## Changelog

- **v2.0** (Mars 2024) : Introduction du format BlockNode pour les items d'iterator
- **v1.x** : Format legacy (objets plats)
