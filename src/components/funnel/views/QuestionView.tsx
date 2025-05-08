
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface QuestionViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const QuestionView: React.FC<QuestionViewProps> = ({ form, data }) => {
  const { setValue, watch } = form;
  const fieldName = data.id || `question_${Date.now()}`;
  const currentValue = watch(fieldName);
  
  const handleSelection = (value: string) => {
    setValue(fieldName, value);
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {data.title || "Bitte wählen Sie eine Option"}
      </h2>
      {data.description && (
        <p className="text-gray-600 mb-6">{data.description}</p>
      )}

      <RadioGroup
        value={currentValue}
        onValueChange={handleSelection}
        className="space-y-3"
      >
        {(data.options || []).map((option) => (
          <div 
            key={option.id} 
            className={`flex items-center rounded-lg border p-4 transition-all ${
              currentValue === option.value 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem 
              value={option.value} 
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
