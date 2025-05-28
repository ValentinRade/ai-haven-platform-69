
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface DateInputViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const DateInputView: React.FC<DateInputViewProps> = ({ form, data }) => {
  const { register, setValue, formState: { errors } } = form;
  const fieldName = data.id || `date_${Date.now()}`;
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.title || data.content?.headline || "Bitte wählen Sie ein Datum";
  const description = data.description || data.content?.text;
  
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
            <Label htmlFor={fieldName} className="block mb-2">
              {data.label || "Datum auswählen"}
            </Label>
            <Input
              id={fieldName}
              type="date"
              {...register(fieldName, { 
                required: data.required ? "Dieses Feld ist erforderlich" : false 
              })}
              className="w-full"
              min={data.minDate}
              max={data.maxDate}
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

export default DateInputView;
