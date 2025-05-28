
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface TextInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const TextInputView: React.FC<TextInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const fieldName = data.id || `text_${Date.now()}`;
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.title || data.content?.headline || "Bitte geben Sie Ihre Antwort ein";
  const description = data.description || data.content?.text;
  const placeholder = data.placeholder || data.inputConfig?.placeholder || "";
  
  const isRequired = data.required || 
                    (data.inputConfig?.validation?.required) || 
                    false;

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
      )}
    </div>
  );
};

export default TextInputView;
