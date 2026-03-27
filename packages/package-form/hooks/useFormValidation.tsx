'use client';

import { useState, useMemo } from 'react';
import { 
  CustomValidator, 
  FormFieldData, 
  isNumberFieldData, 
  isEmailFieldData, 
  isPhoneFieldData, 
  isDateFieldData 
} from '../types';

interface ValidationRule {
  fieldId: number;
  message: string;
  validate: (value: string, formValues: Record<number, string>) => boolean;
}

interface UseFormValidationProps {
  formValues: Record<number, string>;
  formFields: FormFieldData[];
  customValidators?: CustomValidator[];
}

interface UseFormValidationReturn {
  validateForm: () => boolean;
  errors: Record<number, string>;
  clearErrors: () => void;
  validateField: (fieldId: number) => boolean;
}

/**
 * Hook personnalisé pour la validation des formulaires
 */
export const useFormValidation = ({
  formValues,
  formFields,
  customValidators = []
}: UseFormValidationProps): UseFormValidationReturn => {
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Générer les règles de validation standard à partir des champs du formulaire
  const validationRules = useMemo<ValidationRule[]>(() => {
    if (!formFields) return [];

    const rules: ValidationRule[] = [];

    formFields.forEach(field => {
      const fieldId = field.databaseId;

      // Champ requis
      if (field.isRequired) {
        rules.push({
          fieldId,
          message: 'Ce champ est obligatoire',
          validate: (value) => value.trim() !== ''
        });
      }

      // Validation du format email
      if (isEmailFieldData(field)) {
        rules.push({
          fieldId,
          message: 'Adresse email invalide',
          validate: (value) => {
            if (!value.trim()) return true; // Ne pas valider si vide (déjà géré par isRequired)
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          }
        });
      }

      // Validation du format téléphone
      if (isPhoneFieldData(field)) {
        rules.push({
          fieldId,
          message: 'Numéro de téléphone invalide',
          validate: (value) => {
            if (!value.trim()) return true;
            return /^(\+|00)?[0-9\s\-\(\)\.]{8,20}$/.test(value);
          }
        });
      }

      // Validation du format nombre
      if (isNumberFieldData(field)) {
        rules.push({
          fieldId,
          message: 'Veuillez entrer un nombre valide',
          validate: (value) => {
            if (!value.trim()) return true;
            return !isNaN(Number(value));
          }
        });

        // Validation de la plage min
        if (field.rangeMin !== undefined) {
          rules.push({
            fieldId,
            message: `La valeur doit être supérieure ou égale à ${field.rangeMin}`,
            validate: (value) => {
              if (!value.trim()) return true;
              return Number(value) >= Number(field.rangeMin);
            }
          });
        }

        // Validation de la plage max
        if (field.rangeMax !== undefined) {
          rules.push({
            fieldId,
            message: `La valeur doit être inférieure ou égale à ${field.rangeMax}`,
            validate: (value) => {
              if (!value.trim()) return true;
              return Number(value) <= Number(field.rangeMax);
            }
          });
        }
      }

      // Validation du format date
      if (isDateFieldData(field)) {
        rules.push({
          fieldId,
          message: 'Format de date invalide',
          validate: (value) => {
            if (!value.trim()) return true;
            const dateObj = new Date(value);
            return !isNaN(dateObj.getTime());
          }
        });
      }
    });

    // Ajouter les validateurs personnalisés
    customValidators.forEach(validator => {
      validator.fieldIds.forEach(fieldId => {
        rules.push({
          fieldId,
          message: 'Validation personnalisée',
          validate: (value, formValues) => {
            const errorMessage = validator.validate(value, formValues);
            return errorMessage === null || errorMessage === undefined;
          }
        });
      });
    });

    return rules;
  }, [formFields, customValidators]);

  // Fonction pour valider un champ spécifique
  const validateField = (fieldId: number): boolean => {
    const fieldRules = validationRules.filter(rule => rule.fieldId === fieldId);
    const value = formValues[fieldId] || '';
    
    for (const rule of fieldRules) {
      if (!rule.validate(value, formValues)) {
        setErrors(prev => ({
          ...prev,
          [fieldId]: rule.message
        }));
        
        // Pour les validateurs personnalisés, récupérer le message d'erreur exact
        const customValidator = customValidators.find(v => v.fieldIds.includes(fieldId));
        if (customValidator) {
          const customMessage = customValidator.validate(value, formValues);
          if (customMessage) {
            setErrors(prev => ({
              ...prev,
              [fieldId]: customMessage
            }));
          }
        }
        
        return false;
      }
    }
    
    // Supprimer l'erreur si le champ est valide
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
    
    return true;
  };

  // Fonction pour valider tout le formulaire
  const validateForm = (): boolean => {
    let isValid = true;

    // Regrouper les règles par fieldId pour éviter de vérifier plusieurs fois le même champ
    const fieldIds = Array.from(new Set(validationRules.map(rule => rule.fieldId)));
    
    fieldIds.forEach(fieldId => {
      if (!validateField(fieldId)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Fonction pour effacer toutes les erreurs
  const clearErrors = (): void => {
    setErrors({});
  };

  return {
    validateForm,
    errors,
    clearErrors,
    validateField
  };
};

export default useFormValidation;