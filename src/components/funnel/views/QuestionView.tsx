
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
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.content?.headline || data.title || "Bitte wähle eine Option";
  const description = data.content?.text || data.description;
  
  const options = data.options || [];
  
  const handleSelection = (value: string) => {
    setValue(fieldName, value);
    console.log(`Selection made: ${value} for field: ${fieldName}`);
    
    if (onOptionSelect) {
      onOptionSelect(value);
    }
  };

  const showTextInput = 
    options.length === 0 && 
    data.inputConfig?.inputType === "text";
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        <TypewriterText 
          content={title} 
          speed={8}
          onComplete={() => setTitleAnimationComplete(true)}
        />
      </h2>
      {description && titleAnimationComplete && (
        <div className="text-gray-600 mb-6">
          <TypewriterText 
            content={description} 
            speed={8} 
            onComplete={() => setTextAnimationComplete(true)}
          />
        </div>
      )}

      {/* Show radio options after text animation completes */}
      {options.length > 0 && ((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
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

      {/* Show text input after text animation completes */}
      {showTextInput && ((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="space-y-4 mt-4">
          <div>
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
