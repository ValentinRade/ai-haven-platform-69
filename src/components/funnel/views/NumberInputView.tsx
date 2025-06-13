
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface NumberInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const NumberInputView: React.FC<NumberInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const fieldName = data.id || data.stepId || `number_${Date.now()}`;
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.content?.headline || data.title || "Bitte geben Sie einen Zahlenwert ein";
  const description = data.content?.text || data.description;
  
  const isRequired = data.required !== undefined ? data.required : 
                   data.inputConfig?.validation?.required !== undefined ? data.inputConfig.validation.required : false;
  
  const placeholderText = data.placeholder || 
                        data.inputConfig?.placeholder || 
                        "Bitte Zahl eingeben";
  
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

      {((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="space-y-4">
          <div>
            <Input
              id={fieldName}
              type="text"
              {...register(fieldName, { 
                required: isRequired ? "Dieses Feld ist erforderlich" : false
              })}
              placeholder={placeholderText}
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

export default NumberInputView;
