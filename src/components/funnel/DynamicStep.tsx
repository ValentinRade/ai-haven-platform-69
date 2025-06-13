
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
import BinaryChoiceView from "./views/BinaryChoiceView";

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
  chatId?: string; // Add chatId as optional property
  
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
    webhookUrl,
    chatId: stepData.chatId || '' // Ensure chatId is always present
  };

  // Advanced logging for better debugging
  console.log("Current dynamic step data:", {
    stepId: enrichedStepData.stepId,
    messageType: enrichedStepData.messageType,
    content: enrichedStepData.content,
    inputConfig: enrichedStepData.inputConfig,
    hasOptions: !!enrichedStepData.options?.length,
    optionsCount: enrichedStepData.options?.length || 0,
    hasInputConfig: !!enrichedStepData.inputConfig,
    inputType: enrichedStepData.inputConfig?.inputType || "none",
    hasPreviousAnswers: !!enrichedStepData.previousAnswers,
    previousAnswersCount: Object.keys(enrichedStepData.previousAnswers || {}).length,
    hasFormSuccessCallback: !!onFormSuccess,
    title: enrichedStepData.title || enrichedStepData.content?.headline,
    description: enrichedStepData.description || enrichedStepData.content?.text,
    chatId: enrichedStepData.chatId
  });
  
  // Improved message type detection logic with more robust fallbacks
  let effectiveMessageType = stepData.messageType;
  
  // Input type detection based on multiple signals
  if (!effectiveMessageType || effectiveMessageType === "input") {
    // First check if inputConfig.inputType is provided
    if (stepData.inputConfig?.inputType) {
      console.log(`Auto-detected input type from inputConfig.inputType: ${stepData.inputConfig.inputType}`);
      switch(stepData.inputConfig.inputType.toLowerCase()) {
        case 'text':
          effectiveMessageType = "input";
          break;
        case 'textarea':
        case 'long_text':
          effectiveMessageType = "textarea";
          break;
        case 'number':
          effectiveMessageType = "number";
          break;
        case 'date':
          effectiveMessageType = "date";
          break;
        case 'multiselect':
        case 'multi_select':
          effectiveMessageType = "multiSelect";
          break;
        default:
          // Default to text input
          effectiveMessageType = "input";
      }
    } 
    // If no inputConfig.inputType, check content for clues
    else {
      // Check content text for type hints
      const contentText = (stepData.content?.headline || '') + ' ' + (stepData.content?.text || '');
      
      // Budget/number detection
      const budgetKeywords = ['budget', 'betrag', 'summe', 'geld', 'euro', '€', 'kosten', 'preis', 'kaufpreis', 'modernisierungsbudget', 'kaufbudget'];
      const mightBeNumberInput = budgetKeywords.some(keyword => 
        contentText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Date detection
      const dateKeywords = ['datum', 'wann', 'zeitpunkt', 'termin', 'tag', 'monat', 'jahr'];
      const mightBeDateInput = dateKeywords.some(keyword => 
        contentText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Longer text detection
      const textareaKeywords = ['beschreibung', 'erzählen', 'erklären', 'erläutern', 'ausführlich', 'kommentar'];
      const mightBeTextareaInput = textareaKeywords.some(keyword => 
        contentText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Make decision based on strongest signal
      if (mightBeNumberInput) {
        console.log("Auto-detected number input based on content:", contentText);
        effectiveMessageType = "number";
      } else if (mightBeDateInput) {
        console.log("Auto-detected date input based on content:", contentText);
        effectiveMessageType = "date";
      } else if (mightBeTextareaInput) {
        console.log("Auto-detected textarea input based on content:", contentText);
        effectiveMessageType = "textarea";
      } else {
        // Default to regular text input
        console.log("Defaulting to text input based on content:", contentText);
        effectiveMessageType = "input";
      }
    }
  }

  console.log(`Final determined message type: ${effectiveMessageType}`);

  // Determine which view component to render based on messageType
  switch (effectiveMessageType) {
    case "question":
      return <QuestionView data={stepData} form={form} onOptionSelect={onOptionSelect} />;
    
    case "binaryChoice":
      console.log("Rendering BinaryChoiceView with options:", stepData.options);
      return <BinaryChoiceView data={stepData} form={form} onOptionSelect={onOptionSelect} />;
    
    case "info":
      return <InfoView data={stepData} />;
    
    case "input":
      console.log("Rendering TextInputView with data:", {
        id: stepData.id,
        stepId: stepData.stepId,
        title: stepData.title || stepData.content?.headline,
      });
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
        hasPreviousAnswers: !!enrichedStepData.previousAnswers,
        chatId: enrichedStepData.chatId
      });
      return <EndFormView data={enrichedStepData} form={form} onSuccess={onFormSuccess} />;
    
    default:
      console.warn("Unknown messageType:", stepData.messageType);
      // Default to TextInputView if not specified (more likely to be useful than showing an error)
      if (!stepData.messageType || stepData.messageType === "") {
        console.log("No messageType specified, defaulting to TextInputView");
        return <TextInputView data={stepData} form={form} />;
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
