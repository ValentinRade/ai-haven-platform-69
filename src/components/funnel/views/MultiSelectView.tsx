
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "../../chat/TypewriterText";

interface MultiSelectViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const MultiSelectView: React.FC<MultiSelectViewProps> = ({ form, data }) => {
  const { setValue, watch } = form;
  const fieldName = data.id || data.stepId || `multiselect_${Date.now()}`;
  const currentValues = watch(fieldName) || [];
  const [optionsVisible, setOptionsVisible] = useState<string[]>([]);
  
  const handleCheckedChange = (value: string, checked: boolean) => {
    const updatedValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item: string) => item !== value);
    
    setValue(fieldName, updatedValues);
  };

  const showOption = (optionId: string) => {
    setOptionsVisible(prev => [...prev, optionId]);
  };

  return (
    <div>
      <TypewriterText 
        content={`## ${data.content?.headline || data.title || "Mehrere Optionen auswählen"}`}
        speed={30}
      />
      {(data.content?.text || data.description) && (
        <div className="mt-4">
          <TypewriterText 
            content={data.content?.text || data.description || ""}
            speed={30}
          />
        </div>
      )}

      <div className="space-y-3 mt-6">
        {(data.options || []).map((option, index) => (
          <div key={option.id}>
            {/* Animation text */}
            {!optionsVisible.includes(option.id) && (
              <TypewriterText
                content={`☐ ${option.label}`}
                speed={30}
                onComplete={() => {
                  setTimeout(() => {
                    showOption(option.id);
                  }, index * 200); // Stagger the appearance
                }}
              />
            )}
            
            {/* Actual clickable option */}
            {optionsVisible.includes(option.id) && (
              <div 
                className={`flex items-center rounded-lg border p-4 transition-all ${
                  currentValues.includes(option.id) 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Checkbox 
                  id={option.id}
                  checked={currentValues.includes(option.id)}
                  onCheckedChange={(checked) => handleCheckedChange(option.id, checked as boolean)}
                  className="mr-4"
                />
                <Label 
                  htmlFor={option.id} 
                  className="flex-grow cursor-pointer font-normal"
                >
                  {option.label}
                </Label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiSelectView;
