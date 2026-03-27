// index.tsx (Composant GravityForm modifié)
'use client';

import { useGravityForm } from './hooks/useGravityForms';
import FormRenderer from './components/FormRenderer';
import { Loader2 } from 'lucide-react';

// Nouvelle interface pour les validations simplifiées
export interface FormValidation {
  fields: number[]; // IDs des champs concernés
  validation: (formValues: Record<number, string>) => string | null; // Fonction de validation qui retourne un message d'erreur ou null
}

export interface GravityFormProps {
  id: string | number;
  successMessage?: string;
  onSubmitSuccess?: (entry: { id: string; databaseId: number }) => void;
  onPageChange?: (currentPage: number, totalPages: number) => void;
  className?: string;
  initialValues?: Record<string, string>;
  defaultValues?: Record<string, string>;
  debug?: boolean;
  validations?: FormValidation[]; // Nouvelle prop
}

/**
 * Composant principal pour afficher un formulaire Gravity Forms
 * Prend en charge les formulaires multi-pages avec validation par page
 */
const GravityForm: React.FC<GravityFormProps> = ({
  id,
  successMessage = "Thank you for your submission! We will get back to you soon.",
  onSubmitSuccess,
  onPageChange,
  className = "",
  initialValues = {},
  defaultValues = {},
  debug = false,
  validations = []
}) => {
  // Récupération des données du formulaire
  const { formData, loading, error } = useGravityForm(id);

  // Afficher l'état de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        <span className="ml-2 text-gray-700">Chargement...</span>
      </div>
    );
  }

  // Gérer les erreurs
  if (error || !formData) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 my-4">
        <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
        <p className="text-red-700">{error || "Une erreur s'est produite lors du chargement du formulaire."}</p>
      </div>
    );
  }

  // Vérifier si le formulaire a une pagination
  const isMultiPage = formData.formFields.nodes.some(field => field.type.toLowerCase() === 'page');

  // En mode debug, afficher des informations sur le formulaire
  if (debug) {
    console.log('Formulaire multi-page:', isMultiPage);
    console.log('Pagination:', formData.pagination);
    console.log('Champs de type page:', formData.formFields.nodes.filter(field => field.type.toLowerCase() === 'page'));
  }

  // Convertir les validations simplifiées au format interne du FormRenderer
  const formValidators = validations.map(validation => ({
    fieldIds: validation.fields,
    validate: (value: string, formValues: Record<number, string>) => validation.validation(formValues)
  }));

  // Afficher le formulaire
  return (
    <div className="w-full max-w-3xl mx-auto">
      {debug && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Mode debug</h3>
          <p>ID du formulaire: {formData.databaseId}</p>
          <p>Type: {isMultiPage ? 'Multi-page' : 'Page unique'}</p>
          <p>Nombre de champs: {formData.formFields.nodes.length}</p>
          {isMultiPage && (
            <p>Pages: {formData.formFields.nodes.filter(field => field.type.toLowerCase() === 'page').length + 1}</p>
          )}
        </div>
      )}
      
      <FormRenderer
        gfForm={formData}
        successMessage={successMessage}
        onSubmitSuccess={onSubmitSuccess}
        onPageChange={onPageChange}
        className={`${formData.cssClass || ''} ${className}`}
        initialValues={initialValues}
        defaultValues={defaultValues}
        customValidators={formValidators}
      />
    </div>
  );
};

export default GravityForm;