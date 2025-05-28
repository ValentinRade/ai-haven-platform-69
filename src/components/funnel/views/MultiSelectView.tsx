
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface MultiSelectViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const MultiSelectView: React.FC<MultiSelectViewProps> = ({ form, data }) => {
  const { setValue, watch } = form;
  const fieldName = data.id || data.stepId || `multiselect_${Date.now()}`;
  const currentValues = watch(fieldName) || [];
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.content?.headline || data.title || "Mehrere Optionen auswählen";
  const description = data.content?.text || data.description;
  
  const handleCheckedChange = (value: string, checked: boolean) => {
    const updatedValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item: string) => item !== value);
    
    setValue(fieldName, updatedValues);
  };

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

      {/* Show options after text animation completes */}
      {((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="space-y-3">
          {(data.options || []).map((option) => (
            <div 
              key={option.id} 
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectView;
