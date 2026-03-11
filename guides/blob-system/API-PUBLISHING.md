# Guide IA : Publier et Modifier des Pages

Ce guide explique comment une IA doit **publier** et **modifier** des pages via l'API HTTP.

**Important :** Les pages sont stockées dans **Redis (Vercel KV)**, pas dans le système de fichiers. Ne jamais créer de fichiers `.json` dans `/data/app/`.

---

## 🚀 Publier une Nouvelle Page

### Étape 1 : Générer le JSON de la Page

Créer un objet JSON conforme au format de **PAGE-STRUCTURE.md** :

```json
{
  "version": "1.0",
  "slug": "about",
  "title": "À propos",
  "blocks": [
    {
      "id": "unique-uuid-v4",
      "blockType": "blob",
      "data": {
        "size": "9xl",
        "layout": "stack",
        "title": "...",
        ...
      },
      "innerBlocks": []
    }
  ],
  "meta": {
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Règles critiques :**
- ✅ Tous les champs sont des **strings** (`"true"` pas `true`)
- ✅ Arrays stringifiés : `"buttons": "[{...}]"`, `"items": "[{...}]"`
- ✅ IDs uniques : UUID v4 pour chaque bloc
- ✅ `innerBlocks` = `[]` si vide (jamais `undefined`)
- ✅ `meta.createdAt` et `meta.updatedAt` en ISO 8601

### Étape 2 : Créer un Script Node.js

Créer un fichier `scripts/create-PAGE_SLUG.mjs` :

```javascript
const pageData = {
  version: "1.0",
  slug: "about",
  title: "À propos",
  blocks: [
    // ... blocs générés
  ],
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const response = await fetch('http://localhost:3000/api/pages/about', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pageData)
});

if (response.ok) {
  const result = await response.json();
  console.log('✅ Page publiée avec succès:', result);
  console.log('🔗 Voir la page: http://localhost:3000/about');
} else {
  const error = await response.text();
  console.error('❌ Erreur:', error);
}
```

### Étape 3 : Exécuter le Script

```bash
node scripts/create-about.mjs
```

**Résultat attendu :**
```
✅ Page publiée avec succès: { success: true, slug: 'about' }
🔗 Voir la page: http://localhost:3000/about
```

---

## 🔄 Modifier une Page Existante

### Méthode 1 : Remplacement Complet (Recommandé)

**Cas d'usage :** Modifier toute la page (structure + contenu)

```javascript
// 1. Lire la page existante (optionnel, pour référence)
const existing = await fetch('http://localhost:3000/api/pages/about');
const currentPage = await existing.json();

// 2. Créer la nouvelle version
const updatedPage = {
  version: "1.0",
  slug: "about",
  title: "À propos - Nouvelle Version",
  blocks: [
    // ... nouveaux blocs
  ],
  meta: {
    createdAt: currentPage.meta.createdAt, // ← Garder la date de création
    updatedAt: new Date().toISOString()    // ← Mettre à jour
  }
};

// 3. Publier (PUT écrase la page existante)
const response = await fetch('http://localhost:3000/api/pages/about', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedPage)
});
```

### Méthode 2 : Modification Partielle

**Cas d'usage :** Modifier seulement une section (bloc) de la page

```javascript
// 1. Lire la page existante
const response = await fetch('http://localhost:3000/api/pages/about');
const page = await response.json();

// 2. Modifier un bloc spécifique
page.blocks[2].data.title = "Nouveau titre pour la 3e section";
page.blocks[2].data.subtitle = "Nouvelle description";

// 3. Mettre à jour la date
page.meta.updatedAt = new Date().toISOString();

// 4. Publier la version modifiée
await fetch('http://localhost:3000/api/pages/about', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(page)
});
```

### Méthode 3 : Ajouter une Section

**Cas d'usage :** Ajouter un nouveau bloc à la fin de la page

```javascript
// 1. Lire la page existante
const response = await fetch('http://localhost:3000/api/pages/about');
const page = await response.json();

// 2. Ajouter un nouveau bloc
const newBlock = {
  id: crypto.randomUUID(), // ← Générer un UUID unique
  blockType: "blob",
  data: {
    size: "4xl",
    layout: "stack",
    align: "center",
    title: "Nouvelle section",
    appearance: "darkBackground"
  },
  innerBlocks: []
};

page.blocks.push(newBlock);

// 3. Mettre à jour la date
page.meta.updatedAt = new Date().toISOString();

// 4. Publier
await fetch('http://localhost:3000/api/pages/about', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(page)
});
```

---

## 📖 Lire une Page Existante

```javascript
const response = await fetch('http://localhost:3000/api/pages/about');

if (response.ok) {
  const page = await response.json();
  console.log('Page:', page.title);
  console.log('Nombre de blocs:', page.blocks.length);
  console.log('Dernière mise à jour:', page.meta.updatedAt);
} else {
  console.error('Page non trouvée');
}
```

---

## 🗑️ Supprimer une Page

```javascript
const response = await fetch('http://localhost:3000/api/pages/about', {
  method: 'DELETE'
});

if (response.ok) {
  console.log('✅ Page supprimée');
} else {
  console.error('❌ Erreur de suppression');
}
```

---

## 📋 Lister Toutes les Pages

**API non disponible pour le moment.** Utiliser la route API directement si besoin :

```javascript
// NOTE: Cette route peut ne pas exister, vérifier d'abord
const response = await fetch('http://localhost:3000/api/pages');
const pages = await response.json();
console.log('Pages disponibles:', pages);
```

**Alternative :** Connaître les slugs existants :
- `hello` (page de référence)
- `demo` (page de démonstration)
- `about` (si créée)
- etc.

---

## 🎯 Workflow Complet pour l'IA

### Créer une Nouvelle Page

1. **Lire les guides** (@guides/blob-system/DESIGN-PHILOSOPHY.md, PATTERNS.md, PAGE-STRUCTURE.md)
2. **Générer le JSON** conforme au format attendu
3. **Créer le script** `scripts/create-SLUG.mjs` avec fetch API
4. **Exécuter** le script avec `node scripts/create-SLUG.mjs`
5. **Vérifier** le résultat (✅ succès ou ❌ erreur)
6. **Tester** la page sur `http://localhost:3000/SLUG`

### Modifier une Page Existante

1. **Lire la page** via `GET /api/pages/SLUG`
2. **Identifier le bloc à modifier** (par index ou par id)
3. **Modifier** le JSON (titre, subtitle, data, etc.)
4. **Publier** via `PUT /api/pages/SLUG`
5. **Vérifier** le résultat
6. **Tester** la page modifiée

---

## ⚙️ API Routes Disponibles

### GET /api/pages/:slug

**Description :** Lire une page

**Réponse (200) :**
```json
{
  "version": "1.0",
  "slug": "about",
  "title": "À propos",
  "blocks": [...],
  "meta": { "createdAt": "...", "updatedAt": "..." }
}
```

**Réponse (404) :**
```json
{ "error": "Page not found" }
```

---

### PUT /api/pages/:slug

**Description :** Créer ou mettre à jour une page

**Body :**
```json
{
  "version": "1.0",
  "slug": "about",
  "title": "À propos",
  "blocks": [...],
  "meta": { "createdAt": "...", "updatedAt": "..." }
}
```

**Comportement :**
- Si la page existe : **merge** avec l'existant (updatedAt mis à jour)
- Si la page n'existe pas : **création** nouvelle

**Réponse (200) :**
```json
{ "success": true, "slug": "about" }
```

**Réponse (400) :**
```json
{ "error": "Validation error: ..." }
```

---

### DELETE /api/pages/:slug

**Description :** Supprimer une page

**Réponse (200) :**
```json
{ "success": true }
```

**Réponse (404) :**
```json
{ "error": "Page not found" }
```

---

## 🚨 Erreurs Courantes

### Erreur : "Validation error"

**Cause :** Le JSON ne respecte pas le schéma Zod

**Solution :**
- Vérifier que tous les champs sont des **strings**
- Vérifier que `innerBlocks` existe (jamais `undefined`)
- Vérifier que les UUIDs sont valides (UUID v4)

### Erreur : "Connection refused"

**Cause :** Le serveur dev n'est pas démarré

**Solution :**
```bash
pnpm dev
# Attendre que le serveur soit prêt sur http://localhost:3000
```

### Erreur : "Page not found" (lors d'une modification)

**Cause :** La page n'existe pas encore

**Solution :** Utiliser `PUT` pour créer la page d'abord

---

## 💡 Bonnes Pratiques

### 1. Toujours Générer des UUIDs Uniques

```javascript
import { randomUUID } from 'crypto';

const blockId = randomUUID(); // ← Correct
const blockId = "bloc-1";     // ← Incorrect (pas unique)
```

### 2. Toujours Mettre à Jour `updatedAt`

```javascript
page.meta.updatedAt = new Date().toISOString(); // ← Toujours faire ça
```

### 3. Valider le JSON Avant de Publier

```javascript
// Vérifier que tous les blocs ont un id
page.blocks.forEach(block => {
  if (!block.id) throw new Error('Block missing id');
  if (!block.data) throw new Error('Block missing data');
});
```

### 4. Garder `createdAt` lors des Modifications

```javascript
// ✅ Bon
const updatedPage = {
  ...page,
  meta: {
    createdAt: page.meta.createdAt,  // ← Garder l'original
    updatedAt: new Date().toISOString()
  }
};

// ❌ Mauvais
const updatedPage = {
  ...page,
  meta: {
    createdAt: new Date().toISOString(),  // ← Écrase la date de création
    updatedAt: new Date().toISOString()
  }
};
```

### 5. Tester Localement Avant de Publier

```javascript
// Afficher le JSON avant de publier
console.log('JSON à publier:', JSON.stringify(pageData, null, 2));

// Publier
const response = await fetch(...);
```

---

## 📝 Template de Script Complet

```javascript
/**
 * Script de publication de page
 * Usage: node scripts/create-about.mjs
 */

import { randomUUID } from 'crypto';

// ========================================
// GÉNÉRATION DE LA PAGE
// ========================================

const pageData = {
  version: "1.0",
  slug: "about",
  title: "À propos",
  blocks: [
    {
      id: randomUUID(),
      blockType: "blob",
      data: {
        size: "9xl",
        layout: "stack",
        align: "center",
        paddingX: "container-xl",
        paddingY: "10xl",
        headerPaddingX: "container-sm",
        title: "Notre mission",
        subtitle: "Description de la mission...",
        appearance: "borderBottom"
      },
      innerBlocks: []
    },
    // ... autres blocs
  ],
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// ========================================
// PUBLICATION VIA API
// ========================================

console.log('📤 Publication de la page:', pageData.slug);

try {
  const response = await fetch(`http://localhost:3000/api/pages/${pageData.slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pageData)
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ Page publiée avec succès:', result);
    console.log(`🔗 Voir la page: http://localhost:3000/${pageData.slug}`);
  } else {
    const error = await response.text();
    console.error('❌ Erreur lors de la publication:', error);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Erreur de connexion:', err.message);
  console.log('💡 Vérifiez que le serveur dev est démarré (pnpm dev)');
  process.exit(1);
}
```

---

## 🎯 Checklist pour l'IA

Avant de publier une page, vérifier :

- [ ] Le JSON est conforme à **PAGE-STRUCTURE.md**
- [ ] Tous les champs sont des **strings**
- [ ] Tous les blocs ont un **UUID v4 unique**
- [ ] `innerBlocks` existe (jamais `undefined`)
- [ ] `meta.createdAt` et `meta.updatedAt` sont en **ISO 8601**
- [ ] Le script utilise **fetch API** (pas ioredis directement)
- [ ] Le serveur dev est **démarré** (`pnpm dev`)
- [ ] La page suit les **principes wireframe** (DESIGN-PHILOSOPHY.md)
- [ ] Les patterns utilisés viennent de **PATTERNS.md**

---

**Version :** 1.0
**Dernière mise à jour :** 2025-01-15
