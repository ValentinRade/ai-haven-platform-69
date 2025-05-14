
import React from "react";
import { UseFormReturn } from "react-hook-form";
import QuestionView from "./views/QuestionView";
import InfoView from "./views/InfoView";
import ContactFormView from "./views/ContactFormView";
import TextInputView from "./views/TextInputView";
import TextAreaView from "./views/TextAreaView";
import MultiSelectView from "./views/MultiSelectView";
import DateInputView from "./views/DateInputView";
import NumberInputView from "./views/NumberInputView";
import SummaryView from "./views/SummaryView";
import EndFormView from "./views/EndFormView";

// Export the common data structure type to fix import errors in view components
export interface DynamicStepData {
  stepId: string;
  messageType: string;
  content: {
    headline?: string;
    text: string;
  };
  options?: Array<{
    id: string;
    label: string;
    value?: string;
    icon?: { library: string; name: string };
    payload?: any;
  }>;
  inputConfig?: {
    inputType: string;
    placeholder?: string;
    validation?: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      min?: number;
      max?: number;
    };
    step?: string;
  };
  summaryItems?: Array<{ label: string; value: string }>;
  metadata?: any;
  webhookUrl?: string;
  previousAnswers?: Record<string, any>;
  
  // Additional properties used in view components
  title?: string;
  description?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  min?: number;
  max?: number;
  step?: string;
  minDate?: string;
  maxDate?: string;
}

interface DynamicStepProps {
  form: UseFormReturn<any>;
  stepData: DynamicStepData;
  onOptionSelect?: (optionId: string) => void;
  onFormSuccess?: () => void;
}

const DynamicStep: React.FC<DynamicStepProps> = ({ form, stepData, onOptionSelect, onFormSuccess }) => {
  // Get the webhook URL from the parent component (FunnelContainer)
  const webhookUrl = (window as any).__FUNNEL_WEBHOOK_URL__ || "https://agent.snipe-solutions.de/webhook/funnel";

  // Add the webhookUrl to the stepData object so it can be used in EndFormView
  const enrichedStepData = {
    ...stepData,
    webhookUrl
  };

  // Log the current step data for debugging with more details
  console.log("Current dynamic step data:", {
    stepId: enrichedStepData.stepId,
    messageType: enrichedStepData.messageType,
    content: enrichedStepData.content,
    hasOptions: !!enrichedStepData.options?.length,
    optionsCount: enrichedStepData.options?.length || 0,
    hasInputConfig: !!enrichedStepData.inputConfig,
    inputType: enrichedStepData.inputConfig?.inputType || "none",
    hasPreviousAnswers: !!enrichedStepData.previousAnswers,
    previousAnswersCount: Object.keys(enrichedStepData.previousAnswers || {}).length,
    hasFormSuccessCallback: !!onFormSuccess
  });
  
  // Enhanced message type detection logic with budget-related keywords for number fields
  let effectiveMessageType = stepData.messageType;
  
  // Intelligent message type detection as fallback
  if (!effectiveMessageType || effectiveMessageType === "input") {
    // Check if this might be a number input based on content 
    const contentText = (stepData.content?.headline || '') + ' ' + (stepData.content?.text || '');
    const budgetKeywords = ['budget', 'betrag', 'summe', 'geld', 'euro', '€', 'kosten', 'preis', 'kaufpreis', 'modernisierungsbudget', 'kaufbudget'];
    
    const mightBeNumberInput = budgetKeywords.some(keyword => 
      contentText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (mightBeNumberInput) {
      console.log("Auto-detected number input based on content:", contentText);
      effectiveMessageType = "number";
    } else if (stepData.inputConfig?.inputType === 'number') {
      console.log("Auto-detected number input based on inputConfig.inputType");
      effectiveMessageType = "number";
    }
  }

  // Determine which view component to render based on messageType
  switch (effectiveMessageType) {
    case "question":
      return <QuestionView data={stepData} form={form} onOptionSelect={onOptionSelect} />;
    
    case "info":
      return <InfoView data={stepData} />;
    
    case "input":
      return <TextInputView data={stepData} form={form} />;
    
    case "textarea":
      return <TextAreaView data={stepData} form={form} />;
    
    case "multiSelect":
      return <MultiSelectView data={stepData} form={form} />;
    
    case "date":
      return <DateInputView data={stepData} form={form} />;
    
    case "number":
      console.log("Rendering NumberInputView with data:", stepData);
      return <NumberInputView data={stepData} form={form} />;
    
    case "summary":
      console.log("Rendering SummaryView with previousAnswers:", enrichedStepData.previousAnswers);
      return <SummaryView data={enrichedStepData} />;
    
    case "end":
      console.log("Rendering EndFormView with data and onSuccess callback:", {
        hasCallback: !!onFormSuccess,
        dataStepId: enrichedStepData.stepId,
        hasPreviousAnswers: !!enrichedStepData.previousAnswers
      });
      return <EndFormView data={enrichedStepData} form={form} onSuccess={onFormSuccess} />;
    
    default:
      console.warn("Unknown messageType:", stepData.messageType);
      // Default to ContactFormView for backwards compatibility ONLY IF messageType is undefined
      if (!stepData.messageType) {
        return <ContactFormView data={stepData} form={form} />;
      }
      
      // Otherwise show an error state
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-500 mb-4">
            Unbekannter Nachrichtentyp: {stepData.messageType}
          </h3>
          <p className="text-gray-600">
            Der Server hat einen unbekannten Nachrichtentyp gesendet.
          </p>
          <pre className="bg-gray-100 p-3 mt-4 rounded text-xs text-left overflow-auto max-h-40">
            {JSON.stringify(stepData, null, 2)}
          </pre>
        </div>
      );
  }
};

export default DynamicStep;
