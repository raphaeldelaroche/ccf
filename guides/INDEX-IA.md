# Guide Index pour l'IA

**Bienvenue !** Tu es sur **Blob UI**, un système de composants wireframe pour générer des pages web via JSON.

## 🎯 Informations Clés

**Système :**
- **Composant unique** : Blob (61 champs, 3 layouts, 14 sizes)
- **Stockage** : Redis (Vercel KV) via API HTTP (pas de système de fichiers)
- **Focus** : Wireframes structurels (hiérarchie + espacement, pas de décoration)

**Technologies :**
- Next.js 14 (App Router)
- TypeScript
- Redis (Vercel KV)
- API HTTP : GET/PUT/DELETE sur `/api/pages/:slug`

---

## 📍 Navigation par Tâche

### 🚀 Tu veux créer une page ?

**Workflow rapide :**
1. **Démarrage rapide** → [@guides/blob-system/QUICK-START.md](blob-system/QUICK-START.md)
2. **Copier un pattern** → [@guides/blob-system/PATTERNS.md](blob-system/PATTERNS.md)
3. **Lire le contexte projet** → [@guides/project/BRIEF.md](project/BRIEF.md) (mission, valeurs)
4. **Stratégie de page** → [@guides/project/HOME-PRIORITY-GUIDE.md](project/HOME-PRIORITY-GUIDE.md) (si homepage) ou [@guides/project/TARGET.md](project/TARGET.md) (audiences)
5. **Publier via API** → [@guides/blob-system/API-PUBLISHING.md](blob-system/API-PUBLISHING.md)

**Résultat attendu :**
- Script `scripts/create-[slug].mjs` créé
- Exécution du script : `node scripts/create-[slug].mjs`
- Page publiée sur `http://localhost:3000/[slug]`
- Message de confirmation avec URL

---

### 🔄 Tu veux modifier une page existante ?

**Workflow :**
1. **Lire la page** → `GET http://localhost:3000/api/pages/[slug]`
2. **Identifier le bloc à modifier** (par index ou id)
3. **Consulter les patterns si besoin** → [@guides/blob-system/PATTERNS.md](blob-system/PATTERNS.md)
4. **Modifier et publier** → [@guides/blob-system/API-PUBLISHING.md](blob-system/API-PUBLISHING.md) (section "Modifier une Page")

---

### 📖 Tu as besoin de référence technique ?

**Guides de référence :**
- **Tous les champs (61 fields)** → [@guides/blob-system/FIELD-REFERENCE.md](blob-system/FIELD-REFERENCE.md)
- **Format JSON attendu** → [@guides/blob-system/PAGE-STRUCTURE.md](blob-system/PAGE-STRUCTURE.md)
- **Design wireframe (hiérarchie, rythme, structure)** → [@guides/blob-system/DESIGN-PHILOSOPHY.md](blob-system/DESIGN-PHILOSOPHY.md)

---

### 🎨 Tu manques d'informations sur le projet ?

**Contexte CCF (Climate Contribution Framework) :**
- **Contexte général** → [@guides/project/BRIEF.md](project/BRIEF.md) - Mission, 3 piliers, positionnement
- **Audiences cibles** → [@guides/project/TARGET.md](project/TARGET.md) - 5 personas avec questions réelles
- **Stratégie homepage** → [@guides/project/HOME-PRIORITY-GUIDE.md](project/HOME-PRIORITY-GUIDE.md) - 6 sections avec priorités
- **Checklist validation** → [@guides/project/QUESTIONS.md](project/QUESTIONS.md) - Questions ouvertes client

---

### 🤔 Tu ne sais pas quoi faire ?

**Si l'utilisateur demande quelque chose d'ambigu :**
1. **Lire** [@guides/workflows/AI-GENERATION-WORKFLOW.md](workflows/AI-GENERATION-WORKFLOW.md) pour comprendre les workflows conversationnels
2. **Demander des clarifications** à l'utilisateur (ne jamais inventer du contenu)
3. **Proposer des options** basées sur les guides projet

---

## ⚠️ Règles Importantes

### Si tu manques d'informations :
- ❌ **N'invente JAMAIS** du contenu (textes, noms, données)
- ✅ **Demande à l'utilisateur** les infos manquantes
- ✅ **Propose des options** basées sur les guides projet (BRIEF, TARGET, HOME-PRIORITY-GUIDE)

### Workflow standard de création :
1. Lire **QUICK-START.md** (3-5 min de lecture)
2. Consulter **PATTERNS.md** (copier un pattern réel)
3. Adapter avec le **contexte projet** (BRIEF, TARGET, etc.)
4. Publier via **API-PUBLISHING.md**
5. **Vérifier** le résultat sur `http://localhost:3000/[slug]`

### Validation avant publication :
- [ ] Tous les champs sont des **strings** (`"true"` pas `true`)
- [ ] Arrays stringifiés : `"buttons": "[{...}]"`, `"items": "[{...}]"`, `"itemFields": "[\"title\",\"subtitle\"]"` → **les 3 sont obligatoires en string JSON**
- [ ] UUID v4 unique par bloc
- [ ] `innerBlocks = []` si vide (jamais `undefined`)
- [ ] `meta.createdAt` et `meta.updatedAt` en ISO 8601
- [ ] Progression de size cohérente (3-4 sizes max)
- [ ] Rythme de paddingY cohérent
- [ ] Appearances minimalistes (borderBottom 80%)

> ⚠️ **Piège Iterator** : `items` et `itemFields` sont des **strings JSON**, exactement comme `buttons`. Ne jamais passer un vrai array JavaScript — toujours `JSON.stringify([...])`.

## 📚 Tous les Guides Disponibles

### Système Blob (Générique - Réutilisable)

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **QUICK-START.md** | Démarrage rapide (5 min) | Premier fichier à lire |
| **DESIGN-PHILOSOPHY.md** | Principes wireframe : hiérarchie, rythme, structure | Comprendre le "pourquoi" |
| **FIELD-REFERENCE.md** | Référence complète des 61 champs | Lookup d'un champ spécifique |
| **PATTERNS.md** | 6 patterns réels (hero, logos, section majeure, etc.) | Copier un pattern existant |
| **PAGE-STRUCTURE.md** | Format JSON attendu + règles de sérialisation | Valider le JSON avant publication |
| **API-PUBLISHING.md** | Publier/modifier via API HTTP (GET/PUT/DELETE) | Publication finale |

### Workflows AI

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **AI-GENERATION-WORKFLOW.md** | Workflow conversationnel détaillé avec exemples | Comprendre les différents types de prompts |

### Projet CCF (Spécifique - À Remplacer par Projet)

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **BRIEF.md** | Contexte Climate Contribution Framework : mission, 3 piliers, positionnement | Comprendre le projet et sa valeur |
| **TARGET.md** | 5 personas + questions réelles par niveau de connaissance | Comprendre les audiences et adapter le ton |
| **HOME-PRIORITY-GUIDE.md** | Structure homepage (6 sections) + stratégie de contenu | Créer ou modifier la homepage |
| **QUESTIONS.md** | Checklist de validation client (8 catégories) | Identifier les ambiguïtés avant de générer |

---

## 🔄 Changer de Projet

**Pour travailler sur un nouveau projet :**
1. Supprimer le dossier `/guides/project/`
2. Créer un nouveau `/guides/project/` avec :
   - `BRIEF.md` (contexte du nouveau projet)
   - `TARGET.md` (audiences du nouveau projet)
   - `[PAGE]-PRIORITY-GUIDE.md` (stratégie de contenu)
   - `QUESTIONS.md` (checklist validation)
3. Les dossiers `/guides/blob-system/` et `/guides/workflows/` restent **identiques**

---

## 🎯 Exemples d'Utilisation

### Exemple 1 : Créer une page "À propos"

**Prompt utilisateur :**
```
"Crée la page À propos"
+ Attacher @guides/INDEX-IA.md
```

**Workflow IA :**
1. Lire INDEX-IA.md → Section "Tu veux créer une page ?"
2. Lire QUICK-START.md (principes + patterns)
3. Lire PATTERNS.md (pattern hero + section majeure + CTA)
4. Lire BRIEF.md (contexte CCF : mission, 3 piliers)
5. Lire TARGET.md (ton et audience)
6. Générer JSON complet
7. Créer script `scripts/create-about.mjs`
8. Exécuter script : `node scripts/create-about.mjs`
9. Retourner URL : `http://localhost:3000/about`

---

### Exemple 2 : Modifier le titre du hero de la homepage

**Prompt utilisateur :**
```
"Change le titre du hero de la homepage en '[nouveau titre]'"
+ Attacher @guides/INDEX-IA.md
```

**Workflow IA :**
1. Lire INDEX-IA.md → Section "Tu veux modifier une page ?"
2. Lire API-PUBLISHING.md (section "Modifier une Page")
3. Fetcher la page : `GET http://localhost:3000/api/pages/home`
4. Modifier `page.blocks[0].data.title = "[nouveau titre]"`
5. Mettre à jour `page.meta.updatedAt`
6. Publier : `PUT http://localhost:3000/api/pages/home`
7. Confirmer le succès

---

### Exemple 3 : Créer une page personnalisée sans guide projet

**Prompt utilisateur :**
```
"Crée une page 'Services' pour une agence web avec 3 services : Design, Dev, SEO"
+ Attacher @guides/INDEX-IA.md
```

**Workflow IA :**
1. Lire INDEX-IA.md
2. Lire QUICK-START.md
3. Lire PATTERNS.md (pattern Method avec marker left)
4. **Pas de guide projet** → Demander à l'utilisateur :
   - "Quel ton souhaitez-vous ? (professionnel, créatif, technique)"
   - "Quelles informations inclure par service ? (description, prix, durée ?)"
5. Générer JSON avec les infos fournies
6. Publier

---

## 📊 Arborescence Visuelle

```
/guides/
├── INDEX-IA.md                          ← TU ES ICI (point d'entrée unique)
│
├── /blob-system/                        ← GUIDES GÉNÉRIQUES (réutilisables)
│   ├── QUICK-START.md                  ← Démarrage rapide (lire en premier)
│   ├── DESIGN-PHILOSOPHY.md            ← Principes wireframe complets
│   ├── FIELD-REFERENCE.md              ← 61 champs documentés
│   ├── PATTERNS.md                     ← 6 patterns réels avec JSON
│   ├── PAGE-STRUCTURE.md               ← Format JSON + validation
│   └── API-PUBLISHING.md               ← Publier/modifier via API
│
├── /workflows/                          ← WORKFLOWS AI
│   └── AI-GENERATION-WORKFLOW.md       ← Workflows conversationnels
│
└── /project/                            ← GUIDES PROJET CCF (remplaçables)
    ├── BRIEF.md                        ← Contexte CCF
    ├── TARGET.md                       ← 5 personas
    ├── HOME-PRIORITY-GUIDE.md          ← Stratégie homepage
    └── QUESTIONS.md                    ← Checklist validation
```

---

## 🚦 Statut des Guides

| Guide | Version | Dernière mise à jour | Statut |
|-------|---------|---------------------|--------|
| INDEX-IA.md | 1.0 | 2025-01-15 | ✅ Actif |
| QUICK-START.md | 1.0 | 2025-01-15 | ✅ Actif |
| DESIGN-PHILOSOPHY.md | 2.0 | 2025-01-15 | ✅ Actif (Wireframe focus) |
| FIELD-REFERENCE.md | 1.0 | 2024-01-15 | ✅ Actif |
| PATTERNS.md | 2.0 | 2025-01-15 | ✅ Actif (Patterns réels) |
| PAGE-STRUCTURE.md | 1.0 | 2024-01-15 | ✅ Actif |
| API-PUBLISHING.md | 1.0 | 2025-01-15 | ✅ Actif |
| AI-GENERATION-WORKFLOW.md | 1.0 | 2024-01-15 | ✅ Actif |
| BRIEF.md | 1.0 | 2024-01-15 | ✅ Actif (CCF) |
| TARGET.md | 1.0 | 2024-01-15 | ✅ Actif (CCF) |
| HOME-PRIORITY-GUIDE.md | 1.0 | 2024-01-15 | ✅ Actif (CCF) |
| QUESTIONS.md | 1.0 | 2024-01-15 | ✅ Actif (CCF) |

---

**Version :** 1.0
**Dernière mise à jour :** 2025-01-15
**Auteur :** Raphaël Delaroche
