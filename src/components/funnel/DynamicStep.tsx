
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

interface DynamicStepProps {
  form: UseFormReturn<any>;
  stepData: any;
  onOptionSelect?: (optionId: string) => void;
}

const DynamicStep: React.FC<DynamicStepProps> = ({ form, stepData, onOptionSelect }) => {
  // Get the webhook URL from the parent component (FunnelContainer)
  const webhookUrl = (window as any).__FUNNEL_WEBHOOK_URL__ || "https://agent.snipe-solutions.de/webhook/funnel";

  // Add the webhookUrl to the stepData object so it can be used in EndFormView
  const enrichedStepData = {
    ...stepData,
    webhookUrl
  };

  // Log the current step data for debugging
  console.log("Current dynamic step data:", enrichedStepData);

  // Determine which view component to render based on messageType
  switch (stepData.messageType) {
    case "question":
      return <QuestionView data={stepData} onOptionSelect={onOptionSelect} />;
    
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
      return <NumberInputView data={stepData} form={form} />;
    
    case "summary":
      return <SummaryView data={stepData} />;
    
    case "end":
      // Here's the new handler for the end message type
      return <EndFormView data={enrichedStepData} />;
    
    default:
      // Default to ContactFormView for backwards compatibility
      return <ContactFormView form={form} />;
  }
};

export default DynamicStep;
