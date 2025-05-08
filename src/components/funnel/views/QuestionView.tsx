
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface QuestionViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
  onOptionSelect?: (optionId: string) => void;
}

const QuestionView: React.FC<QuestionViewProps> = ({ form, data, onOptionSelect }) => {
  const { setValue, watch } = form;
  const fieldName = data.id || data.stepId || `question_${Date.now()}`;
  const currentValue = watch(fieldName);
  
  // Extract content from either format
  const title = data.content?.headline || data.title || "Bitte wählen Sie eine Option";
  const description = data.content?.text || data.description;
  
  // Extract and normalize options
  const options = data.options || [];
  
  const handleSelection = (value: string) => {
    setValue(fieldName, value);
    
    // If we have a callback for option selection, call it
    if (onOptionSelect) {
      onOptionSelect(value);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}

      <RadioGroup
        value={currentValue}
        onValueChange={handleSelection}
        className="space-y-3"
      >
        {options.map((option) => (
          <div 
            key={option.id} 
            className={`flex items-center rounded-lg border p-4 transition-all ${
              currentValue === option.id 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 hover:border-gray-300"
            }`}
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
    </div>
  );
};

export default QuestionView;
