
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FunnelData } from "./FunnelContainer";
import QuestionView from "./views/QuestionView";
import MultiSelectView from "./views/MultiSelectView";
import TextInputView from "./views/TextInputView";
import TextAreaView from "./views/TextAreaView";
import DateInputView from "./views/DateInputView";
import NumberInputView from "./views/NumberInputView";
import ContactFormView from "./views/ContactFormView";

export interface DynamicStepData {
  type: string;
  id?: string;
  title?: string;
  description?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  [key: string]: any;
}

interface DynamicStepProps {
  form: UseFormReturn<FunnelData>;
  stepData: DynamicStepData;
}

const DynamicStep: React.FC<DynamicStepProps> = ({ form, stepData }) => {
  const renderStepContent = () => {
    switch (stepData.type) {
      case "question":
        return <QuestionView form={form} data={stepData} />;
      case "multiSelect":
        return <MultiSelectView form={form} data={stepData} />;
      case "text":
        return <TextInputView form={form} data={stepData} />;
      case "textarea":
        return <TextAreaView form={form} data={stepData} />;
      case "date":
        return <DateInputView form={form} data={stepData} />;
      case "number":
        return <NumberInputView form={form} data={stepData} />;
      case "contact":
        return <ContactFormView form={form} data={stepData} />;
      default:
        return (
          <div className="p-4 text-center text-yellow-600 bg-yellow-50 rounded-md">
            Dieser Fragentyp wird nicht unterstützt.
          </div>
        );
    }
  };

  return (
    <div className="py-4">
      {renderStepContent()}
    </div>
  );
};

export default DynamicStep;
