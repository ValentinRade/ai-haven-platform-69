
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FunnelData, FunnelResponse } from "./FunnelContainer";
import QuestionView from "./views/QuestionView";
import MultiSelectView from "./views/MultiSelectView";
import TextInputView from "./views/TextInputView";
import TextAreaView from "./views/TextAreaView";
import DateInputView from "./views/DateInputView";
import NumberInputView from "./views/NumberInputView";
import ContactFormView from "./views/ContactFormView";
import InfoView from "./views/InfoView";
import SummaryView from "./views/SummaryView";

export interface DynamicStepData {
  type?: string;
  id?: string;
  title?: string;
  description?: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  // Add compatibility with FunnelResponse
  messageType?: string;
  content?: {
    headline?: string;
    text: string;
  };
  inputConfig?: {
    inputType: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  };
  summaryItems?: Array<{ label: string; value: string }>;
  [key: string]: any;
}

interface DynamicStepProps {
  form: UseFormReturn<FunnelData>;
  stepData: DynamicStepData | FunnelResponse;
  onOptionSelect?: (optionId: string) => void;
}

const DynamicStep: React.FC<DynamicStepProps> = ({ form, stepData, onOptionSelect }) => {
  // Determine whether we're using legacy or new format
  const isNewFormat = 'messageType' in stepData;
  const messageType = isNewFormat ? stepData.messageType : stepData.type;
  
  // Extract content for either format
  const title = isNewFormat && stepData.content 
    ? stepData.content.headline 
    : stepData.title;
    
  const description = isNewFormat && stepData.content
    ? stepData.content.text
    : stepData.description;
  
  // Map options format if needed
  const mappedOptions = isNewFormat && stepData.options
    ? stepData.options
    : (stepData.options || []).map(opt => ({
        id: opt.id,
        label: opt.label,
        payload: opt.value
      }));
      
  const renderStepContent = () => {
    // Use messageType if available, otherwise fall back to type
    const stepType = messageType || 'question';
    
    switch (stepType) {
      case "question":
        return <QuestionView 
                form={form} 
                data={{
                  ...stepData,
                  title: title,
                  description: description,
                  options: mappedOptions
                }}
                onOptionSelect={onOptionSelect}
              />;
      case "multiSelect":
        return <MultiSelectView form={form} data={{
                ...stepData,
                title: title,
                description: description,
                options: mappedOptions
              }} />;
      case "text":
      case "input":
        return <TextInputView form={form} data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "textarea":
      case "longtext":
        return <TextAreaView form={form} data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "date":
        return <DateInputView form={form} data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "number":
        return <NumberInputView form={form} data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "contact":
        return <ContactFormView form={form} data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "info":
        return <InfoView data={{
                ...stepData,
                title: title,
                description: description,
              }} />;
      case "summary":
        return <SummaryView data={{
                ...stepData,
                title: title,
                description: description,
                summaryItems: stepData.summaryItems || []
              }} />;
      default:
        return (
          <div className="p-4 text-center text-yellow-600 bg-yellow-50 rounded-md">
            Dieser Fragentyp ({stepType}) wird nicht unterstützt.
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
