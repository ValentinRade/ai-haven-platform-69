
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface TextAreaViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const TextAreaView: React.FC<TextAreaViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const fieldName = data.id || `textarea_${Date.now()}`;
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {data.title || "Bitte geben Sie Ihre ausführliche Antwort ein"}
      </h2>
      {data.description && (
        <p className="text-gray-600 mb-6">{data.description}</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fieldName} className="block mb-2">
            {data.label || "Ihre Antwort"}
          </Label>
          <Textarea
            id={fieldName}
            {...register(fieldName, { 
              required: data.required ? "Dieses Feld ist erforderlich" : false 
            })}
            placeholder={data.placeholder || ""}
            className="w-full min-h-[120px]"
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

export default TextAreaView;
