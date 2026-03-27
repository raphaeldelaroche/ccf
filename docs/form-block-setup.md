# Form Block - Configuration et Troubleshooting

## Vue d'ensemble

Le bloc Form permet d'intégrer des formulaires Gravity Forms dans l'éditeur de pages. Il utilise le package `@packages/package-form` pour communiquer avec WordPress via GraphQL.

## Architecture

```
BlockForm (Client Component)
  └─> GravityForm (@packages/package-form)
      ├─> useGravityForm (hook)
      │   └─> fetchGraphQL (GraphQL client)
      └─> FormRenderer (rendering)
```

## Prérequis

### WordPress

1. **Gravity Forms** installé et activé
2. **WPGraphQL** installé et activé
3. **WPGraphQL for Gravity Forms** installé et activé
   - Plugin: https://github.com/AxeWP/wp-graphql-gravity-forms

### Next.js

1. Variable d'environnement configurée dans `.env.local`:
   ```
   NEXT_PUBLIC_WORDPRESS_API_URL=http://climate-contribution-framework.local/
   ```

2. Path alias configuré dans `tsconfig.json`:
   ```json
   "paths": {
     "@packages/*": ["./packages/*"]
   }
   ```

## Créer un formulaire

### Option 1: Script PHP (Recommandé)

1. Le script a déjà été créé ici:
   ```
   /Users/raphaeldelaroche/Local Sites/climate-contribution-framework/app/public/create-contact-form.php
   ```

2. Ouvrir dans le navigateur:
   ```
   http://climate-contribution-framework.local/create-contact-form.php
   ```

3. Noter le Form ID retourné

4. **Supprimer le fichier après usage** (sécurité)

### Option 2: Import JSON

1. Aller dans WordPress Admin → Forms → Import/Export
2. Uploader `data/gravity-forms-contact.json`
3. Le formulaire sera créé automatiquement

## Utilisation dans l'éditeur

1. Ajouter un bloc "Formulaire" dans l'éditeur
2. Dans l'inspecteur, configurer:
   - **ID du formulaire**: L'ID retourné par le script
   - **Message de succès**: Message personnalisé (optionnel)
   - **Mode debug**: Activer pour voir les logs (dev uniquement)

## Troubleshooting

### "Impossible de charger le formulaire"

#### 1. Vérifier la connexion GraphQL

```bash
node scripts/test-graphql-connection.mjs
```

**Résultats attendus:**
- ✅ GraphQL connection successful
- ✅ WPGraphQL for Gravity Forms is active
- ✅ Form fetched successfully

#### 2. Vérifier les variables d'environnement

```bash
grep WORDPRESS_API_URL .env.local
```

Doit retourner:
```
NEXT_PUBLIC_WORDPRESS_API_URL=http://climate-contribution-framework.local/
```

#### 3. Vérifier que le formulaire existe

Dans WordPress Admin:
- Aller dans Forms
- Vérifier que le formulaire apparaît dans la liste
- Noter son ID

#### 4. Vérifier les logs du navigateur

Activer le mode debug:
- Dans l'inspecteur du bloc, cocher "Mode debug"
- Ouvrir la console du navigateur (F12)
- Recharger la page
- Vérifier les logs pour plus de détails

#### 5. Erreurs GraphQL courantes

| Erreur | Solution |
|--------|----------|
| `Field "gfForm" not found` | Installer WPGraphQL for Gravity Forms |
| `Form not found` | Vérifier que le formId existe dans Gravity Forms |
| `HTTP 404` | Vérifier que WPGraphQL est activé |
| `CORS error` | Vérifier l'URL dans .env.local |

### Le formulaire ne s'affiche pas

#### 1. Vérifier que BlockForm est un Client Component

Le fichier doit commencer par:
```tsx
"use client"
```

#### 2. Vérifier le mapping

Le mapper doit convertir correctement les données:
```typescript
// lib/form-mapper.ts
const formId = parseInt(formIdRaw, 10)
```

#### 3. Vérifier le rendu

Dans `BlockRenderer.tsx` et `render-page-blocks.tsx`:
```typescript
const formProps = mapFormData(block.data)
return <BlockForm {...formProps} />
```

## Tests

### Test de connexion

```bash
node scripts/test-graphql-connection.mjs
```

### Test du composant

1. Lancer le dev server: `pnpm dev`
2. Ouvrir l'éditeur: http://localhost:3000/new-editor
3. Ajouter un bloc Form
4. Vérifier qu'il charge sans erreur

### Test de soumission

1. Remplir le formulaire
2. Soumettre
3. Vérifier:
   - Message de succès affiché
   - Entry créée dans WordPress Admin → Forms → Entries

## Structure des fichiers

```
lib/
├── form-fields.ts           # Définition des champs du bloc
├── form-mapper.ts           # Mapping FormData → Props
└── new-editor/
    └── block-registry.ts    # Enregistrement du bloc

components/
├── blocks/
│   └── BlockForm.tsx        # Composant principal
└── new-editor/
    └── FormInspector.tsx    # Interface de configuration

packages/
└── package-form/            # Package Gravity Forms
    ├── index.tsx            # GravityForm component
    ├── hooks/
    │   └── useGravityForms.ts
    └── components/
        ├── FormRenderer.tsx
        └── FormField.tsx

data/
└── gravity-forms-contact.json  # Template de formulaire

scripts/
├── create-gravity-form.php      # Script de création (CLI)
└── test-graphql-connection.mjs  # Script de test
```

## Développement

### Ajouter un nouveau champ au bloc

1. Modifier `lib/form-fields.ts`:
   ```typescript
   fields: {
     monChamp: {
       label: 'Mon Champ',
       type: 'text',
       copyCategory: 'content',
     }
   }
   ```

2. Mettre à jour `lib/form-mapper.ts`:
   ```typescript
   const monChamp = formData.monChamp as string
   return { formId, successMessage, debug, monChamp }
   ```

3. Mettre à jour `BlockFormProps`:
   ```typescript
   export interface BlockFormProps {
     monChamp?: string
   }
   ```

4. Utiliser dans `BlockForm.tsx`:
   ```tsx
   <GravityForm monChamp={monChamp} />
   ```

### Mode debug

Activer dans block-registry.ts:
```typescript
initialValues: {
  debug: true  // Active les logs détaillés
}
```

Logs disponibles:
- Type de formulaire (multi-page ou non)
- Nombre de champs
- Données de pagination
- Erreurs GraphQL détaillées

## FAQ

**Q: Puis-je utiliser plusieurs formulaires sur une même page?**
R: Oui, ajoutez plusieurs blocs Form avec des formId différents.

**Q: Le formulaire fonctionne en dev mais pas en production?**
R: Vérifiez que les variables d'environnement sont bien configurées sur Vercel/production.

**Q: Comment personnaliser le style du formulaire?**
R: Les formulaires utilisent les classes Tailwind du package-form. Vous pouvez surcharger via la prop `className` ou modifier les composants dans `packages/package-form/components/`.

**Q: Les soumissions sont-elles sauvegardées?**
R: Oui, toutes les soumissions sont enregistrées dans WordPress Admin → Forms → Entries.

**Q: Comment ajouter des notifications email?**
R: Configurer dans WordPress Admin → Forms → [Votre formulaire] → Settings → Notifications.

## Support

- Documentation Gravity Forms: https://docs.gravityforms.com/
- Documentation WPGraphQL for Gravity Forms: https://docs.wpgraphql.com/extensions/wpgraphql-for-gravity-forms/
- Script de test: `node scripts/test-graphql-connection.mjs`
