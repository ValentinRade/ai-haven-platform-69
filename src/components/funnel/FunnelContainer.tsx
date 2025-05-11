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

// Updated interface with previousAnswers property
export interface FunnelResponse {
  stepId: string;
  messageType: "question" | "info" | "input" | "textarea" | "multiSelect" | "date" | "number" | "summary" | "end";
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
  previousAnswers?: any; // Added this property to fix the type error
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
  const [allResponses, setAllResponses] = useState<Record<string, any>>({});
  
  const form = useForm<FunnelData>({
    mode: "onChange" // Enable real-time validation
  });
  const { watch, setValue, getValues, handleSubmit } = form;
  const step1Selection = watch("step1Selection");
  
  const { sendToWebhook, generateNewChatId } = useChatStore();
  // Updated webhook URL
  const actualWebhookUrl = webhookUrl || "https://agent.snipe-solutions.de/webhook/funnel";

  // Make the webhook URL available globally for the EndFormView component
  useEffect(() => {
    (window as any).__FUNNEL_WEBHOOK_URL__ = actualWebhookUrl;
  }, [actualWebhookUrl]);

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
    // Base steps (Step 1 + Step 2 (if not skipped) + estimated dynamic steps + final contact form)
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
      
      // Save current answers for later submission
      setAllResponses(prev => ({ ...prev, ...data }));
      
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
        // Handle array response (fixes issue with array-wrapped responses)
        const actualResponse = Array.isArray(responseData) ? responseData[0] : responseData;
        console.log("Processing webhook response:", actualResponse);
        
        // Add the received response to history
        const processedResponse = mapResponseToFunnelFormat(actualResponse);
        console.log("Processed response:", processedResponse);
        
        setResponseHistory(prev => [...prev, processedResponse]);
        
        // Set the current dynamic step to display
        setCurrentDynamicStep(processedResponse);
        
        // IMPORTANT: Do NOT set success flag here for "end" messageType
        // Instead, let the EndFormView handle that after successful form submission
        
        // Check if we have nextSteps as a transition format
        if (responseData.nextSteps) {
          console.log("Processing legacy nextSteps format");
          const nextSteps = responseData.nextSteps.map(mapStepToFunnelResponse);
          setDynamicSteps(nextSteps);
          return { nextSteps };
        }
        // Process the new format directly
        else {
          const processedResponse = mapResponseToFunnelFormat(actualResponse);
          setDynamicSteps([processedResponse]);
          return { response: processedResponse };
        }
      } else {
        // Log error for unexpected response format
        console.error("Unexpected webhook response format:", responseData);
        
        // Return an error response instead of a fallback "thank you" message
        const errorResponse: FunnelResponse = {
          stepId: `error-${Date.now()}`,
          messageType: "info",
          content: {
            headline: "Fehler bei der Verarbeitung",
            text: "Es gab ein Problem bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es später erneut."
          }
        };
        
        setCurrentDynamicStep(errorResponse);
        setDynamicSteps([errorResponse]);
        return { response: errorResponse };
      }
    } catch (error) {
      console.error("Error processing webhook response:", error);
      setError("Es gab ein Problem bei der Kommunikation mit dem Server.");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Server.",
      });
      
      // Use error response instead of default steps
      const errorResponse: FunnelResponse = {
        stepId: `error-${Date.now()}`,
        messageType: "info",
        content: {
          headline: "Ein Fehler ist aufgetreten",
          text: "Es gab ein Problem bei der Kommunikation mit dem Server. Bitte versuchen Sie es später erneut."
        }
      };
      
      setCurrentDynamicStep(errorResponse);
      setDynamicSteps([errorResponse]);
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

  // Updated mapResponseToFunnelFormat function with better handling and no default "thank you" message
  const mapResponseToFunnelFormat = (response: any): FunnelResponse => {
    console.log("Mapping response to funnel format:", response);
    
    // If response is already in the correct format with messageType and content
    if (response && response.messageType && response.content) {
      console.log("Response already in correct format with messageType:", response.messageType);
      return response as FunnelResponse;
    }
    
    // Try to determine the response type and map it
    if (response && response.nextSteps && Array.isArray(response.nextSteps) && response.nextSteps.length > 0) {
      // Map the first next step (legacy format)
      console.log("Mapping legacy nextSteps format");
      return mapStepToFunnelResponse(response.nextSteps[0]);
    }
    
    // If we have a completely unexpected format, return a proper error message
    // instead of a "thank you" message
    console.error("Unknown response format:", response);
    return {
      stepId: `unknown-${Date.now()}`,
      messageType: "info",
      content: {
        headline: "Unbekanntes Format",
        text: "Die Serverantwort hat ein unerwartetes Format. Bitte versuchen Sie es später erneut."
      }
    };
  };

  // Function to handle selection in question views
  const handleDynamicOptionSelect = (optionId: string) => {
    console.log("Option selected in dynamic step:", optionId);
    
    // Move to next step automatically after selection
    setTimeout(() => onNext(), 300);
  };

  const onNext = async () => {
    // Get current form values
    const currentData = getValues();
    console.log("Current form data on next:", currentData);
    
    try {
      // Only send to webhook if we're in the dynamic part of the funnel
      if (shouldSendToWebhook(currentStep)) {
        // Send data to webhook at every step transition AND process response
        setIsProcessingResponse(true);
        const result = await sendDataToWebhook(currentData);
        
        // Process the response from webhook before moving to next step
        if (result) {
          console.log("Successfully processed webhook response for next step");
          
          if (result.nextSteps) {
            // Set dynamic steps from nextSteps
            setDynamicSteps(result.nextSteps);
          } else if (result.response) {
            // For regular responses, set current dynamic step
            setCurrentDynamicStep(result.response);
            
            // Handle end message type specially
            if (result.response.messageType === "end") {
              console.log("Received 'end' message type - showing contact form:", result.response);
              
              // If processedResponse doesn't already have contact form fields in metadata,
              // we can add them for backward compatibility
              if (!result.response.metadata?.formFields) {
                const contactFormResponse: FunnelResponse = {
                  ...result.response,
                  metadata: {
                    ...result.response.metadata,
                    formFields: [
                      { id: "firstName", label: "Vorname", inputType: "text", validation: { required: true } },
                      { id: "lastName", label: "Nachname", inputType: "text", validation: { required: true } },
                      { id: "email", label: "E-Mail", inputType: "email", validation: { required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" } },
                      { id: "phone", label: "Telefonnummer", inputType: "tel", validation: { required: true } }
                    ]
                  },
                  previousAnswers: allResponses
                };
                
                setCurrentDynamicStep(contactFormResponse);
              }
              return { response: result.response };
            }
          }
        }
      } else {
        // For static steps, just move to next step without sending webhook
        console.log("Skipping webhook for static step:", currentStep);
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
      
      if (result.response) {
        // IMPORTANT: Do NOT set success flag here
        // EndFormView will handle its own submission and success state
        if (result.response.messageType === "end") {
          // Just move to the next step which will show the EndFormView
          setCurrentDynamicStep(result.response);
          setCurrentStep(prev => prev + 1);
        } else {
          // For non-end responses, continue to next step with the new response
          setCurrentDynamicStep(result.response);
          setCurrentStep(prev => prev + 1);
        }
      } else if (result.nextSteps && result.nextSteps.length > 0) {
        // Handle legacy nextSteps format
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
    
    // Handle the first two static steps
    if (currentStep === 1) {
      return <Step1 form={form} />;
    }
    
    if (currentStep === 2 && !shouldSkipStep2) {
      return <Step2 form={form} step1Selection={step1Selection} />;
    }
    
    // IMPORTANT: Log for debugging what's being rendered at step 3+
    console.log(`Rendering step ${currentStep}`, {
      currentDynamicStep,
      isEndForm: currentDynamicStep?.messageType === "end",
      dynamicStepsLength: dynamicSteps.length
    });
    
    // Always use currentDynamicStep if available as it contains the latest response from webhook
    if (currentDynamicStep) {
      return (
        <DynamicStep 
          form={form}
          stepData={currentDynamicStep}
          onOptionSelect={handleDynamicOptionSelect}
          onFormSuccess={() => {
            // This callback will be triggered by EndFormView when its form is successfully submitted
            if (currentDynamicStep.messageType === "end") {
              console.log("EndFormView submission successful - now showing success screen");
              setSuccess(true);
            }
          }}
        />
      );
    }
    
    // Fallback to using dynamic steps array if currentDynamicStep is not set
    // (this should rarely happen if webhook responses are handled correctly)
    const dynamicStepIndex = currentStep - (shouldSkipStep2 ? 2 : 3);
    if (dynamicSteps.length > 0 && dynamicStepIndex >= 0 && dynamicStepIndex < dynamicSteps.length) {
      return (
        <DynamicStep 
          form={form}
          stepData={dynamicSteps[dynamicStepIndex]}
          onOptionSelect={handleDynamicOptionSelect}
          onFormSuccess={() => {
            if (dynamicSteps[dynamicStepIndex].messageType === "end") {
              console.log("EndFormView submission successful - now showing success screen");
              setSuccess(true);
            }
          }}
        />
      );
    }
    
    // If we have no dynamic step data to render, show an error state
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium text-red-500 mb-4">
          Fehler beim Laden der Daten
        </h2>
        <p className="text-gray-600 mb-4">
          Die Antwort vom Server konnte nicht verarbeitet werden.
        </p>
        <Button onClick={onBack}>Zurück</Button>
      </div>
    );
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
