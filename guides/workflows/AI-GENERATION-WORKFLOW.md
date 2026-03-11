# Workflow de Génération de Pages avec Claude Code

Ce guide explique comment utiliser **Claude Code** (l'outil que vous utilisez actuellement) pour générer des pages Blob via des prompts conversationnels, **sans nécessiter de clé API**.

---

## 🎯 Concept

Au lieu de coder une intégration API complexe, on utilise la **documentation Blob optimisée pour l'IA** pour permettre à Claude Code de générer directement des fichiers JSON de pages.

**Avantages :**
- ✅ Gratuit (utilise votre abonnement Claude Pro)
- ✅ Conversationnel et flexible
- ✅ Contrôle total sur le résultat
- ✅ Apprentissage progressif du système

---

## 📚 Documentation Disponible

Avant de générer une page, Claude Code peut lire ces 4 guides :

1. **[AI-BLOB-GUIDE.md](./AI-BLOB-GUIDE.md)** - Guide conceptuel
   - Philosophie du système Blob
   - Les 3 layouts (stack/row/bar)
   - Hiérarchie de contenu
   - Système de tokens
   - Patterns courants
   - Règles de compatibilité

2. **[BLOB-EXAMPLES.md](./BLOB-EXAMPLES.md)** - Bibliothèque de patterns
   - 12 exemples annotés (Hero, Features, CTA, Testimonials, etc.)
   - Décisions de design expliquées
   - Variantes possibles

3. **[BLOB-FIELD-REFERENCE.md](./BLOB-FIELD-REFERENCE.md)** - Référence complète
   - 61 champs organisés par section
   - Fréquence d'utilisation (★★★ / ★★ / ★)
   - Compatibilité layout
   - Contraintes croisées

4. **[PAGE-STRUCTURE.md](./PAGE-STRUCTURE.md)** - Format JSON
   - Structure exacte attendue
   - Règles de sérialisation
   - Exemples complets
   - Templates vides

---

## 🚀 Workflow Type

### Scénario 1 : Page Simple (Prompt Direct)

**Vous écrivez dans Claude Code :**

```
Crée une page "about" avec :
- Hero section centré (titre + description + CTA)
- Section mission (texte + image côte à côte)
- Section team (4 cards avec photos)
- CTA final

Sauvegarde dans /data/app/about.json
```

**Claude Code :**
1. ✅ Lit les guides Blob (AI-BLOB-GUIDE, BLOB-EXAMPLES)
2. ✅ Identifie les patterns appropriés :
   - Hero → Pattern 1 (stack, centered, xl)
   - Mission → Pattern 5 (row, content+media)
   - Team → Pattern 4 (iterator grid-4)
   - CTA → Pattern 6 (stack, darkBackground)
3. ✅ Génère la structure JSON avec 4 blocs
4. ✅ Valide la compatibilité layout
5. ✅ Écrit `/data/app/about.json`
6. ✅ Répond : "✅ Page créée ! Ouvrez http://localhost:3000/new-editor?page=about"

**Vous :**
- Cliquez sur le lien
- Page s'ouvre dans l'éditeur
- Ajustez le contenu si nécessaire

---

### Scénario 2 : Page Complexe avec Brief (Contexte Riche)

**Vous écrivez dans Claude Code :**

```
D'après @guides/project/BRIEF.md, @guides/project/TARGET.md et @guides/project/HOME-PRIORITY-GUIDE.md,
génère la page d'accueil "Climate Contribution Framework".

Audience principale : Directeurs Développement Durable (grandes entreprises)

Structure rhétorique : Pathos → Ethos → Logos → Détail → Orientation → Conversion

6 sections prioritaires :
1. Hero (accroche émotionnelle - urgence climat)
2. Logos partenaires (crédibilité - ethos)
3. Explication framework (3 piliers - logos)
4. Bénéfices (détails chiffrés)
5. Section investisseurs (orientation)
6. CTA final (conversion)

Utilise @guides/blob-system/DESIGN-PHILOSOPHY.md et @guides/blob-system/PATTERNS.md comme référence.

Sauvegarde dans /data/app/climate-home.json
```

**Claude Code :**
1. ✅ Lit BRIEF.md (comprend le projet : mesure impact climat entreprises)
2. ✅ Lit TARGET.md (audience = sustainability directors, questions/objections)
3. ✅ Lit HOME-PRIORITY-GUIDE.md (structure Pathos→Ethos→Logos)
4. ✅ Lit AI-BLOB-GUIDE.md (patterns Blob, layouts)
5. ✅ Lit BLOB-EXAMPLES.md (exemples concrets)
6. ✅ Génère 6 blocs optimisés :
   - Hero : stack xl, centered, eyebrow "URGENCE CLIMAT", CTA fort
   - Logos : iterator grid-auto, minimal, 6+ logos
   - Framework : iterator grid-3, cards avec markers icons
   - Bénéfices : iterator grid-3, stats/numbers
   - Investisseurs : row lg, content+media
   - CTA : stack xl, darkBackground, theme brand
7. ✅ Sauvegarde `/data/app/climate-home.json`
8. ✅ Répond avec lien + résumé des choix de design

**Vous :**
- Chargez dans l'éditeur
- Raffinez le contenu textuel
- Ajustez les images/icônes

---

### Scénario 3 : Itération sur Page Existante

**Vous écrivez dans Claude Code :**

```
Modifie @data/app/about.json :
- Change la section mission en layout row avec l'image à droite (figureWidth 1/2)
- Ajoute une section témoignages (3 citations clients en iterator)
- Rends le hero plus visuel avec une image de fond
```

**Claude Code :**
1. ✅ Lit `/data/app/about.json` (comprend structure actuelle)
2. ✅ Trouve le bloc mission
3. ✅ Modifie :
   - `layout: "stack lg:row"`
   - `figureWidth: "lg:1-2"`
   - `direction: "lg:reverse"` (image à droite)
4. ✅ Insère nouveau bloc blobIterator (testimonials)
   - Pattern 7 (Testimonial) × 3
   - Iterator grid-3
5. ✅ Modifie hero :
   - `backgroundType: "image"`
   - `backgroundImage: "/hero-bg.jpg"`
6. ✅ Sauvegarde les modifications
7. ✅ Répond avec résumé des changements

**Vous :**
- Rechargez l'éditeur (auto-save détecte le changement)
- Vérifiez le rendu

---

## 📝 Exemples de Prompts Efficaces

### Prompt : Nouvelle Page

```
Crée une page "[nom]" pour [audience] avec :
- [Section 1] : [description]
- [Section 2] : [description]
- [Section 3] : [description]

Ton : [professionnel / décontracté / technique]
Couleur principale : [brand / blue / green / ...]

Utilise @guides/blob-system/DESIGN-PHILOSOPHY.md et @guides/blob-system/PATTERNS.md
Sauvegarde dans /data/app/[slug].json
```

### Prompt : Page avec Contexte Brief

```
D'après @guides/project/BRIEF.md et @guides/project/TARGET.md,
génère la page "[nom]" pour [persona spécifique].

Objectif : [conversion / information / crédibilité]
Structure : [Pathos→Ethos→Logos / autre]

Sections :
1. [...]
2. [...]

Référence : @guides/blob-system/PATTERNS.md
Sauvegarde dans /data/app/[slug].json
```

### Prompt : Modification

```
Modifie @data/app/[slug].json :
- [Instruction 1]
- [Instruction 2]
- [Instruction 3]
```

### Prompt : Ajout de Section

```
Ajoute une section [type] après le bloc [identifier] dans @data/app/[slug].json :
- [Description de la section]
- Layout : [stack / row / iterator]
- Contenu : [...]
```

---

## 🎨 Conseils pour de Meilleurs Résultats

### 1. Soyez Spécifique sur la Structure

**❌ Vague :**
```
Crée une page about
```

**✅ Précis :**
```
Crée une page "about" avec :
- Hero centré (titre + mission statement + 2 CTAs)
- Timeline (4 étapes historiques en iterator vertical)
- Team (6 membres en grid-3 avec photos + titres)
- Values (3 valeurs en cards avec icônes)
- CTA newsletter
```

---

### 2. Mentionnez le Contexte d'Usage

**❌ Sans contexte :**
```
Génère une page produit
```

**✅ Avec contexte :**
```
Génère une page produit SaaS B2B pour décideurs IT.
Objectif : conversion vers essai gratuit.
Tone : professionnel mais accessible.
Sections : Hero, Bénéfices (3), Démo vidéo, Pricing (3 plans), FAQ, CTA
```

---

### 3. Référencez les Guides

**❌ Sans guides :**
```
Fais quelque chose de beau
```

**✅ Avec guides :**
```
D'après @guides/blob-system/PATTERNS.md, utilise les patterns :
- Pattern 1 (Hero) pour la section d'accroche
- Pattern 4 (Feature Grid) pour les bénéfices
- Pattern 12 (Pricing) pour les offres

Référence : @guides/blob-system/DESIGN-PHILOSOPHY.md pour la compatibilité layout
```

---

### 4. Précisez le Ton et le Style

**❌ Neutre :**
```
Crée une landing page
```

**✅ Stylé :**
```
Crée une landing page avec :
- Ton : audacieux, startup tech
- Appearance : neoBrutalism pour les cards
- Couleur : brand (violet) avec accents cyan
- Hero : très visuel, image full-bleed
```

---

### 5. Itérez Progressivement

**❌ Tout d'un coup :**
```
Crée une page parfaite avec 20 sections
```

**✅ Progressive :**
```
Étape 1 : Crée la structure de base (Hero + 3 sections principales)
[Vous validez]

Étape 2 : Ajoute les détails (testimonials, FAQ, pricing)
[Vous validez]

Étape 3 : Raffine le contenu et les CTA
```

---

## 🔍 Validation Post-Génération

Après génération, vérifiez dans l'éditeur :

### Structure
- [ ] Hiérarchie logique des sections (pathos → ethos → logos → conversion)
- [ ] Flow visuel cohérent (alternance layouts, sizes)
- [ ] Pas de sections redondantes

### Contenu
- [ ] Titres clairs et concis
- [ ] CTAs avec verbes d'action
- [ ] Textes adaptés à l'audience

### Design
- [ ] Cohérence visuelle (theme, appearance)
- [ ] Layouts appropriés par section
- [ ] Responsive (stack mobile, row desktop)

### Technique
- [ ] Pas d'erreurs de compatibilité
- [ ] Images/icônes présentes
- [ ] Buttons fonctionnels

---

## 🛠️ Commandes Utiles

### Créer une Page Vide

```
Crée une page vide "[slug]" avec titre "[titre]"
Sauvegarde dans /data/app/[slug].json
```

### Dupliquer une Page

```
Duplique @data/app/source.json vers /data/app/nouvelle.json
Change le slug et le titre
```

### Lister les Pages Existantes

```
Liste toutes les pages dans /data/app/
```

### Analyser une Page

```
Analyse @data/app/[slug].json et décris :
- Structure (nombre de blocs, types)
- Layouts utilisés
- Patterns identifiés
- Points d'amélioration
```

---

## 🎓 Cas d'Usage Avancés

### Génération Multilingue

```
Crée 2 versions de la page "home" :
- /data/app/home-fr.json (français)
- /data/app/home-en.json (anglais)

Même structure, traduction du contenu
```

### A/B Testing

```
Crée 2 variantes de la page "pricing" :
- /data/app/pricing-a.json : Hero avec image produit
- /data/app/pricing-b.json : Hero avec testimonial

Même contenu, layouts différents
```

### Template Réutilisable

```
Crée un template "landing-page-saas" :
- Structure générique (Hero + Features + Pricing + FAQ + CTA)
- Placeholders pour le contenu
- Sauvegarde dans /data/app/template-landing-saas.json

Je pourrai le dupliquer et adapter le contenu
```

---

## ⚡ Raccourcis de Prompt

Pour gagner du temps, utilisez ces formulations courtes :

**"Page standard :"**
```
Page standard "contact" : Hero + Form + Map + CTA
```
→ Claude comprend la structure classique

**"D'après le brief :"**
```
D'après @guides/project/BRIEF.md, page "solution" pour persona "investor"
```
→ Claude adapte au contexte projet

**"Pattern X :"**
```
Pattern 4 (Feature Grid) avec 6 features, theme blue, icons lucide
```
→ Claude applique le pattern directement

**"Variante de :"**
```
Variante de @data/app/home.json : change hero en layout row, ajoute video
```
→ Claude part de l'existant

---

## 📊 Workflow Complet Exemple

### Projet : Site Climate Contribution Framework

#### Étape 1 : Préparation

```
Liste les fichiers dans @guides/
```

**Résultat :** BRIEF.md, TARGET.md, HOME-PRIORITY-GUIDE.md, QUESTIONS.md

---

#### Étape 2 : Page d'Accueil

```
D'après @guides/project/BRIEF.md, @guides/project/TARGET.md et @guides/project/HOME-PRIORITY-GUIDE.md,
génère la page d'accueil "climate-home" avec structure Pathos→Ethos→Logos :

1. Hero (Pathos) : Urgence climat, accroche émotionnelle
2. Logos (Ethos) : Partenaires institutionnels, crédibilité
3. Framework (Logos) : Explication 3 piliers en cards
4. Investisseurs : Bénéfices chiffrés
5. Méthodologie : Processus en étapes
6. CTA : Conversion vers démo

Audience : Directeurs RSE grandes entreprises
Ton : Professionnel, scientifique mais accessible
Couleur : brand (bleu institutionnel)

Référence : @guides/blob-system/DESIGN-PHILOSOPHY.md et @guides/blob-system/PATTERNS.md
Sauvegarde : /data/app/climate-home.json
```

---

#### Étape 3 : Validation

```
Ouvre http://localhost:3000/new-editor?page=climate-home
```

Vérification visuelle, ajustements textuels dans l'éditeur.

---

#### Étape 4 : Pages Secondaires

```
Crée la page "framework-detail" qui approfondit les 3 piliers :
- Hero : Rappel des 3 piliers
- Pilier 1 : Row avec schéma explicatif
- Pilier 2 : Row avec schéma (image inversée)
- Pilier 3 : Row avec schéma
- Méthodologie : Process en 5 étapes (iterator)
- Ressources : Téléchargements (cards)
- CTA : Contact expert

Référence : même brief
Sauvegarde : /data/app/framework-detail.json
```

---

#### Étape 5 : Page Contact

```
Page standard "contact" :
- Hero simple (titre + description)
- 2 colonnes : Formulaire (gauche) + Infos contact (droite)
- Map embed
- FAQ contact (4 questions)
- CTA retour home

Sauvegarde : /data/app/contact.json
```

---

#### Étape 6 : Optimisations

```
Optimise @data/app/climate-home.json :
- Ajoute emphasisText sur les titres clés
- Améliore les CTAs (labels plus action-oriented)
- Ajoute section témoignages avant CTA final
```

---

## 🎯 Résultat Final

Vous avez maintenant :
- ✅ 4 pages générées via IA
- ✅ Structure cohérente avec votre brief
- ✅ Design professionnel et responsive
- ✅ Contenu adapté à votre audience
- ✅ Prêt à raffiner manuellement dans l'éditeur

**Temps total :** ~30 minutes (vs plusieurs heures de code manuel)

---

## 💡 Astuces Pro

### Utiliser les @mentions

Claude Code comprend les références de fichiers :
- `@guides/project/BRIEF.md` → Lit automatiquement le brief
- `@data/app/home.json` → Lit la page existante
- `@components/blob/blob.tsx` → Comprend le composant (si besoin technique)

### Demander des Explications

```
Explique les choix de design pour @data/app/climate-home.json :
- Pourquoi ces layouts ?
- Pourquoi ces sizes ?
- Quelles alternatives possibles ?
```

### Apprendre Progressivement

```
Montre-moi 3 variantes du bloc hero de @data/app/home.json :
1. Layout row avec image 50/50
2. Layout stack avec video background
3. Layout bar compact
```

---

## 🚀 Pour Aller Plus Loin

### Créer Vos Propres Patterns

```
Ajoute à @guides/blob-system/PATTERNS.md un nouveau pattern "Product Feature Alternating" :
- Row layout avec alternance image gauche/droite
- 3 exemples (direction normal/reverse)
- Use case : storytelling produit
```

### Documenter Vos Conventions

```
Crée @guides/BRAND-GUIDELINES.md :
- Couleur principale : brand (bleu #2563eb)
- Couleurs secondaires : slate, cyan
- Appearances par section : minimal (hero), card (features), darkBackground (CTA)
- Sizes par type : xl (hero), lg (sections), md (cards)
```

### Automatiser les Variations

```
Génère 3 variantes de page pricing :
- /data/app/pricing-monthly.json (focus mensuel)
- /data/app/pricing-annual.json (focus annuel, badges "20% OFF")
- /data/app/pricing-enterprise.json (focus custom, formulaire contact)

Même structure, emphases différentes
```

---

## 📚 Ressources

- **Guide conceptuel :** [AI-BLOB-GUIDE.md](./AI-BLOB-GUIDE.md)
- **Exemples de patterns :** [BLOB-EXAMPLES.md](./BLOB-EXAMPLES.md)
- **Référence des champs :** [BLOB-FIELD-REFERENCE.md](./BLOB-FIELD-REFERENCE.md)
- **Format JSON :** [PAGE-STRUCTURE.md](./PAGE-STRUCTURE.md)

---

## ❓ FAQ Workflow

**Q : Puis-je utiliser GPT/autre LLM ?**
R : Oui, le workflow fonctionne avec tout LLM ayant accès aux fichiers. Donnez-lui les mêmes guides.

**Q : Les pages générées sont-elles parfaites ?**
R : Non, elles sont un excellent point de départ (80-90%). Raffinez le contenu et les détails dans l'éditeur.

**Q : Combien de temps ça prend ?**
R : ~5-10 min pour une page simple, ~20-30 min pour une page complexe avec brief.

**Q : Puis-je générer des dizaines de pages ?**
R : Oui, mais commencez par 2-3 pour valider le style, puis scalez.

**Q : L'IA respecte-t-elle toujours la compatibilité ?**
R : Généralement oui grâce aux guides. Si erreur, elle est détectée au chargement dans l'éditeur (auto-correction).

---

**Bon courage dans vos générations ! 🚀**

**Version :** 1.0
**Dernière mise à jour :** 2024-01-15
