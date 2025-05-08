
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface TextInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const TextInputView: React.FC<TextInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const fieldName = data.id || `text_${Date.now()}`;
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {data.title || "Bitte geben Sie Ihre Antwort ein"}
      </h2>
      {data.description && (
        <p className="text-gray-600 mb-6">{data.description}</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fieldName} className="block mb-2">
            {data.label || "Ihre Antwort"}
          </Label>
          <Input
            id={fieldName}
            {...register(fieldName, { 
              required: data.required ? "Dieses Feld ist erforderlich" : false 
            })}
            placeholder={data.placeholder || ""}
            className="w-full"
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

export default TextInputView;
