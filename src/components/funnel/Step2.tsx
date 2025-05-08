
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FunnelData } from "./FunnelContainer";

interface Step2Props {
  form: UseFormReturn<FunnelData>;
  step1Selection: string;
}

const Step2: React.FC<Step2Props> = ({ form, step1Selection }) => {
  const { register, setValue, watch } = form;
  const currentSelection = watch("step2Selection");

  const handleSelection = (value: string) => {
    setValue("step2Selection", value);
  };

  // Determine which question to display based on step 1 selection
  let question = "";
  let options: { id: string; label: string; value: string }[] = [];

  if (["Bestandsimmobilie", "Neubau", "Budgetberatung"].includes(step1Selection)) {
    question = "Selbst bewohnt oder vermietet?";
    options = [
      { id: "selbst_bewohnt", label: "Selbst bewohnt", value: "Selbst bewohnt" },
      { id: "vermietet", label: "Vermietet", value: "Vermietet" },
    ];
  } else if (["Modernisierung", "Anschlussfinanzierung"].includes(step1Selection)) {
    question = "Bewohnt, vermietet oder leerstehend?";
    options = [
      { id: "bewohnt", label: "Bewohnt", value: "Bewohnt" },
      { id: "vermietet", label: "Vermietet", value: "Vermietet" },
      { id: "leerstehend", label: "Leerstehend", value: "Leerstehend" },
    ];
  }

  return (
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {question}
      </h2>
      <p className="text-gray-600 mb-6">
        Bitte wählen Sie die passende Option für Ihre Immobilie.
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

export default Step2;
