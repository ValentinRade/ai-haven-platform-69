
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";

interface NumberInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const NumberInputView: React.FC<NumberInputViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const fieldName = data.id || data.stepId || `number_${Date.now()}`;
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {data.content?.headline || data.title || "Bitte geben Sie einen Zahlenwert ein"}
      </h2>
      {(data.content?.text || data.description) && (
        <p className="text-gray-600 mb-6">{data.content?.text || data.description}</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fieldName} className="block mb-2">
            {data.label || "Zahlenwert"}
          </Label>
          <Input
            id={fieldName}
            type="number"
            {...register(fieldName, { 
              required: data.required ? "Dieses Feld ist erforderlich" : false,
              min: {
                value: data.min || -Infinity,
                message: `Der Mindestwert ist ${data.min}`
              },
              max: {
                value: data.max || Infinity,
                message: `Der Maximalwert ist ${data.max}`
              }
            })}
            placeholder={data.placeholder || ""}
            className="w-full"
            min={data.min}
            max={data.max}
            step={data.step || "1"}
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

export default NumberInputView;
