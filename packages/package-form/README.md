# @packages/package-form

Système de formulaires React pour Gravity Forms avec support multi-pages, validation avancée et intégration GraphQL.

## Installation

```bash
# Ce package est interne au monorepo
import GravityForm from '@packages/package-form';
```

## Utilisation

### Formulaire simple

```typescript
import GravityForm from '@packages/package-form';

export default function ContactPage() {
  return (
    <GravityForm
      id={1}
      successMessage="Merci pour votre message !"
    />
  );
}
```

### Formulaire avec callback

```typescript
import GravityForm from '@packages/package-form';

export default function ContactPage() {
  const handleSuccess = (entry: { id: string; databaseId: number }) => {
    console.log('Formulaire soumis :', entry.id);
    // Redirection, analytics, etc.
  };

  return (
    <GravityForm
      id={1}
      onSubmitSuccess={handleSuccess}
      successMessage="Message envoyé avec succès !"
    />
  );
}
```

### Formulaire avec valeurs initiales

```typescript
import GravityForm from '@packages/package-form';

export default function ProfilePage() {
  const initialValues = {
    '1': 'John Doe',      // Champ ID 1 = Nom
    '2': 'john@email.com' // Champ ID 2 = Email
  };

  return (
    <GravityForm
      id={2}
      initialValues={initialValues}
    />
  );
}
```

### Formulaire avec valeurs par défaut et placeholders

```typescript
import GravityForm from '@packages/package-form';

export default function RegistrationPage() {
  // defaultValues sert à remplacer les placeholders du type {firstName}
  const defaultValues = {
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp'
  };

  return (
    <GravityForm
      id={3}
      defaultValues={defaultValues}
      // Si un champ a comme defaultValue: "Bonjour {firstName} {lastName}"
      // Il sera automatiquement rempli avec: "Bonjour John Doe"
    />
  );
}
```

### Formulaire multi-pages avec suivi de progression

```typescript
import GravityForm from '@packages/package-form';
import { useState } from 'react';

export default function SurveyPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);

    // Analytics
    console.log(`Page ${page}/${total}`);
  };

  return (
    <div>
      <div className="mb-4">
        Progression: {currentPage} / {totalPages}
      </div>

      <GravityForm
        id={4}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

### Formulaire avec validations personnalisées

```typescript
import GravityForm, { FormValidation } from '@packages/package-form';

export default function PasswordPage() {
  const validations: FormValidation[] = [
    {
      fields: [3, 4], // IDs des champs mot de passe et confirmation
      validation: (formValues) => {
        const password = formValues[3];
        const confirm = formValues[4];

        if (password !== confirm) {
          return 'Les mots de passe ne correspondent pas';
        }

        if (password.length < 8) {
          return 'Le mot de passe doit contenir au moins 8 caractères';
        }

        return null; // Pas d'erreur
      }
    }
  ];

  return (
    <GravityForm
      id={5}
      validations={validations}
    />
  );
}
```

### Utilisation des validateurs prédéfinis

```typescript
import GravityForm from '@packages/package-form';
import { FormValidators } from '@packages/package-form/utils/form-validators';

export default function AdvancedForm() {
  // Convertir les validateurs prédéfinis en format FormValidation
  const customValidators = [
    FormValidators.minLength([3], 8, 'Minimum 8 caractères'),
    FormValidators.match(3, 4, 'Les mots de passe ne correspondent pas'),
    FormValidators.email([5], 'Email invalide'),
    FormValidators.phone([6], 'fr', 'Téléphone français requis'),
    FormValidators.postalCode([7], 'FR', 'Code postal français invalide'),
    FormValidators.hasSpecialChar([3], 'Doit contenir un caractère spécial'),
    FormValidators.range([8], 18, 99), // Age entre 18 et 99
    FormValidators.dateRange([9], new Date('2024-01-01'), new Date('2024-12-31')),
    FormValidators.requiredIf(10, 11, 'yes', 'Ce champ est requis'),
    FormValidators.custom([12], (value, formValues) => {
      // Validation personnalisée complexe
      if (value.toLowerCase().includes('spam')) {
        return 'Contenu non autorisé';
      }
      return null;
    })
  ];

  // Convertir au format attendu par GravityForm
  const validations = customValidators.map(validator => ({
    fields: validator.fieldIds,
    validation: (formValues: Record<number, string>) => {
      const fieldId = validator.fieldIds[0];
      return validator.validate(formValues[fieldId] || '', formValues);
    }
  }));

  return (
    <GravityForm
      id={6}
      validations={validations}
    />
  );
}
```

### Mode Debug

```typescript
import GravityForm from '@packages/package-form';

export default function DebugForm() {
  return (
    <GravityForm
      id={1}
      debug={true}
      // Affiche dans la console:
      // - Type de formulaire (multi-page ou non)
      // - Nombre de champs
      // - Informations de pagination
      // - Valeurs des champs
    />
  );
}
```

## API Props

### GravityForm

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string \| number` | **requis** | ID du formulaire Gravity Forms |
| `successMessage` | `string` | `"Merci ! Votre demande..."` | Message affiché après soumission réussie |
| `onSubmitSuccess` | `(entry) => void` | `undefined` | Callback appelé après soumission réussie |
| `onPageChange` | `(current, total) => void` | `undefined` | Callback appelé lors du changement de page |
| `className` | `string` | `""` | Classes CSS additionnelles |
| `initialValues` | `Record<string, string>` | `{}` | Valeurs initiales des champs |
| `defaultValues` | `Record<string, string>` | `{}` | Valeurs pour remplacer les placeholders `{key}` |
| `debug` | `boolean` | `false` | Active le mode debug avec logs détaillés |
| `validations` | `FormValidation[]` | `[]` | Validations personnalisées |

### FormValidation

```typescript
interface FormValidation {
  fields: number[];  // IDs des champs concernés
  validation: (formValues: Record<number, string>) => string | null;
}
```

## Fonctionnalités

### Types de champs supportés

- ✅ **TEXT** - Champ texte
- ✅ **TEXTAREA** - Zone de texte multi-lignes
- ✅ **EMAIL** - Email avec validation
- ✅ **PHONE** - Téléphone avec validation
- ✅ **NUMBER** - Nombre avec min/max
- ✅ **DATE** - Sélecteur de date
- ✅ **SELECT** - Liste déroulante
- ✅ **RADIO** - Boutons radio
- ✅ **CHECKBOX** - Cases à cocher multiples
- ✅ **HIDDEN** - Champs cachés
- ✅ **PAGE** - Séparateurs de page (multi-page)

### Validation automatique

Le package valide automatiquement:
- **Champs requis** - Vérification de présence
- **Email** - Format email valide
- **Téléphone** - Format téléphone international
- **Nombre** - Validation numérique et plage min/max
- **Date** - Format de date valide
- **Checkbox** - Au moins une option si requis

### Validation personnalisée

Vous pouvez ajouter vos propres validateurs:

```typescript
const validations: FormValidation[] = [
  {
    fields: [3, 4], // Valide les champs 3 et 4 ensemble
    validation: (formValues) => {
      const value1 = formValues[3];
      const value2 = formValues[4];

      // Logique de validation
      if (value1 !== value2) {
        return 'Erreur: les valeurs ne correspondent pas';
      }

      return null; // Validation OK
    }
  }
];
```

### Formulaires multi-pages

Le package détecte automatiquement les formulaires multi-pages via les champs de type `PAGE`.

**Fonctionnalités:**
- Navigation Précédent/Suivant
- Barre de progression (3 styles)
- Validation par page
- Sauvegarde des valeurs entre pages

**Styles de progression:**
- `percentage` - Barre de progression avec pourcentage
- `steps` - Étapes numérotées avec labels
- `pages` - Simple compteur "1/5"

### Gestion des erreurs

Les erreurs sont affichées:
- **Par champ** - Message sous le champ concerné
- **Globale** - Message d'erreur général en haut du formulaire
- **Serveur** - Erreurs retournées par l'API GraphQL

### Soumission du formulaire

La soumission utilise GraphQL:
1. Préparation des données (checkbox, email, date)
2. Mutation GraphQL `submitGfForm`
3. Gestion de la réponse (succès/erreur)
4. Affichage du message de confirmation

## Hooks

### useGravityForm

Hook pour récupérer les données d'un formulaire:

```typescript
import { useGravityForm } from '@packages/package-form/hooks/useGravityForms';

function MyComponent() {
  const { formData, loading, error } = useGravityForm(1);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return <div>{formData.title}</div>;
}
```

**Retour:**
- `formData` - Données du formulaire (GFFormData)
- `loading` - État de chargement (boolean)
- `error` - Message d'erreur (string | null)

## Composants internes

### FormRenderer

Composant principal qui gère le rendu et la logique du formulaire.

**Responsabilités:**
- Gestion de l'état du formulaire
- Navigation multi-pages
- Validation des champs
- Soumission du formulaire

### FormField

Composant pour le rendu d'un champ individuel selon son type.

**Supporte:**
- Tous les types de champs Gravity Forms
- Validation en temps réel
- Messages d'erreur
- Placeholders et descriptions

### FormProgressIndicator

Composant d'affichage de la progression pour les formulaires multi-pages.

**Styles:**
- Barre de progression
- Indicateurs d'étapes
- Compteur simple

## Utilitaires

### form-validators.ts

Bibliothèque de validateurs réutilisables:

```typescript
import { FormValidators } from '@packages/package-form/utils/form-validators';

// Validateurs disponibles:
FormValidators.minLength(fieldIds, min, message?)
FormValidators.maxLength(fieldIds, max, message?)
FormValidators.pattern(fieldIds, regex, message?)
FormValidators.match(fieldId, matchFieldId, message?)
FormValidators.requiredIf(fieldId, dependentFieldId, value, message?)
FormValidators.range(fieldIds, min?, max?)
FormValidators.email(fieldIds, message?)
FormValidators.phone(fieldIds, format, message?)
FormValidators.postalCode(fieldIds, country, message?)
FormValidators.dateRange(fieldIds, minDate?, maxDate?, message?)
FormValidators.hasSpecialChar(fieldIds, message?)
FormValidators.custom(fieldIds, validationFn)
```

### submit-form.ts

Fonction utilitaire pour soumettre un formulaire:

```typescript
import { submitForm } from '@packages/package-form/utils/submit-form';

const formData = new FormData();
formData.set('formId', '1');
formData.set('fieldValues', JSON.stringify(fieldValues));

const result = await submitForm(formData);

if (result.success) {
  console.log('Entry ID:', result.entry?.id);
} else {
  console.error('Error:', result.error);
}
```

## Types

### GFFormData

Structure complète d'un formulaire Gravity Forms:

```typescript
interface GFFormData {
  cssClass: string | null;
  databaseId: number;
  dateCreated: string;
  formFields: {
    nodes: FormFieldData[];
  };
  pagination: FormPagination | null;
  title: string;
  submitButton?: {
    type: string;
    text: string;
  };
}
```

### FormFieldData

Union de tous les types de champs:

```typescript
type FormFieldData =
  | TextFieldData
  | NumberFieldData
  | DateFieldData
  | SelectFieldData
  | CheckboxFieldData
  | RadioFieldData
  | EmailFieldData
  | PhoneFieldData
  | TextAreaFieldData
  | HiddenFieldData
  | PageFieldData;
```

### BaseFormField

Structure de base d'un champ:

```typescript
interface BaseFormField {
  databaseId: number;
  type: string;
  label: string;
  isRequired: boolean;
  description: string | null;
  placeholder?: string;
  defaultValue?: string;
  cssClass?: string;
}
```

## Structure du Package

```
packages/package-form/
├── components/
│   ├── FormField.tsx              # Rendu des champs individuels
│   ├── FormRenderer.tsx           # Logique principale du formulaire
│   └── FormProgressIndicator.tsx  # Barre de progression
├── hooks/
│   ├── useGravityForms.ts        # Hook de récupération des données
│   └── useFormValidation.tsx     # Hook de validation (legacy)
├── utils/
│   ├── form-validators.ts        # Bibliothèque de validateurs
│   └── submit-form.ts            # Soumission GraphQL
├── types.ts                      # Définitions TypeScript
└── index.tsx                     # Export principal (GravityForm)
```

## Workflow de soumission

1. **Client** - L'utilisateur remplit le formulaire
2. **Validation** - Validation côté client (champs requis, format, custom)
3. **Préparation** - Conversion des valeurs en format GraphQL
4. **Mutation** - Envoi via `submitGfForm` mutation
5. **Réponse** - Gestion des erreurs ou affichage du succès
6. **Callback** - Exécution de `onSubmitSuccess` si défini

## Workflow multi-pages

1. **Initialisation** - Détection des champs `PAGE`
2. **Séparation** - Division du formulaire en pages
3. **Navigation** - Boutons Précédent/Suivant
4. **Validation** - Validation serveur à chaque changement de page
5. **Progression** - Mise à jour de la barre de progression
6. **Soumission** - Soumission finale sur la dernière page

## Intégration avec Gravity Forms

Le package utilise l'extension **WPGraphQL for Gravity Forms** qui expose:

### Queries

```graphql
query GetGravityForm($id: ID!) {
  gfForm(id: $id, idType: DATABASE_ID) {
    databaseId
    title
    formFields { ... }
    pagination { ... }
  }
}
```

### Mutations

```graphql
mutation SubmitForm($id: ID!, $fieldValues: [FormFieldValuesInput!]!) {
  submitGfForm(input: {
    id: $id
    fieldValues: $fieldValues
    sourcePage: $sourcePage
    targetPage: $targetPage
  }) {
    confirmation { message }
    errors { message }
    entry { id databaseId }
  }
}
```

## Dépendances

- **@packages/package-fetch-graphql** - Pour les requêtes GraphQL
- **@/components/ui** - Composants UI (shadcn/ui)
- **lucide-react** - Icônes
- **React 18+** - Framework
- **Next.js 15+** - Recommandé

## Exemples avancés

### Formulaire avec dépendances conditionnelles

```typescript
const validations: FormValidation[] = [
  {
    fields: [5], // Champ "Autre raison"
    validation: (formValues) => {
      const reason = formValues[4]; // Champ "Raison"
      const otherReason = formValues[5];

      // Si "Autre" est sélectionné, le champ 5 devient requis
      if (reason === 'other' && !otherReason) {
        return 'Veuillez préciser la raison';
      }

      return null;
    }
  }
];
```

### Formulaire avec validation asynchrone

```typescript
const validations: FormValidation[] = [
  {
    fields: [3], // Email
    validation: async (formValues) => {
      const email = formValues[3];

      // Vérifier si l'email existe déjà (exemple)
      const exists = await checkEmailExists(email);

      if (exists) {
        return 'Cet email est déjà utilisé';
      }

      return null;
    }
  }
];
```

### Intégration avec React Hook Form (alternative)

Si vous préférez utiliser React Hook Form au lieu du système de validation intégré:

```typescript
import { useForm } from 'react-hook-form';
import { useGravityForm } from '@packages/package-form/hooks/useGravityForms';
import { FormField } from '@packages/package-form/components/FormField';

function CustomForm() {
  const { formData } = useGravityForm(1);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    // Logique de soumission personnalisée
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formData?.formFields.nodes.map(field => (
        <FormField
          key={field.databaseId}
          field={field}
          {...register(`field_${field.databaseId}`)}
        />
      ))}
    </form>
  );
}
```

## Troubleshooting

### Le formulaire ne se charge pas

- Vérifiez que l'ID du formulaire existe dans Gravity Forms
- Vérifiez que WPGraphQL for Gravity Forms est installé et activé
- Consultez les logs de la console pour voir les erreurs GraphQL

### Les validations personnalisées ne fonctionnent pas

- Assurez-vous que les IDs de champs sont corrects
- Vérifiez que la fonction de validation retourne `string | null`
- Utilisez `debug={true}` pour voir les valeurs des champs

### La pagination ne s'affiche pas

- Vérifiez que le formulaire a des champs de type `PAGE`
- Vérifiez que `pagination` est configuré dans Gravity Forms
- Consultez la console en mode debug

### Les checkbox ne se soumettent pas correctement

- Vérifiez que le champ a bien des `inputs` définis
- Les valeurs doivent être séparées par des virgules
- Consultez les logs de soumission dans la console

## Roadmap

- [ ] Support des champs de fichier (upload)
- [ ] Support des champs conditionnels (conditional logic)
- [ ] Support des calculs de prix
- [ ] Support des signatures
- [ ] Mode brouillon (draft entries)
- [ ] Validation en temps réel pendant la saisie
- [ ] Meilleure intégration TypeScript pour les validateurs
- [ ] Tests unitaires
- [ ] Storybook pour les composants

## Licence

Interne au projet Climate Contribution Framework

## Support

Pour toute question ou problème, consultez:
- Documentation Gravity Forms: https://docs.gravityforms.com/
- Documentation WPGraphQL for Gravity Forms: https://docs.wpgraphql.com/extensions/wpgraphql-for-gravity-forms/

---

**Package développé pour Climate Contribution Framework** - Intégration complète de Gravity Forms avec React et GraphQL
