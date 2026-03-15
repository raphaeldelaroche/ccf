# Système Blob

## Composants (`/components/blob` et `/components/blocks`)

### Composants Blob

#### `blob.tsx` — Le composant Blob principal

* Pattern compound component : `Blob.Header`, `Blob.Actions`, `Blob.Content`, `Blob.Figure`
* Accepte un objet `responsive` contenant toutes les props par breakpoint
* Props de base : `responsive` (objet ResponsiveProps) + `theme` (string)
* Conversion automatique objet → classes CSS en interne

### Sous-composants

`marker.tsx`, `title.tsx`, `subtitle.tsx`, `eyebrow.tsx` — Composants atomiques avec système de tokens de taille pour cohérence visuelle

## Styles (`/styles`)

### `blob.css` — Point d'entrée CSS principal

* Import des autres fichiers CSS (blob-composed, blob-size)
* Définit la grille CSS de base avec les slots nommés (marker, header, actions, content, figure)
* Utilitaires d'alignement (`blob-align-*`)
* Utilitaires de largeur de figure (`blob-figure-w-*`)
* Système de figure bleed (4 variantes selon la direction du layout)
* Safelist Tailwind v4 pour préserver les variantes responsive

### `blob-composed.css` — Classes atomiques de layout

* Une classe CSS par combinaison valide de layout/marker/actions
* Chaque classe définit : grid-template-areas, grid-template-columns, grid-template-rows
* Système de suppression dynamique des slots vides via `:not(:has(...))`
* Environ 25 classes générées couvrant toutes les combinaisons valides

### `blob-size.css` — Système de tokens de taille

* 14 échelles de taille (xs à 10xl)
* Chaque taille définit ~15 variables CSS : typographie (eyebrow, heading, body, lead), média (width, height, icon), actions (gap, button height/padding/font), espacement (section gap, padding)
* Utilitaires pour surcharger individuellement (gutter, paddingX, paddingY)
* Logique spéciale pour le variant "ghost" du marker (multiplicateur 1.5x)

## Concepts clés

### Classes atomiques composées

Contrairement aux approches traditionnelles qui combinent plusieurs classes CSS, Blob UI génère **une seule classe par combinaison** layout/marker/actions.

Par exemple : `blob-row-marker-left-actions-after` est une classe unique qui définit toute la structure de grille pour cette configuration spécifique.

**Pourquoi ?** Les variables CSS ne s'écrasent pas bien avec les breakpoints responsive. Une classe atomique par breakpoint élimine ce problème.

### Normalisation des noms de classes

Pour réduire le nombre de classes CSS nécessaires, les valeurs par défaut sont omises du nom :

* `marker="top"` n'ajoute pas `-marker-top` (c'est le défaut)
* `actions="before"` n'ajoute pas `-actions-before` (c'est le défaut)

Ainsi, `blob-stack` = layout stack + marker top + actions before.

### Système de compatibilité

Chaque layout définit :

* Quels markers sont supportés (ex: "row" ne supporte que "top")
* Si les actions sont supportées (ex: "bar" ne supporte pas les actions)
* Quels alignements sont valides
* Si figureWidth est supporté (uniquement sur row/row-reverse)

Des **contraintes croisées** existent aussi : sur layout="stack", si marker="left" ou "right", alors align ne peut être que "left" ou "right" (pas "center").

Le registre de compatibilité est **pré-généré** au build, ce qui permet des validations rapides à runtime.

### Valeurs responsive

Le composant Blob accepte un objet `responsive` contenant toutes les props organisées par breakpoint. Chaque breakpoint (xs, sm, md, lg, xl, 2xl) peut définir ses propres valeurs :

```typescript
<Blob
  responsive={{
    base: {
      layout: "stack",
      marker: "top",
      size: "md",
      paddingX: "container-md"
    },
    md: {
      layout: "row",
      marker: "left"
    },
    lg: {
      layout: "bar",
      size: "xl",
      paddingX: "container-lg"
    }
  }}
  theme="brand"
/>
```

**Héritage mobile-first** : Les valeurs se propagent automatiquement. Dans l'exemple ci-dessus, `md` hérite de `size="md"` depuis `base`, et `lg` hérite de `marker="left"` depuis `md`.

**Conversion interne** : Le composant Blob convertit automatiquement cet objet en classes CSS via `convertResponsiveToString()` pour générer `"stack md:row lg:bar"`, etc.

**Type-safety** : TypeScript valide les valeurs à chaque breakpoint grâce aux interfaces `ResponsiveProps` et `ResponsiveBreakpointProps` définies dans `blob-compose.ts`.

### Paddings dynamiques (Container Mode)

La propriété `paddingX` supporte deux valeurs spéciales : `container-md` et `container-lg`.
Contrairement aux tokens de taille classiques (ex: `xl`, `2xl`), ces utilitaires calculent dynamiquement une marge intérieure (padding) afin que le contenu s'aligne exactement sur une largeur maximale, tout en permettant au fond (background) de s'étendre sur toute la largeur de l'écran (approche "full-bleed").

* `container-md` : Contraint le contenu à `max-w-4xl` (56rem / 896px)
* `container-lg` : Contraint le contenu à `max-w-7xl` (80rem / 1280px)

**Le grand avantage** : Lorsque combiné avec `figureBleed="full"`, le calcul natif des marges CSS annule exactement ce padding, permettant à l'image de s'échapper en dehors du "container" virtuel pour aller toucher le bord de l'écran, sans aucune classe de surpassement complexe.

### Système de tokens de taille

Au lieu de définir manuellement font-size, spacing, etc., on utilise un token de taille unique (ex: `size="xl"`).

Ce token définit automatiquement **toutes les variables** : taille du heading, du body, de l'eyebrow, des boutons, du marker, des gaps, du padding, etc.

Résultat : cohérence visuelle garantie et changements de taille en une seule prop.

### Suppression dynamique des slots

Le CSS utilise `:not(:has(> [data-slot="marker"]))` pour détecter si un slot est rendu. Si absent, il est automatiquement retiré de la grille.

Cela permet d'utiliser le même composant Blob sans avoir à gérer manuellement les layouts conditionnels.

### Système de blocs extensibles

`BlockDefinition` permet de créer des variantes de Blob avec :

* Des champs supplémentaires spécifiques au bloc (`extraSections`, `extraFields`)
* Des valeurs forcées ou initiales (`defaultValues`, `initialValues`)
* Des restrictions d'options (whitelist de certaines valeurs)
* Un renderer personnalisé

**Exemples concrets** :

* `BlockBlobSection` : ajoute un champ `containerWidth` (center/wide/full)
* `IteratorBlockDefinition` : masque les sections de base via `hideSections`, ajoute iterator + itemConfig + sections partagées dynamiques + items

## Notes pour les contributeurs

### Blob

* **Modifier la compatibilité** : éditer `COMPATIBILITY` dans `blob-compatibility.ts`, puis regénérer le registre
* **Ajouter un layout** : ajouter à `LAYOUTS`, définir son entrée dans `COMPATIBILITY`, créer la classe CSS dans `blob-composed.css`
* **Ajouter un champ** : l'ajouter dans `fieldSections` de `blob-fields.ts`, gérer le mapping dans `blob-form-mapper.ts`
* **Modifier les tokens de taille** : éditer les variables dans `blob-size.css`

### Migration responsive

Si vous avez des pages en base de données avec l'ancien format responsive (strings), utilisez le script de migration :

```bash
# Simulation (recommandé d'abord)
npx tsx scripts/migrate-responsive-to-object.ts --dry-run

# Migration réelle
npx tsx scripts/migrate-responsive-to-object.ts
```

Voir [scripts/README.md](../scripts/README.md) pour plus de détails.
