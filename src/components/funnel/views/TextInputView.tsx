
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface TextInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const TextInputView: React.FC<TextInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  
  // Generate a consistent field name - prioritize data.id or create one with a timestamp
  const fieldName = data.id || `text_${Date.now()}`;
  
  // Log detailed information about the input field for debugging
  console.log("TextInputView rendering with data:", {
    fieldName,
    title: data.title || data.content?.headline,
    description: data.description || data.content?.text,
    label: data.label,
    required: data.required,
    validation: data.inputConfig?.validation,
    placeholder: data.placeholder || data.inputConfig?.placeholder,
    hasErrors: !!errors[fieldName]
  });

  // Use content fields as fallbacks if direct properties aren't available
  const title = data.title || data.content?.headline || "Bitte geben Sie Ihre Antwort ein";
  const description = data.description || data.content?.text;
  const label = data.label || "Ihre Antwort";
  const placeholder = data.placeholder || data.inputConfig?.placeholder || "";
  
  // Determine if the field is required from any available source
  const isRequired = data.required || 
                    (data.inputConfig?.validation?.required) || 
                    false;

  // Prepare the validation rules with better fallbacks
  const validationRules = {
    required: isRequired ? "Dieses Feld ist erforderlich" : false,
    minLength: data.inputConfig?.validation?.minLength ? 
      { value: data.inputConfig.validation.minLength, message: `Mindestens ${data.inputConfig.validation.minLength} Zeichen erforderlich` } : 
      undefined,
    maxLength: data.inputConfig?.validation?.maxLength ? 
      { value: data.inputConfig.validation.maxLength, message: `Maximal ${data.inputConfig.validation.maxLength} Zeichen erlaubt` } : 
      undefined,
    pattern: data.inputConfig?.validation?.pattern ? 
      { value: new RegExp(data.inputConfig.validation.pattern), message: "Ungültiges Format" } : 
      undefined
  };
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {title}
      </h2>
      
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fieldName} className="block mb-2">
            {label}
          </Label>
          <Input
            id={fieldName}
            {...register(fieldName, validationRules)}
            placeholder={placeholder}
            className="w-full"
            aria-invalid={errors[fieldName] ? "true" : "false"}
          />
          {errors[fieldName] && (
            <p className="text-destructive text-sm mt-1">
              {errors[fieldName]?.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextInputView;
