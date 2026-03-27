import { fetchGraphQL } from '@/packages/package-fetch-graphql/fetchGraphQL';
import { 
  FieldValueInput, 
  FormSubmissionResult, 
  FormSubmissionRequestParams,
  SubmitFormVariables,
  assertSubmitFormResponse
} from '../types';

const SUBMIT_FORM_MUTATION = `
  mutation SubmitForm($id: ID!, $fieldValues: [FormFieldValuesInput!]!, $sourcePage: Int, $targetPage: Int, $saveAsDraft: Boolean) {
    submitGfForm(
      input: {
        id: $id
        fieldValues: $fieldValues
        sourcePage: $sourcePage
        targetPage: $targetPage
        saveAsDraft: $saveAsDraft
      }
    ) {
      confirmation {
        type    
        message
        url
      }
      errors {
        id
        message
      }
      entry {
        id
        ... on GfSubmittedEntry {
          databaseId
        }
        ... on GfDraftEntry {
          resumeToken
        }
      }
      targetPageNumber
      targetPageFormFields {
        nodes {
          databaseId
          type
        }
      }
    }
  }
`;

/**
 * Fonction pour soumettre un formulaire Gravity Form
 * @param formData - Les données du formulaire à soumettre
 * @returns Un objet contenant le résultat de la soumission
 */
export async function submitForm(formData: FormData): Promise<FormSubmissionResult> {
  try {
    // Extraire les paramètres de la requête du FormData
    const params: FormSubmissionRequestParams = {
      formId: formData.get('formId') as string,
      fieldValues: formData.get('fieldValues') as string,
    };

    // Vérifier si c'est une requête de validation de page
    const sourcePage = formData.get('sourcePage');
    const targetPage = formData.get('targetPage');
    const saveAsDraft = formData.get('saveAsDraft');

    if (sourcePage) params.sourcePage = sourcePage as string;
    if (targetPage) params.targetPage = targetPage as string;
    if (saveAsDraft) params.saveAsDraft = saveAsDraft as string;

    if (!params.formId) {
      throw new Error('Form ID is required');
    }

    // Récupérer les fieldValues à partir du FormData
    let fieldValues: FieldValueInput[] = [];
    
    if (params.fieldValues) {
      try {
        fieldValues = JSON.parse(params.fieldValues) as FieldValueInput[];
      } catch (e) {
        console.error('Error parsing fieldValues:', e);
      }
    }

    // Préparer les variables pour la requête GraphQL (version typée)
    const variables: SubmitFormVariables = {
      id: params.formId,
      fieldValues: fieldValues
    };

    // Ajouter les paramètres de pagination si présents
    if (params.sourcePage) variables.sourcePage = parseInt(params.sourcePage);
    if (params.targetPage) variables.targetPage = parseInt(params.targetPage);
    if (params.saveAsDraft) variables.saveAsDraft = params.saveAsDraft === 'true';

    console.log(SUBMIT_FORM_MUTATION);
    console.log(JSON.stringify(variables, null, 2));

    // Soumettre le formulaire via GraphQL
    const rawResponse = await fetchGraphQL(SUBMIT_FORM_MUTATION, variables);
    
    // Utiliser la fonction helper pour typer la réponse
    const response = assertSubmitFormResponse(rawResponse);

    // Accès typé aux propriétés
    const submitResult = response?.submitGfForm;

    // Vérifier s'il y a des erreurs dans la réponse
    if (submitResult?.errors?.length > 0) {
      return {
        success: false,
        error: submitResult.errors.map((err) => err.message).join(', '),
        targetPageNumber: submitResult.targetPageNumber,
        targetPageFormFields: submitResult.targetPageFormFields
      };
    }

    // Retourner le résultat de la soumission
    return {
      success: true,
      entry: submitResult?.entry,
      targetPageNumber: submitResult?.targetPageNumber,
      targetPageFormFields: submitResult?.targetPageFormFields
    };
  } catch (error: unknown) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}