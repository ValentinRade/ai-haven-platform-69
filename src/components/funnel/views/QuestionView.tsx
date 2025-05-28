
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface QuestionViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
  onOptionSelect?: (optionId: string) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ form, data, onOptionSelect }) => {
  const { setValue, watch, register, formState: { errors } } = form;
  const fieldName = data.id || data.stepId || `question_${Date.now()}`;
  const currentValue = watch(fieldName);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
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
    // But do NOT automatically advance to the next step!
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
        <TypewriterText 
          content={title} 
          speed={15}
          onComplete={() => setTextAnimationComplete(true)}
        />
      </h2>
      {description && (
        <div className="text-gray-600 mb-6">
          <TypewriterText content={description} speed={15} />
        </div>
      )}

      {/* Show radio options immediately after text animation completes */}
      {options.length > 0 && textAnimationComplete && (
        <div className="space-y-3">
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
              <input
                type="radio"
                id={option.id}
                name={fieldName}
                value={option.id}
                checked={currentValue === option.id}
                onChange={() => handleSelection(option.id)}
                className="mr-4 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <Label 
                htmlFor={option.id} 
                className="flex-grow cursor-pointer font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Show text input ONLY under strict control - immediately after text animation completes */}
      {showTextInput && textAnimationComplete && (
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
