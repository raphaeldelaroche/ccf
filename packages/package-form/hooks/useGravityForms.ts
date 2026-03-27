'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/packages/package-fetch-graphql/fetchGraphQL';
import { GFFormData } from '../types';

interface GFFormResponse {
  gfForm: GFFormData;
}

/**
 * Hook pour récupérer les données d'un formulaire Gravity Forms
 * @param formId - L'ID du formulaire à récupérer
 */
export const useGravityForm = (formId: string | number) => {
  // État pour stocker les données du formulaire
  const [formData, setFormData] = useState<GFFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormFetched, setIsFormFetched] = useState<boolean>(false);

  useEffect(() => {
    // Éviter les appels multiples
    if (isFormFetched) {
      return;
    }

    const getFormData = async () => {
      try {
        setLoading(true);
        setIsFormFetched(true);

        // Construction de la requête GraphQL avec l'ajout de isPasswordInput
        const GET_FORM_QUERY = `
          query GetGravityForm($id: ID!) {
            gfForm(id: $id, idType: DATABASE_ID) {
              cssClass
              databaseId
              dateCreated
              formFields(first: 200) {
                nodes {
                  databaseId
                  type
                  ... on TextField {
                    label
                    isRequired
                    description
                    placeholder
                    defaultValue
                    maxLength
                    isPasswordInput
                  }
                  ... on SelectField {
                    label
                    isRequired
                    description
                    placeholder
                    defaultValue
                    choices {
                      text
                      value
                      isSelected
                    }
                  }
                  ... on TextAreaField {
                    label
                    isRequired
                    description
                    placeholder
                    defaultValue
                    maxLength
                  }
                  ... on EmailField {
                    label
                    isRequired
                    description
                    placeholder
                  }
                  ... on PhoneField {
                    label
                    isRequired
                    description
                    placeholder
                  }
                  ... on NumberField {
                    label
                    isRequired
                    description
                    placeholder
                    defaultValue
                    numberFormat
                    rangeMin
                    rangeMax
                  }
                  ... on RadioField {
                    label
                    isRequired
                    description
                    choices {
                      text
                      value
                      isSelected
                    }
                  }
                  ... on CheckboxField {
                    label
                    isRequired
                    description
                    choices {
                      text
                      value
                      isSelected
                    }
                    inputs {
                      id
                      label
                      name
                    }
                  }
                  ... on DateField {
                    label
                    isRequired
                    description
                    placeholder
                    dateFormat
                    calendarIconType
                    calendarIconUrl
                    dateType
                    defaultValue
                  }
                  ... on HiddenField {
                    label
                    defaultValue
                  }
                  ... on PageField {
                    displayOnly
                    nextButton {
                      text
                      type
                    }
                    previousButton {
                      text
                      type
                    }
                  }
                }
              }
              pagination {
                lastPageButton {
                  text
                  type
                }
                type
                style
                backgroundColor
                color
              }
              submitButton {
                text
                type
              }
              title
            }
          }
        `;

        const response = await fetchGraphQL<GFFormResponse>(GET_FORM_QUERY, { id: formId });
        
        if (response && response.gfForm) {
          setFormData(response.gfForm);
        } else {
          throw new Error(`Données du formulaire ${formId} non disponibles`);
        }
      } catch (err) {
        console.error(`Erreur lors de la récupération du formulaire ${formId}:`, err);
        setError('Impossible de charger le formulaire. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    getFormData();
  }, [formId, isFormFetched]);

  return { formData, loading, error };
};