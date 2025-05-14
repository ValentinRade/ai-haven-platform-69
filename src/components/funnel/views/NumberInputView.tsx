
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface NumberInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const NumberInputView: React.FC<NumberInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  
  // Use a more reliable field name generation strategy
  const fieldName = data.id || data.stepId || `number_${Date.now()}`;
  
  // Add logging to diagnose issues
  console.log("Rendering NumberInputView with data:", {
    fieldName,
    dataId: data.id,
    stepId: data.stepId,
    label: data.label,
    min: data.min,
    max: data.max,
    required: data.required,
    step: data.step,
    content: data.content,
    inputConfig: data.inputConfig
  });
  
  // Extract validation options with more robust fallbacks
  const minValue = data.min !== undefined ? data.min : 
                 data.inputConfig?.validation?.min !== undefined ? data.inputConfig.validation.min : -Infinity;
  
  const maxValue = data.max !== undefined ? data.max : 
                 data.inputConfig?.validation?.max !== undefined ? data.inputConfig.validation.max : Infinity;
                 
  const isRequired = data.required !== undefined ? data.required : 
                   data.inputConfig?.validation?.required !== undefined ? data.inputConfig.validation.required : false;
                   
  const stepValue = data.step !== undefined ? data.step : 
                  data.inputConfig?.step !== undefined ? data.inputConfig.step : "1";
  
  // Get user-friendly labels with robust defaults
  const inputLabel = data.label || 
                   data.content?.headline || 
                   "Zahlenwert eingeben";
  
  const placeholderText = data.placeholder || 
                        data.inputConfig?.placeholder || 
                        "Bitte Zahl eingeben";
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {data.content?.headline || data.title || "Bitte geben Sie einen Zahlenwert ein"}
      </h2>
      
      {(data.content?.text || data.description) && (
        <p className="text-gray-600 mb-6">{data.content?.text || data.description}</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fieldName} className="block mb-2">
            {inputLabel}
          </Label>
          
          <Input
            id={fieldName}
            type="number"
            {...register(fieldName, { 
              required: isRequired ? "Dieses Feld ist erforderlich" : false,
              min: {
                value: minValue,
                message: `Der Mindestwert ist ${minValue !== -Infinity ? minValue : 0}`
              },
              max: {
                value: maxValue,
                message: `Der Maximalwert ist ${maxValue !== Infinity ? maxValue : ''}`
              }
            })}
            placeholder={placeholderText}
            className="w-full"
            min={minValue !== -Infinity ? minValue : undefined}
            max={maxValue !== Infinity ? maxValue : undefined}
            step={stepValue}
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

export default NumberInputView;
