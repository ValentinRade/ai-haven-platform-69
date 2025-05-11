
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FunnelData } from "./FunnelContainer";

interface Step1Props {
  form: UseFormReturn<FunnelData>;
}

const Step1: React.FC<Step1Props> = ({ form }) => {
  const { register, setValue, watch } = form;
  const currentSelection = watch("step1Selection");

  const handleSelection = (value: string) => {
    setValue("step1Selection", value);
  };

  const options = [
    { id: "bestandsimmobilie", label: "Bestandsimmobilie kaufen", value: "Bestandsimmobilie" },
    { id: "neubau", label: "Neubau kaufen", value: "Neubau" },
    { id: "budgetberatung", label: "Budgetberatung", value: "Budgetberatung" },
    { id: "modernisierung", label: "Modernisierung", value: "Modernisierung" },
    { id: "anschlussfinanzierung", label: "Anschlussfinanzierung", value: "Anschlussfinanzierung" },
    { id: "ratenkredit", label: "Ratenkredit", value: "Ratenkredit" },
  ];

  return (
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        Worum geht es in deinem Finanzierungsbedarf?
      </h2>
      <p className="text-gray-600 mb-6">
        Bitte wähle eine Option aus, die am besten zu deinem Anliegen passt.
      </p>

      <RadioGroup
        value={currentSelection}
        onValueChange={handleSelection}
        className="space-y-3"
      >
        {options.map((option) => (
          <div 
            key={option.id} 
            className={`flex items-center rounded-lg border p-4 transition-all ${
              currentSelection === option.value 
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

export default Step1;
