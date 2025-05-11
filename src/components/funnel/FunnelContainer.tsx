import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import FunnelProgress from "./FunnelProgress";
import Step1 from "./Step1";
import Step2 from "./Step2";
import DynamicStep from "./DynamicStep";
import { useChatStore } from "@/store/chatStore";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export interface FunnelData {
  step1Selection: string;
  step2Selection: string;
  [key: string]: any;
}

// New interface definitions based on the AI agent response format
export interface FunnelResponse {
  stepId: string;
  messageType: "question" | "info" | "input" | "multiSelect" | "summary" | "end";
  content: {
    headline?: string;
    text: string;
  };
  options?: Array<{
    id: string;
    label: string;
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
    };
  };
  summaryItems?: Array<{ label: string; value: string }>;
  metadata?: any;
}

interface FunnelContainerProps {
  webhookUrl?: string;
}

const FunnelContainer: React.FC<FunnelContainerProps> = ({ webhookUrl }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalSteps, setTotalSteps] = useState(4); // Default number of steps
  const [dynamicSteps, setDynamicSteps] = useState<FunnelResponse[]>([]);
  const [sessionChatId, setSessionChatId] = useState<string>('');
  const [responseHistory, setResponseHistory] = useState<FunnelResponse[]>([]);
  const [currentDynamicStep, setCurrentDynamicStep] = useState<FunnelResponse | null>(null);
  
  const form = useForm<FunnelData>();
  const { watch, setValue, getValues, handleSubmit } = form;
  const step1Selection = watch("step1Selection");
  
  const { sendToWebhook, generateNewChatId } = useChatStore();
  // Updated webhook URL
  const actualWebhookUrl = webhookUrl || "https://agent.snipe-solutions.de/webhook-test/funnel";

  // Generate a new chatId for each funnel session
  useEffect(() => {
    const newChatId = generateNewChatId();
    setSessionChatId(newChatId);
    console.log("New funnel session started with chatId:", newChatId);
  }, []);

  // Determine if Step 2 should be skipped
  const shouldSkipStep2 = step1Selection === "Ratenkredit";

  // Update total steps when dynamic steps change
  useEffect(() => {
    // Base steps (Step 1 + Step 2 (if not skipped) + estimated dynamic steps)
    const baseSteps = shouldSkipStep2 ? 3 : 4;
    const dynamicStepsCount = dynamicSteps.length > 0 ? dynamicSteps.length : 2;
    setTotalSteps(baseSteps + dynamicStepsCount);
  }, [dynamicSteps, shouldSkipStep2]);

  // Function to determine if we should send data to webhook
  const shouldSendToWebhook = (step: number) => {
    // Only start sending webhook requests after Step 2 (or after Step 1 for Ratenkredit)
    if (shouldSkipStep2) {
      return step >= 1; // Start sending after Step 1 for Ratenkredit
    } else {
      return step >= 2; // Start sending after Step 2 for all other options
    }
  };

  const sendDataToWebhook = async (data: FunnelData) => {
    setIsLoading(true);
    setIsProcessingResponse(true);
    setError(null);
    
    try {
      console.log("Sending funnel data to webhook:", data);
      console.log("Using session chatId:", sessionChatId);
      
      // Create the request body according to expected format
      const requestBody = {
        stepId: currentStep.toString(),
        previousAnswers: data, // contains all form answers up to this point
        chatId: sessionChatId, // Include the session-specific chatId
        event: {
          type: "step_submit",
          currentStep,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log("Webhook request body:", requestBody);
      
      // Send the data to webhook
      const response = await fetch(actualWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the actual webhook response
      const responseData = await response.json();
      console.log("Webhook response received:", responseData);
      
      // Process the response based on the FunnelResponse format
      if (responseData) {
        // Add the received response to history
        const processedResponse = mapResponseToFunnelFormat(responseData);
        setResponseHistory(prev => [...prev, processedResponse]);
        
        // Set the current dynamic step to display
        setCurrentDynamicStep(processedResponse);
        
        // Check if we have nextSteps as a transition format
        if (responseData.nextSteps) {
          console.log("Processing legacy nextSteps format");
          const nextSteps = responseData.nextSteps.map(mapStepToFunnelResponse);
          setDynamicSteps(nextSteps);
          return { nextSteps };
        }
        // Process the new format directly
        else {
          const processedResponse = mapResponseToFunnelFormat(responseData);
          setDynamicSteps([processedResponse]);
          return { response: processedResponse };
        }
      } else {
        // Fallback if response format is unexpected
        console.warn("Webhook response format unexpected, using fallback");
        const fallbackResponse: FunnelResponse = {
          stepId: `fallback-${Date.now()}`,
          messageType: "input",
          content: {
            headline: "Ihre Daten",
            text: "Bitte geben Sie Ihre Kontaktdaten ein."
          },
          inputConfig: {
            inputType: "text",
            placeholder: "Ihre Antwort",
            validation: { required: true }
          }
        };
        
        setCurrentDynamicStep(fallbackResponse);
        setDynamicSteps([fallbackResponse]);
        return { response: fallbackResponse };
      }
    } catch (error) {
      console.error("Error processing webhook response:", error);
      setError("Es gab ein Problem bei der Kommunikation mit dem Server.");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Server.",
      });
      
      // Use default steps in case of error
      const fallbackResponse: FunnelResponse = {
        stepId: `error-${Date.now()}`,
        messageType: "info",
        content: {
          headline: "Ein Fehler ist aufgetreten",
          text: "Es gab ein Problem bei der Kommunikation mit dem Server. Bitte versuchen Sie es später erneut."
        }
      };
      
      setCurrentDynamicStep(fallbackResponse);
      setDynamicSteps([fallbackResponse]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Map legacy step format to new FunnelResponse format
  const mapStepToFunnelResponse = (step: any): FunnelResponse => {
    switch (step.type) {
      case "contact":
        return {
          stepId: step.id || `contact-${Date.now()}`,
          messageType: "input",
          content: {
            headline: step.title || "Ihre Kontaktdaten",
            text: step.description || "Bitte geben Sie Ihre Kontaktdaten ein."
          },
          inputConfig: {
            inputType: "text",
            validation: { required: true }
          }
        };
      case "question":
        return {
          stepId: step.id || `question-${Date.now()}`,
          messageType: "question",
          content: {
            headline: step.title || "Ihre Frage",
            text: step.description || "Bitte wählen Sie eine Option."
          },
          options: (step.options || []).map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            payload: opt.value
          }))
        };
      case "multiSelect":
        return {
          stepId: step.id || `multiselect-${Date.now()}`,
          messageType: "multiSelect",
          content: {
            headline: step.title || "Mehrfachauswahl",
            text: step.description || "Bitte wählen Sie eine oder mehrere Optionen."
          },
          options: (step.options || []).map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            payload: opt.value
          }))
        };
      default:
        return {
          stepId: step.id || `default-${Date.now()}`,
          messageType: "info",
          content: {
            headline: step.title || "Information",
            text: step.description || "Bitte beachten Sie die folgenden Informationen."
          }
        };
    }
  };

  // Updated falback response, ensuring it has a stepId property
  const mapResponseToFunnelFormat = (response: any): FunnelResponse => {
    // If response is already in the correct format
    if (response.messageType && response.content) {
      return response as FunnelResponse;
    }
    
    // Try to determine the response type and map it
    if (response.nextSteps && Array.isArray(response.nextSteps) && response.nextSteps.length > 0) {
      // Map the first next step (legacy format)
      return mapStepToFunnelResponse(response.nextSteps[0]);
    }
    
    // Default fallback response
    return {
      stepId: `response-${Date.now()}`,
      messageType: "info",
      content: {
        headline: "Vielen Dank",
        text: "Ihre Angaben wurden erfolgreich übermittelt."
      }
    };
  };

  const onNext = async () => {
    // Get current form values
    const currentData = getValues();
    
    try {
      // Only send to webhook if we're in the dynamic part of the funnel
      if (shouldSendToWebhook(currentStep)) {
        // Send data to webhook at every step transition AND process response
        const result = await sendDataToWebhook(currentData);
        
        // Process the response from webhook before moving to next step
        if (result && (result.response || (result.nextSteps && result.nextSteps.length > 0))) {
          console.log("Successfully processed webhook response for next step");
          
          if (result.nextSteps) {
            // Set dynamic steps from nextSteps
            setDynamicSteps(result.nextSteps);
          } else if (result.response && result.response.messageType === "end") {
            // Handle end message type
            setSuccess(true);
            toast({
              title: "Erfolg",
              description: "Ihre Daten wurden erfolgreich übermittelt.",
            });
            setIsProcessingResponse(false);
            return; // Don't proceed to next step
          }
          // For other response types, we continue to next step
        }
      } else {
        // For static steps, just move to next step without sending webhook
        console.log("Skipping webhook for static step:", currentStep);
        setIsProcessingResponse(false);
      }
      
      // Move to next step after processing response or skipping webhook
      if (currentStep === 1 && shouldSkipStep2) {
        // Skip Step 2 for Ratenkredit
        setCurrentStep(3);
      } else {
        setCurrentStep(prev => prev + 1);
      }
      
      // Hide the typing animation
      setIsProcessingResponse(false);
    } catch (error) {
      // Error is already handled in sendDataToWebhook
      console.error("Error in onNext:", error);
      setIsProcessingResponse(false);
    }
  };

  const onBack = () => {
    if (currentStep > 1) {
      // Handle skipping back from step 3 to step 1 when step 2 is skipped
      if (currentStep === 3 && shouldSkipStep2) {
        setCurrentStep(1);
      } else {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  const onSubmit = async (data: FunnelData) => {
    setIsLoading(true);
    setIsProcessingResponse(true);
    try {
      // Always send final data to webhook and process the response
      const result = await sendDataToWebhook(data);
      
      // Check if we got an "end" message type or need to continue
      if (result.response) {
        const response = result.response as FunnelResponse;
        if (response.messageType === "end") {
          setSuccess(true);
          toast({
            title: "Erfolg",
            description: "Ihre Daten wurden erfolgreich übermittelt.",
          });
        } else {
          // For non-end responses, continue to next step with the new response
          console.log("Received non-end response type:", response.messageType);
          setDynamicSteps([response]);
          setCurrentStep(prev => prev + 1);
        }
      } else if (result.nextSteps && result.nextSteps.length > 0) {
        // Handle legacy nextSteps format
        console.log("Received nextSteps in onSubmit:", result.nextSteps);
        setDynamicSteps(result.nextSteps);
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      // Error is already handled in sendDataToWebhook
    } finally {
      setIsLoading(false);
      setIsProcessingResponse(false);
    }
  };

  // Typing animation component
  const TypingAnimation = () => (
    <div className="py-8">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
          <Loader className="h-4 w-4 animate-spin" />
        </div>
        <div className="text-sm text-gray-500 font-medium">Antwort wird generiert...</div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );

  const renderStep = () => {
    if (success) {
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Vielen Dank!</h2>
          <p className="text-gray-600 mb-6">Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei Ihnen.</p>
          <Button 
            onClick={() => {
              setCurrentStep(1);
              setSuccess(false);
              form.reset();
            }}
          >
            Neue Anfrage starten
          </Button>
        </div>
      );
    }

    // Show typing animation when waiting for response
    if (isProcessingResponse) {
      return <TypingAnimation />;
    }
    
    switch(currentStep) {
      case 1:
        return <Step1 form={form} />;
      case 2:
        return <Step2 form={form} step1Selection={step1Selection} />;
      default:
        // Dynamic steps (including contact form)
        // Use the current dynamic step received from webhook if available
        // Otherwise use from the dynamicSteps array
        const dynamicStepIndex = currentStep - (shouldSkipStep2 ? 2 : 3);
        
        const stepData = currentDynamicStep || dynamicSteps[dynamicStepIndex] || {
          messageType: "input",
          stepId: `contact-${Date.now()}`,
          content: {
            headline: "Ihre Kontaktdaten",
            text: "Bitte geben Sie Ihre Kontaktdaten ein, damit wir Sie erreichen können."
          },
          inputConfig: {
            inputType: "text",
            validation: { required: true }
          }
        };
        
        return (
          <DynamicStep 
            form={form}
            stepData={stepData}
            onOptionSelect={(optionId) => {
              // Handle option selection in the new format
              console.log("Option selected:", optionId);
              
              // Use stepId from dynamicStep which is guaranteed to exist in FunnelResponse
              const stepIdentifier = stepData.stepId;
              const fieldName = `${stepIdentifier}_selection`;
              
              setValue(fieldName, optionId);
              // Auto proceed to next step on selection
              setTimeout(() => onNext(), 500);
            }}
          />
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
      {!success && (
        <FunnelProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStep()}
        
        {error && (
          <div className="text-red-500 mt-4 text-center">{error}</div>
        )}
        
        {!success && !isProcessingResponse && (
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
            ) : (
              <div></div> // Empty div to maintain layout with flexbox
            )}
            
            {currentStep < totalSteps ? (
              <Button 
                type="button" 
                onClick={onNext}
                disabled={isLoading || (currentStep === 1 && !step1Selection) || (currentStep === 2 && !form.watch("step2Selection"))}
              >
                {isLoading ? 'Lädt...' : 'Weiter'}
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Wird gesendet...' : 'Absenden'}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default FunnelContainer;
