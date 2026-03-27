'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormFieldData } from '../types';
import DateSelector from '@/components/ui/date-selector';

interface FormFieldProps {
  field: FormFieldData;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const { databaseId, type, label, isRequired, description } = field;
  
  switch (type) {

    case 'SELECT':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select 
            name={`field_${databaseId}`}
            value={value} 
            onValueChange={onChange}
          >
            <SelectTrigger id={`field-${databaseId}`} className={`w-full ${error ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Sélectionner une option" />
            </SelectTrigger>
            <SelectContent>
              {field.choices?.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
      
    case 'RADIO':
      return (
        <div className="space-y-2">
          <Label className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <RadioGroup
            value={value}
            onValueChange={onChange}
            className="flex flex-col space-y-2"
          >
            {field.choices?.map((choice) => (
              <div key={choice.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  id={`field-${databaseId}-${choice.value}`} 
                  value={choice.value}
                />
                <Label htmlFor={`field-${databaseId}-${choice.value}`} className="cursor-pointer">
                  {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
      
    case 'CHECKBOX':
      // Pour les checkbox, la valeur est une chaîne avec des valeurs séparées par des virgules
      const selectedValues = value ? value.split(',') : [];
      
      const handleCheckboxChange = (choiceValue: string, checked: boolean) => {
        let newValues: string[];
        
        if (checked) {
          newValues = [...selectedValues, choiceValue];
        } else {
          newValues = selectedValues.filter(val => val !== choiceValue);
        }
        
        onChange(newValues.join(','));
      };
      
      return (
        <div className="space-y-2">
          <Label className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="flex flex-col space-y-2">
            {field.choices?.map((choice, index) => {
              // Trouver l'input correspondant à cette option
              const input = field.inputs && field.inputs.length > index 
                ? field.inputs[index] 
                : null;
              
              return (
                <div key={choice.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${databaseId}-${choice.value}`}
                    // Utiliser l'ID d'input s'il existe, sinon utiliser l'ID du champ
                    name={input ? `field_${String(input.id).replace('.', '_')}` : `field_${databaseId}_${index + 1}`}
                    checked={selectedValues.includes(choice.value)}
                    onCheckedChange={(checked: boolean | 'indeterminate') => 
                      handleCheckboxChange(choice.value, checked === true)
                    }
                  />
                  <Label htmlFor={`field-${databaseId}-${choice.value}`} className="cursor-pointer">
                    {choice.text}
                  </Label>
                </div>
              );
            })}
          </div>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'NUMBER':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
            placeholder={field.placeholder || ''}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'TEXT':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            type={field.isPasswordInput ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
            placeholder={field.placeholder || ''}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'EMAIL':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
            placeholder={field.placeholder}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'PHONE':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
            placeholder={field.placeholder || ''}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'TEXTAREA':
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            className={`min-h-[100px] ${error ? 'border-red-500' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'DATE':
      // Cast du field en DateFieldData pour accéder aux propriétés spécifiques
      // const dateField = field as DateFieldData;
      
      return (
        <div className="space-y-2">
          <Label htmlFor={`field-${databaseId}`} className="flex">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <DateSelector
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            value={value}
            onChange={onChange}
            error={error}
            placeholder={field.placeholder || 'Sélectionner une date'}
            className={error ? 'border-red-500' : ''}
            required={isRequired}
          />
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {/* Champ caché pour assurer la compatibilité avec Gravity Forms */}
          <input 
            type="hidden" 
            id={`field-${databaseId}-hidden`}
            name={`field_${databaseId}`} 
            value={value || ''}
          />
        </div>
      );
    
    case 'HIDDEN':
      return (
        <div>
          <input
            id={`field-${databaseId}`}
            name={`field_${databaseId}`}
            type="hidden"
            value={value || field.defaultValue || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          />
        </div>
      );

    default:
      return (
        <div className="p-4 border rounded bg-gray-50">
          <p>Champ non pris en charge: {type}</p>
        </div>
      );
  }
};

export default FormField;