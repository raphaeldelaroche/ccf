'use client';

import { useState, useEffect } from 'react';
import { GFFormData, FieldValueInput, FormFieldData, PageFieldData, CustomValidator, isCheckboxFieldData, isDateFieldData, isEmailFieldData } from '../types';
import { FormField } from './FormField';
import FormProgressIndicator from './FormProgressIndicator';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { submitForm } from '../utils/submit-form';

export interface FormRendererProps {
  gfForm: GFFormData;
  successMessage: string;
  onSubmitSuccess?: (entry: { id: string; databaseId: number }) => void;
  onPageChange?: (currentPage: number, totalPages: number) => void;
  className?: string;
  initialValues?: Record<string, string>;
  defaultValues?: Record<string, string>;
  customValidators?: CustomValidator[];
}

const FormRenderer: React.FC<FormRendererProps> = ({
  gfForm,
  successMessage,
  onSubmitSuccess,
  onPageChange,
  className = '',
  initialValues = {},
  defaultValues = {},
  customValidators = [],
}) => {
  // Convertir les valeurs initiales en utilisant l'ID du champ comme clé
  const initialFormValues = Object.entries(initialValues).reduce((acc, [key, value]) => {
    // Vérifier si la clé est une chaîne de caractères ou un nombre
    const fieldId = parseInt(key);
    if (!isNaN(fieldId)) {
      acc[fieldId] = value;
    }
    return acc;
  }, {} as Record<number, string>);

  // États du formulaire
  const [formValues, setFormValues] = useState<Record<number, string>>(initialFormValues);
  const [formErrors, setFormErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  
  // États pour la gestion des formulaires multi-pages
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageFields, setPageFields] = useState<FormFieldData[][]>([]);
  const [pageBreakFields, setPageBreakFields] = useState<PageFieldData[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  // Initialisation des pages du formulaire
  useEffect(() => {
    if (!gfForm || !gfForm.formFields?.nodes?.length) return;

    // Trouver tous les champs de type "page"
    const pageBreaks = gfForm.formFields.nodes.filter(
      field => field.type.toLowerCase() === 'page'
    ) as PageFieldData[];
    
    // Créer un tableau de pages avec leurs champs respectifs
    const formPages: FormFieldData[][] = [];
    let currentPageFields: FormFieldData[] = [];

    gfForm.formFields.nodes.forEach(field => {
      if (field.type.toLowerCase() === 'page') {
        // Si on trouve un champ de type page, on enregistre les champs précédents comme une page
        if (currentPageFields.length > 0) {
          formPages.push(currentPageFields);
          currentPageFields = [];
        }
      } else {
        // Si ce n'est pas un champ de type page, on l'ajoute à la page courante
        currentPageFields.push(field);
      }
    });

    // Ajouter la dernière page
    if (currentPageFields.length > 0) {
      formPages.push(currentPageFields);
    }

    setPageFields(formPages);
    setPageBreakFields(pageBreaks);
    setTotalPages(formPages.length);
    updateProgressPercentage(1, formPages.length);
  }, [gfForm]);

  // Process defaultValues for fields with template placeholders
  useEffect(() => {
    if (!gfForm || !gfForm.formFields?.nodes?.length) return;

    // Create a copy of the initial form values
    const newFormValues = { ...formValues };
    let valuesUpdated = false;

    // Check each field for default values with placeholders
    gfForm.formFields.nodes.forEach(field => {
      // Skip if the field already has a value
      if (newFormValues[field.databaseId]) return;

      // Check if the field has a defaultValue with placeholders
      if (field.defaultValue && typeof field.defaultValue === 'string') {
        // Look for patterns like {key}
        const placeholderPattern = /{([^{}]+)}/g;
        let match;
        let processedValue = field.defaultValue;

        // Replace all placeholders with actual values
        while ((match = placeholderPattern.exec(field.defaultValue)) !== null) {
          const placeholder = match[0]; // e.g., {firstName}
          const key = match[1]; // e.g., firstName
          
          if (defaultValues[key]) {
            processedValue = processedValue.replace(placeholder, defaultValues[key]);
            valuesUpdated = true;
          }
        }

        // Only update if the value actually changed (had replaceable placeholders)
        if (processedValue !== field.defaultValue) {
          newFormValues[field.databaseId] = processedValue;
        }
      }
    });

    // Update the form values if any changes were made
    if (valuesUpdated) {
      setFormValues(newFormValues);
    }
  }, [gfForm, defaultValues, formValues]);

  // Notifier le parent des changements de page
  useEffect(() => {
    if (totalPages > 0) {
      onPageChange?.(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  // Mettre à jour le pourcentage de progression
  const updateProgressPercentage = (page: number, total: number) => {
    setProgressPercentage(Math.floor((page / total) * 100));
  };

  // Validation du formulaire pour la page actuelle
  const validateFormPage = (pageNumber: number): boolean => {
    if (!pageFields[pageNumber - 1]) return true;
    
    const newErrors: Record<number, string> = {};
    let isValid = true;
  
    pageFields[pageNumber - 1].forEach((field) => {
      const value = formValues[field.databaseId] || '';
      
      // Validation standard existante
      if (field.isRequired && value.trim() === '') {
        newErrors[field.databaseId] = 'Ce champ est obligatoire';
        isValid = false;
      } 
      else if (field.type === 'EMAIL' && value.trim() !== '' && !isEmailValid(value)) {
        newErrors[field.databaseId] = 'Adresse email invalide';
        isValid = false;
      }
      else if (field.type === 'PHONE' && value.trim() !== '' && !isPhoneValid(value)) {
        newErrors[field.databaseId] = 'Numéro de téléphone invalide';
        isValid = false;
      }
      else if (field.type === 'NUMBER' && value.trim() !== '') {
        // Valider que c'est bien un nombre
        if (isNaN(Number(value))) {
          newErrors[field.databaseId] = 'Veuillez entrer un nombre valide';
          isValid = false;
        }
        
        // Valider la plage si elle est spécifiée
        if (field.rangeMin && Number(value) < Number(field.rangeMin)) {
          newErrors[field.databaseId] = `La valeur doit être supérieure ou égale à ${field.rangeMin}`;
          isValid = false;
        }
        
        if (field.rangeMax && Number(value) > Number(field.rangeMax)) {
          newErrors[field.databaseId] = `La valeur doit être inférieure ou égale à ${field.rangeMax}`;
          isValid = false;
        }
      }
      else if (field.type === 'CHECKBOX' && field.isRequired && (!value || value === '')) {
        newErrors[field.databaseId] = 'Veuillez sélectionner au moins une option';
        isValid = false;
      }
      else if (field.type === 'DATE' && field.isRequired && value.trim() === '') {
        newErrors[field.databaseId] = 'Ce champ est obligatoire';
        isValid = false;
      } 
      else if (field.type === 'DATE' && value.trim() !== '') {
        // Valider le format de la date
        try {
          const dateObj = new Date(value);
          if (isNaN(dateObj.getTime())) { // Si la date est invalide
            newErrors[field.databaseId] = 'Date invalide';
            isValid = false;
          }
        } catch (error) {
          newErrors[field.databaseId] = `Format de date invalide : ${error}`;
          isValid = false;
        }
      }
      else {
        // Vérifier si ce champ a des validateurs personnalisés
        const fieldValidators = customValidators.filter(validator => 
          validator.fieldIds.includes(field.databaseId)
        );
        
        // Appliquer chaque validateur personnalisé
        for (const validator of fieldValidators) {
          const errorMessage = validator.validate(value, formValues);
          if (errorMessage) {
            newErrors[field.databaseId] = errorMessage;
            isValid = false;
            break; // Sortir dès la première erreur trouvée pour ce champ
          }
        }
      }
    });
  
    setFormErrors(newErrors);
    return isValid;
  };

  // Validation des champs
  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPhoneValid = (phone: string): boolean => {
    const phoneRegex = /^(\+|00)?[0-9\s\-\(\)\.]{8,20}$/;
    return phoneRegex.test(phone);
  };

  // Gestion des changements de champ
  const handleFieldChange = (fieldId: number, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
    
    setError(null);
  };

  // Navigation entre les pages
  const handleNextPage = async () => {
    if (!validateFormPage(currentPage)) {
      return;
    }

    if (currentPage < totalPages) {
      // Valider la page actuelle via le serveur avant de passer à la suivante
      try {
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.set('formId', String(gfForm.databaseId));
        formData.set('fieldValues', JSON.stringify(prepareFieldValues()));
        formData.set('sourcePage', String(currentPage));
        formData.set('targetPage', String(currentPage + 1));

        const result = await submitForm(formData);

        if (result.success) {
          // Si la validation serveur est réussie, aller à la page suivante
          setCurrentPage(prev => {
            const nextPage = prev + 1;
            updateProgressPercentage(nextPage, totalPages);
            return nextPage;
          });
        } else if (result.error) {
          setError(result.error);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setError('Une erreur est survenue lors de la validation de la page');
        console.error('Error validating page:', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => {
        const prevPage = prev - 1;
        updateProgressPercentage(prevPage, totalPages);
        return prevPage;
      });
    }
  };

  const prepareFieldValues = (): FieldValueInput[] => {
    const fieldValues: FieldValueInput[] = [];
    
    gfForm.formFields.nodes.forEach(field => {
      const fieldId = field.databaseId;
      const value = formValues[fieldId] || '';
      
      // Gestion des champs checkbox
      if (isCheckboxFieldData(field) && value) {
        const selectedValues = value.split(',');
        const checkboxValues: { inputId: number; value: string }[] = [];
        
        // Vérification explicite que field.inputs existe et n'est pas vide
        if (field.inputs && field.inputs.length > 0) {
          field.inputs.forEach(input => {
            const inputIdAsNumber = parseFloat(input.id);
            if (isNaN(inputIdAsNumber)) return;
            
            const inputIdStr = inputIdAsNumber.toString();
            const decimalPart = inputIdStr.split('.')[1];
            
            if (!decimalPart) return;
            
            const choiceIndex = parseInt(decimalPart) - 1;
            
            // Vérification que field.choices existe et a la bonne longueur
            if (field.choices && choiceIndex >= 0 && choiceIndex < field.choices.length) {
              const choice = field.choices[choiceIndex];
              const choiceValue = choice?.value || '';
              
              if (selectedValues.includes(choiceValue)) {
                checkboxValues.push({
                  inputId: inputIdAsNumber,
                  value: choiceValue
                });
              }
            }
          });
        }
        
        if (checkboxValues.length > 0) {
          fieldValues.push({
            id: fieldId,
            checkboxValues: checkboxValues
          });
        }
      } 
      // Gestion des champs email
      else if (isEmailFieldData(field) && value) {
        fieldValues.push({
          id: fieldId,
          emailValues: {
            value: value,
            confirmationValue: ""
          }
        });
      }
      // Gestion des champs date
      else if (isDateFieldData(field) && value) {
        const dateValue = value.trim();
        const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
        
        if (isValidFormat) {
          fieldValues.push({
            id: fieldId,
            value: dateValue
          });
        } else {
          console.error(`Format de date invalide pour le champ ${field.databaseId} :`, dateValue);
        }
      }
      // Pour tous les autres types de champs
      else if (value) {
        fieldValues.push({
          id: fieldId,
          value: value
        });
      }
    });
    
    return fieldValues;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateFormPage(currentPage)) {
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Créer un FormData à partir du formulaire
      const formData = new FormData();
      
      // Ajouter l'ID du formulaire
      formData.set('formId', String(gfForm.databaseId));
      
      // Préparer les valeurs des champs au format attendu par l'API
      const fieldValues = prepareFieldValues();
      
      // Ajouter les fieldValues sérialisés au FormData
      formData.set('fieldValues', JSON.stringify(fieldValues));
      
      // Soumettre le formulaire final (pas de sourcePage/targetPage pour la soumission finale)
      const result = await submitForm(formData);
      
      if (result.success && result.entry) {
        setIsSubmitSuccessful(true);
        
        // Vérifier que l'entry a un databaseId avant d'appeler onSubmitSuccess
        if (onSubmitSuccess && result.entry.databaseId !== undefined) {
          onSubmitSuccess({
            id: result.entry.id,
            databaseId: result.entry.databaseId
          });
        }
      } else if (!result.success && result.error) {
        setError(result.error);
      } else {
        setError('Réponse invalide du serveur');
        console.error('Réponse invalide:', result);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError('Une erreur est survenue lors de la soumission du formulaire');
      console.error('Error submitting form:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex min-h-72 flex-col text-center justify-center items-center gap-3 rounded-lg p-8 xl:p-10 border border-border">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <div className="md:text-lg font-semibold -mt-0.5">
          {successMessage}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Hidden form ID field */}
      <input type="hidden" name="formId" value={gfForm.databaseId} />
      
      {/* Barre de progression */}
      <FormProgressIndicator 
        currentPage={currentPage}
        totalPages={totalPages}
        pagination={gfForm.pagination}
        pageLabels={pageBreakFields.map(field => field.label || '')}
        progressPercentage={progressPercentage}
      />
      
      {/* Page title if available */}
      {pageFields[currentPage - 1] && pageBreakFields[currentPage - 2] && pageBreakFields[currentPage - 2].label && (
        <h3 className="text-xl font-semibold mb-4">{pageBreakFields[currentPage - 2].label}</h3>
      )}
      
      {/* Render only fields for the current page */}
      {pageFields[currentPage - 1]?.map((field) => (
        <FormField
          key={field.databaseId}
          field={field}  // Pas de conversion nécessaire
          value={formValues[field.databaseId] || ''}
          onChange={(value) => handleFieldChange(field.databaseId, value)}
          error={formErrors[field.databaseId]}
        />
      ))}
      
      {/* Error message */}
      {error && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        {currentPage > 1 && (
          <Button 
            type="button" 
            variant={"ghost"}
            onClick={handlePreviousPage}
            disabled={isSubmitting}
            className="theme-brand flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {pageBreakFields[currentPage - 2]?.previousButton?.text || 'Précédent'}
          </Button>
        )}
        
        <div className="flex-1"></div>
        
        {currentPage < totalPages ? (
          <Button 
            type="button" 
            onClick={handleNextPage}
            disabled={isSubmitting}
            className="theme-brand w-full flex items-center gap-2 ml-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {pageBreakFields[currentPage - 1]?.nextButton?.text || 'Suivant'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="submit" 
            size={"lg"}
            disabled={isSubmitting} 
            className="theme-brand h-12 w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 text-beige-500 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <span>{gfForm.submitButton?.text || 'Envoyer'}</span>
                <ArrowRight className="size-5 text-beige-500" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};


export default FormRenderer;