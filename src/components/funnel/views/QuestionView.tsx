
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface QuestionViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
  onOptionSelect?: (optionId: string) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ form, data, onOptionSelect }) => {
  const { setValue, watch, register, formState: { errors } } = form;
  const fieldName = data.id || data.stepId || `question_${Date.now()}`;
  const currentValue = watch(fieldName);
  
  // Extract content from either format
  const title = data.content?.headline || data.title || "Bitte wähle eine Option";
  const description = data.content?.text || data.description;
  
  // Extract and normalize options
  const options = data.options || [];
  
  const handleSelection = (value: string) => {
    // Set the value in the form
    setValue(fieldName, value);
    
    console.log(`Selection made: ${value} for field: ${fieldName}`);
    
    // If we have a callback for option selection, call it
    if (onOptionSelect) {
      onOptionSelect(value);
    }
  };

  // STRICT CONTROL: Only show text input when BOTH conditions are met:
  // 1. No options are provided AND
  // 2. Explicitly configured as inputType="text"
  const showTextInput = 
    options.length === 0 && 
    data.inputConfig?.inputType === "text";
  
  // Log the decision factors for debugging with more clarity
  console.log(`QuestionView for ${fieldName} - Text input visibility decision:`, {
    hasOptions: options.length > 0,
    optionsCount: options.length,
    hasInputConfig: !!data.inputConfig,
    inputType: data.inputConfig?.inputType || "none",
    showTextInput: showTextInput
  });
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}

      {/* Show radio options if available */}
      {options.length > 0 && (
        <RadioGroup
          value={currentValue}
          onValueChange={handleSelection}
          className="space-y-3"
        >
          {options.map((option) => (
            <div 
              key={option.id} 
              className={`flex items-center rounded-lg border p-4 transition-all cursor-pointer ${
                currentValue === option.id 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelection(option.id)}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                className="mr-4"
              />
              <Label 
                htmlFor={option.id} 
                className="flex-grow cursor-pointer font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Show text input ONLY under strict control */}
      {showTextInput && (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor={`${fieldName}_text`} className="block mb-2">
              {data.label || "Deine Antwort"}
            </Label>
            <Input
              id={`${fieldName}_text`}
              {...register(fieldName, { 
                required: data.required ? "Dieses Feld ist erforderlich" : false 
              })}
              placeholder={data.placeholder || "Bitte gib deine Antwort ein"}
              className="w-full"
            />
            {errors[fieldName] && (
              <p className="text-destructive text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionView;
