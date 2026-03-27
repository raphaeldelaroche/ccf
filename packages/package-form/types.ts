// Types pour les choix dans les champs de type SELECT, RADIO, CHECKBOX
export interface FieldChoice {
  text: string;
  value: string;
  isSelected?: boolean;
  price?: string;
}

// Type pour les inputs des champs complexes comme CHECKBOX
export interface FieldInput {
  id: string;
  label: string;
  name: string;
}

// Type pour les boutons d'un champ de page
export interface PageButton {
  type: string;
  text: string;
  imageUrl?: string;
  id?: number;
}

// ===== TYPES DE CHAMPS SPÉCIFIQUES =====

// Type de base pour tous les champs de formulaire
export interface BaseFormField {
  databaseId: number;
  type: string;
  label: string;
  isRequired: boolean;
  description: string | null;
  placeholder?: string;
  defaultValue?: string;
  cssClass?: string;
}

// Champ texte
interface TextFieldData extends BaseFormField {
  type: 'TEXT' | 'text';
  maxLength?: string | number;
  isPasswordInput?: boolean;
}

// Champ nombre
interface NumberFieldData extends BaseFormField {
  type: 'NUMBER' | 'number';
  numberFormat?: string;
  rangeMin?: string;
  rangeMax?: string;
  enablePrice?: boolean;
  validateState?: boolean;
}

// Champ date
interface DateFieldData extends BaseFormField {
  type: 'DATE' | 'date';
  calendarIconType?: string;
  calendarIconUrl?: string;
  dateFormat?: string;
  dateType?: 'datepicker' | 'datefield';
}

// Champ select
interface SelectFieldData extends BaseFormField {
  type: 'SELECT' | 'select';
  choices: FieldChoice[];
  enablePrice?: boolean;
}

// Champ checkbox
interface CheckboxFieldData extends BaseFormField {
  type: 'CHECKBOX' | 'checkbox';
  choices: FieldChoice[];
  inputs?: FieldInput[];
  enablePrice?: boolean;
}

// Champ radio
interface RadioFieldData extends BaseFormField {
  type: 'RADIO' | 'radio';
  choices: FieldChoice[];
  enablePrice?: boolean;
}

// Champ email
interface EmailFieldData extends BaseFormField {
  type: 'EMAIL' | 'email';
}

// Champ téléphone
interface PhoneFieldData extends BaseFormField {
  type: 'PHONE' | 'phone';
}

// Champ textarea
interface TextAreaFieldData extends BaseFormField {
  type: 'TEXTAREA' | 'textarea';
  maxLength?: string | number;
}

// Champ caché
interface HiddenFieldData extends BaseFormField {
  type: 'HIDDEN' | 'hidden';
}

// Champ de page (pour la pagination)
export interface PageFieldData extends BaseFormField {
  type: 'PAGE' | 'page';
  displayOnly: boolean;
  nextButton?: PageButton;
  previousButton?: PageButton;
}

// Union des types de champs
export type FormFieldData = 
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

// ===== TYPE GUARDS =====

export function isTextFieldData(field: FormFieldData): field is TextFieldData {
  return field.type === 'TEXT' || field.type === 'text';
}

export function isNumberFieldData(field: FormFieldData): field is NumberFieldData {
  return field.type === 'NUMBER' || field.type === 'number';
}

export function isDateFieldData(field: FormFieldData): field is DateFieldData {
  return field.type === 'DATE' || field.type === 'date';
}

export function isCheckboxFieldData(field: FormFieldData): field is CheckboxFieldData {
  return field.type === 'CHECKBOX' || field.type === 'checkbox';
}

export function isSelectFieldData(field: FormFieldData): field is SelectFieldData {
  return field.type === 'SELECT' || field.type === 'select';
}

export function isRadioFieldData(field: FormFieldData): field is RadioFieldData {
  return field.type === 'RADIO' || field.type === 'radio';
}

export function isEmailFieldData(field: FormFieldData): field is EmailFieldData {
  return field.type === 'EMAIL' || field.type === 'email';
}

export function isPhoneFieldData(field: FormFieldData): field is PhoneFieldData {
  return field.type === 'PHONE' || field.type === 'phone';
}

export function isTextAreaFieldData(field: FormFieldData): field is TextAreaFieldData {
  return field.type === 'TEXTAREA' || field.type === 'textarea';
}

export function isHiddenFieldData(field: FormFieldData): field is HiddenFieldData {
  return field.type === 'HIDDEN' || field.type === 'hidden';
}

export function isPageFieldData(field: FormFieldData): field is PageFieldData {
  return field.type === 'PAGE' || field.type === 'page';
}

// Type guard pour vérifier si un champ a des choices
export function hasChoices(field: FormFieldData): field is CheckboxFieldData | SelectFieldData | RadioFieldData {
  return 'choices' in field && Array.isArray(field.choices);
}

// Type guard pour vérifier si un champ a des inputs
export function hasInputs(field: FormFieldData): field is CheckboxFieldData {
  return 'inputs' in field && field.inputs != null;
}

// ===== INTERFACES EXISTANTES CONSERVÉES =====

// Interface pour la pagination du formulaire
export interface FormPagination {
  lastPageButton: {
    text: string;
    type: string;
  } | null;
  type?: string;
  style?: string;
  backgroundColor?: string | null;
  color?: string | null;
  display_progressbar_on_confirmation?: boolean;
  progressbar_completion_text?: string | null;
  pages?: string[];
}

// Structure complète d'un formulaire Gravity Form
export interface GFFormData {
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

// Interface pour la réponse de soumission de formulaire
export interface FormSubmissionResult {
  success: boolean;
  error?: string;
  entry?: {
    id: string;
    databaseId?: number;
    resumeToken?: string;
  } | null;
  targetPageNumber?: number;
  targetPageFormFields?: {
    nodes: Array<{
      databaseId: number;
      type: string;
    }>;
  };
}

// Interface pour les valeurs de checkbox
export interface CheckboxValue {
  inputId: number;
  value: string;
}

// Interface pour les valeurs d'email
export interface EmailValue {
  value: string;
  confirmationValue: string;
}

// Interface pour les valeurs de champs
export interface FieldValueInput {
  id: number;
  value?: string;
  checkboxValues?: CheckboxValue[];
  emailValues?: EmailValue;
  // Autres types de valeurs selon vos besoins
}

// Interface pour les paramètres de la demande de soumission de formulaire
export interface FormSubmissionRequestParams {
  formId: string;
  fieldValues: string;
  sourcePage?: string;
  targetPage?: string;
  saveAsDraft?: string;
}

export interface CustomValidator {
  fieldIds: number[];
  validate: (value: string, formValues: Record<number, string>) => string | null | undefined;
}

export type FormValues = Record<number, string>;

// ===== TYPES POUR GraphQL (ajoutés) =====

// Types pour les réponses de soumission GraphQL
export interface SubmitGfFormResponse {
  submitGfForm: {
    confirmation: {
      type: string;
      message: string;
      url?: string;
    } | null;
    errors: Array<{
      id: string;
      message: string;
    }>;
    entry: {
      id: string;
      databaseId?: number;
      resumeToken?: string;
    } | null;
    targetPageNumber?: number;
    targetPageFormFields?: {
      nodes: Array<{
        databaseId: number;
        type: string;
      }>;
    };
  };
}

// Types pour les variables de mutation
export interface SubmitFormVariables {
  id: string;
  fieldValues: FieldValueInput[];
  sourcePage?: number;
  targetPage?: number;
  saveAsDraft?: boolean;
  [key: string]: unknown; // Signature d'index pour compatibilité avec fetchGraphQL
}

// ===== FONCTIONS UTILITAIRES =====

// Fonction helper pour typer les réponses de fetchGraphQL
export function assertSubmitFormResponse(response: unknown): SubmitGfFormResponse {
  return response as SubmitGfFormResponse;
}

// Helper pour typer fetchGraphQL sans la modifier
export function typedFetchGraphQL<T>(
  fetchGraphQL: (query: string, variables?: Record<string, unknown>) => Promise<unknown>,
  query: string, 
  variables?: Record<string, unknown>
): Promise<T> {
  return fetchGraphQL(query, variables) as Promise<T>;
}