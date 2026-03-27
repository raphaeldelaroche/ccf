'use client';

import { CustomValidator } from '../types';

/**
 * Bibliothèque de validateurs réutilisables pour les formulaires
 */
export const FormValidators = {
  /**
   * Valide que le champ a une longueur minimale
   * @param fieldIds IDs des champs à valider
   * @param minLength Longueur minimale requise
   * @param message Message d'erreur personnalisé (optionnel)
   */
  minLength(fieldIds: number[], minLength: number, message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value || value.length < minLength) {
          return message || `Ce champ doit contenir au moins ${minLength} caractères`;
        }
        return null;
      }
    };
  },

  /**
   * Valide que le champ a une longueur maximale
   * @param fieldIds IDs des champs à valider
   * @param maxLength Longueur maximale autorisée
   * @param message Message d'erreur personnalisé (optionnel)
   */
  maxLength(fieldIds: number[], maxLength: number, message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (value && value.length > maxLength) {
          return message || `Ce champ ne doit pas dépasser ${maxLength} caractères`;
        }
        return null;
      }
    };
  },

  /**
   * Valide que le champ correspond à un motif d'expression régulière
   * @param fieldIds IDs des champs à valider
   * @param pattern Expression régulière à vérifier
   * @param message Message d'erreur personnalisé (optionnel)
   */
  pattern(fieldIds: number[], pattern: RegExp, message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (value && !pattern.test(value)) {
          return message || `Format invalide`;
        }
        return null;
      }
    };
  },

  /**
   * Valide que deux champs ont la même valeur (comme pour la confirmation de mot de passe)
   * @param fieldId ID du champ à valider
   * @param matchFieldId ID du champ avec lequel la valeur doit correspondre
   * @param message Message d'erreur personnalisé (optionnel)
   */
  match(fieldId: number, matchFieldId: number, message?: string): CustomValidator {
    return {
      fieldIds: [fieldId],
      validate: (value, formValues) => {
        if (value !== formValues[matchFieldId]) {
          return message || `Les valeurs ne correspondent pas`;
        }
        return null;
      }
    };
  },

  /**
   * Valide qu'un champ est requis uniquement si un autre champ a une certaine valeur
   * @param fieldId ID du champ à valider
   * @param dependentFieldId ID du champ dont dépend la validation
   * @param dependentValue Valeur du champ dépendant qui rend ce champ obligatoire
   * @param message Message d'erreur personnalisé (optionnel)
   */
  requiredIf(fieldId: number, dependentFieldId: number, dependentValue: string, message?: string): CustomValidator {
    return {
      fieldIds: [fieldId],
      validate: (value, formValues) => {
        if (formValues[dependentFieldId] === dependentValue && (!value || value.trim() === '')) {
          return message || `Ce champ est obligatoire`;
        }
        return null;
      }
    };
  },

  /**
   * Valide que le champ contient une valeur numérique dans une plage spécifiée
   * @param fieldIds IDs des champs à valider
   * @param min Valeur minimale (optionnelle)
   * @param max Valeur maximale (optionnelle)
   */
  range(fieldIds: number[], min?: number, max?: number): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return `Veuillez entrer un nombre valide`;
        }
        
        if (min !== undefined && numValue < min) {
          return `La valeur doit être supérieure ou égale à ${min}`;
        }
        
        if (max !== undefined && numValue > max) {
          return `La valeur doit être inférieure ou égale à ${max}`;
        }
        
        return null;
      }
    };
  },

  /**
   * Valide que le champ contient une adresse email valide
   * @param fieldIds IDs des champs à valider
   * @param message Message d'erreur personnalisé (optionnel)
   */
  email(fieldIds: number[], message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return message || `Adresse email invalide`;
        }
        
        return null;
      }
    };
  },

  /**
   * Valide que le champ contient un numéro de téléphone valide
   * @param fieldIds IDs des champs à valider
   * @param format Format spécifique à valider ('fr' pour la France, etc.)
   * @param message Message d'erreur personnalisé (optionnel)
   */
  phone(fieldIds: number[], format: 'fr' | 'international' = 'international', message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        let isValid = false;
        if (format === 'fr') {
          // Format français: +33... ou 0...
          isValid = /^(\+33|0)[1-9](\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2})$/.test(value.replace(/[-\.]/g, ''));
        } else {
          // Format international plus permissif
          isValid = /^(\+|00)?[0-9\s\-\(\)\.]{8,20}$/.test(value);
        }
        
        if (!isValid) {
          return message || `Numéro de téléphone invalide`;
        }
        
        return null;
      }
    };
  },

  /**
   * Valide que le champ contient un code postal valide
   * @param fieldIds IDs des champs à valider
   * @param country Code du pays ('FR' pour la France, etc.)
   * @param message Message d'erreur personnalisé (optionnel)
   */
  postalCode(fieldIds: number[], country: 'FR' | 'US' | 'CA' = 'FR', message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        let isValid = false;
        if (country === 'FR') {
          // Code postal français: 5 chiffres
          isValid = /^\d{5}$/.test(value);
        } else if (country === 'US') {
          // Code postal US: 5 chiffres ou 5+4
          isValid = /^\d{5}(-\d{4})?$/.test(value);
        } else if (country === 'CA') {
          // Code postal canadien: A1A 1A1
          isValid = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value);
        }
        
        if (!isValid) {
          return message || `Code postal invalide`;
        }
        
        return null;
      }
    };
  },

  /**
   * Valide une date dans une plage spécifiée
   * @param fieldIds IDs des champs à valider
   * @param minDate Date minimale (optionnelle)
   * @param maxDate Date maximale (optionnelle)
   * @param message Message d'erreur personnalisé (optionnel)
   */
  dateRange(fieldIds: number[], minDate?: Date, maxDate?: Date, message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        try {
          const date = new Date(value);
          
          if (isNaN(date.getTime())) {
            return `Date invalide`;
          }
          
          if (minDate && date < minDate) {
            return message || `La date doit être après le ${minDate.toLocaleDateString()}`;
          }
          
          if (maxDate && date > maxDate) {
            return message || `La date doit être avant le ${maxDate.toLocaleDateString()}`;
          }
          
          return null;
        } catch (error) {
          return `Format de date invalide : ${error}`;
        }
      }
    };
  },

  /**
   * Valide qu'un champ contient au moins un caractère spécial
   * @param fieldIds IDs des champs à valider
   * @param message Message d'erreur personnalisé (optionnel)
   */
  hasSpecialChar(fieldIds: number[], message?: string): CustomValidator {
    return {
      fieldIds,
      validate: (value) => {
        if (!value) return null;
        
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
        if (!specialCharRegex.test(value)) {
          return message || `Doit contenir au moins un caractère spécial`;
        }
        
        return null;
      }
    };
  },

  /**
   * Validateur personnalisé avec une fonction de validation
   * @param fieldIds IDs des champs à valider
   * @param validationFn Fonction de validation personnalisée
   */
  custom(fieldIds: number[], validationFn: (value: string, formValues: Record<number, string>) => string | null | undefined): CustomValidator {
    return {
      fieldIds,
      validate: validationFn
    };
  }
};

export default FormValidators;