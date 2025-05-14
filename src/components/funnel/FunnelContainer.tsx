
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
  previousAnswers?: any; // This property is crucial for SummaryView
}

interface FunnelContainerProps {
  webhookUrl?: string;
  onFunnelComplete?: () => void; // Add callback for funnel completion
}

const FunnelContainer: React.FC<FunnelContainerProps> = ({ 
  webhookUrl,
  onFunnelComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // New state to track if we've reached an end state
  const [reachedEndState, setReachedEndState] = useState(false);
  const [totalSteps, setTotalSteps] = useState(4); // Default number of steps
  const [dynamicSteps, setDynamicSteps] = useState<FunnelResponse[]>([]);
  const [sessionChatId, setSessionChatId] = useState<string>('');
  const [responseHistory, setResponseHistory] = useState<FunnelResponse[]>([]);
  const [currentDynamicStep, setCurrentDynamicStep] = useState<FunnelResponse | null>(null);
  // Explicitly track all collected responses in one place
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

  // If funnel has reached an end state, we should not do any further processing
  useEffect(() => {
    if (reachedEndState && onFunnelComplete) {
      console.log("Funnel has reached end state, preventing further processing");
    }
  }, [reachedEndState, onFunnelComplete]);

  const sendDataToWebhook = async (data: FunnelData) => {
    // If we've already reached an end state, don't send more requests
    if (reachedEndState) {
      console.log("Funnel has already reached end state, skipping webhook request");
      return null;
    }
    
    setIsLoading(true);
    setIsProcessingResponse(true);
    setError(null);
    
    try {
      console.log("Sending funnel data to webhook:", data);
      console.log("Using session chatId:", sessionChatId);
      
      // First, add current data to allResponses
      const updatedResponses = { ...allResponses, ...data };
      setAllResponses(updatedResponses);
      
      console.log("All collected responses so far:", updatedResponses);
      
      // Create the request body according to expected format
      const requestBody = {
        stepId: currentStep.toString(),
        previousAnswers: updatedResponses, // Send ALL collected answers, not just current step
        chatId: sessionChatId, // Include the session-specific chatId
        event: {
          type: "step_submit",
          currentStep,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log("Webhook request body:", JSON.stringify(requestBody, null, 2));
      
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
        console.error("Webhook response not OK:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the actual webhook response
      const responseData = await response.json();
      console.log("Webhook response received:", JSON.stringify(responseData, null, 2));
      
      // Process the response based on the FunnelResponse format
      if (responseData) {
        // Handle array response (fixes issue with array-wrapped responses)
        const actualResponse = Array.isArray(responseData) ? responseData[0] : responseData;
        console.log("Processing webhook response:", JSON.stringify(actualResponse, null, 2));
        
        // IMPORTANT: Enrich the response with previousAnswers if it doesn't have them already
        const enrichedResponse = {
          ...actualResponse,
          previousAnswers: actualResponse.previousAnswers || updatedResponses
        };
        
        console.log("Enriched response with previousAnswers:", JSON.stringify(enrichedResponse, null, 2));
        
        // Add the enriched response to history
        const processedResponse = mapResponseToFunnelFormat(enrichedResponse);
        console.log("Final processed response with previousAnswers:", JSON.stringify(processedResponse, null, 2));
        
        setResponseHistory(prev => [...prev, processedResponse]);
        
        // Set the current dynamic step to display, now with previousAnswers
        setCurrentDynamicStep(processedResponse);
        
        // IMPORTANT: Check if this is an end message type
        if (processedResponse.messageType === "end") {
          console.log("RECEIVED END MESSAGE TYPE - This will be the final step before thank you page");
        }
        
        // Check if we have nextSteps as a transition format
        if (responseData.nextSteps) {
          console.log("Processing legacy nextSteps format:", JSON.stringify(responseData.nextSteps, null, 2));
          // Enrich each step with previousAnswers
          const nextSteps = responseData.nextSteps.map(step => ({
            ...mapStepToFunnelResponse(step),
            previousAnswers: updatedResponses
          }));
          setDynamicSteps(nextSteps);
          return { nextSteps };
        }
        // Process the new format directly
        else {
          const processedResponse = {
            ...mapResponseToFunnelFormat(actualResponse),
            previousAnswers: updatedResponses
          };
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
    console.log("Mapping step to FunnelResponse:", JSON.stringify(step, null, 2));
    switch (step.type) {
      case "contact":
        return {
          stepId: step.id || `contact-${Date.now()}`,
          messageType: "input",
          content: {
            headline: step.title || "Deine Kontaktdaten",
            text: step.description || "Bitte gib deine Kontaktdaten ein."
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
            headline: step.title || "Deine Frage",
            text: step.description || "Bitte wähle eine Option."
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
            text: step.description || "Bitte wähle eine oder mehrere Optionen."
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
            text: step.description || "Bitte beachte die folgenden Informationen."
          }
        };
    }
  };

  // Updated mapResponseToFunnelFormat function with better handling and no default "thank you" message
  const mapResponseToFunnelFormat = (response: any): FunnelResponse => {
    console.log("Mapping response to funnel format:", JSON.stringify(response, null, 2));
    
    // If response is already in the correct format with messageType and content
    if (response && response.messageType && response.content) {
      console.log("Response already in correct format with messageType:", response.messageType);
      // Ensure previousAnswers are included
      return {
        ...response,
        previousAnswers: response.previousAnswers || allResponses
      } as FunnelResponse;
    }
    
    // Try to determine the response type and map it
    if (response && response.nextSteps && Array.isArray(response.nextSteps) && response.nextSteps.length > 0) {
      // Map the first next step (legacy format)
      console.log("Mapping legacy nextSteps format");
      const mappedResponse = mapStepToFunnelResponse(response.nextSteps[0]);
      return {
        ...mappedResponse,
        previousAnswers: response.previousAnswers || allResponses
      };
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
      },
      previousAnswers: allResponses
    };
  };

  // Function to handle selection in question views - MODIFIED to remove auto-advance
  const handleDynamicOptionSelect = (optionId: string) => {
    console.log("Option selected in dynamic step:", optionId);
    
    // REMOVED: The setTimeout that automatically advanced to the next step
    // Now the user must explicitly click the "Next" button to proceed
  };

  const onNext = async () => {
    // Don't proceed if we've already reached an end state
    if (reachedEndState) {
      console.log("Funnel has already reached end state, ignoring onNext");
      return;
    }
    
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
              console.log("Received 'end' message type - showing contact form:", JSON.stringify(result.response, null, 2));
              
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
    // Don't allow going back if we've already reached an end state
    if (reachedEndState) {
      console.log("Funnel has already reached end state, ignoring onBack");
      return;
    }
    
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
    // Don't proceed if we've already reached an end state
    if (reachedEndState) {
      console.log("Funnel has already reached end state, ignoring onSubmit");
      return;
    }
    
    console.log("Final form submission with data:", data);
    setIsLoading(true);
    setIsProcessingResponse(true);
    try {
      // Always send final data to webhook and process the response
      const result = await sendDataToWebhook(data);
      
      if (result && result.response) {
        console.log("Received final submission response:", JSON.stringify(result.response, null, 2));
        
        if (result.response.messageType === "end") {
          console.log("Received 'end' message type on final submission - preparing EndFormView");
          // Set the current dynamic step to the end response to show the EndFormView
          setCurrentDynamicStep(result.response);
        } else {
          // For non-end responses, continue to next step with the new response
          setCurrentDynamicStep(result.response);
          setCurrentStep(prev => prev + 1);
        }
      } else if (result && result.nextSteps && result.nextSteps.length > 0) {
        // Handle legacy nextSteps format
        console.log("Received legacy nextSteps format on final submission");
        setDynamicSteps(result.nextSteps);
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      // Error is already handled in sendDataToWebhook
      console.error("Error in final form submission:", error);
    } finally {
      setIsLoading(false);
      setIsProcessingResponse(false);
    }
  };

  // Handle form success from EndFormView
  const handleEndFormSuccess = () => {
    console.log("EndFormView submission successful - triggering onFunnelComplete");
    
    // Mark the funnel as completed to prevent further processing
    setReachedEndState(true);
    
    // IMPORTANT: Always call the parent callback if it exists
    if (onFunnelComplete) {
      console.log("Calling parent onFunnelComplete callback to show thank you page");
      onFunnelComplete();
    } else {
      // If no parent callback, handle success internally
      console.log("No parent onFunnelComplete callback, showing internal success state");
      setSuccess(true);
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
    // If we've already reached end state but there's no parent callback,
    // show the internal success view
    if (success) {
      console.log("Rendering internal success view (should not be shown if onFunnelComplete exists)");
      return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Vielen Dank!</h2>
          <p className="text-gray-600 mb-6">Deine Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei dir.</p>
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
      dynamicStepsLength: dynamicSteps.length,
      hasPreviousAnswers: !!currentDynamicStep?.previousAnswers,
      previousAnswersCount: Object.keys(currentDynamicStep?.previousAnswers || {}).length
    });
    
    // Always use currentDynamicStep if available as it contains the latest response from webhook
    if (currentDynamicStep) {
      // Ensure previousAnswers are passed along
      const enrichedStepData = {
        ...currentDynamicStep,
        previousAnswers: currentDynamicStep.previousAnswers || allResponses
      };
      
      return (
        <DynamicStep 
          form={form}
          stepData={enrichedStepData}
          onOptionSelect={handleDynamicOptionSelect}
          onFormSuccess={handleEndFormSuccess}
        />
      );
    }
    
    // Fallback to using dynamic steps array if currentDynamicStep is not set
    // (this should rarely happen if webhook responses are handled correctly)
    const dynamicStepIndex = currentStep - (shouldSkipStep2 ? 2 : 3);
    if (dynamicSteps.length > 0 && dynamicStepIndex >= 0 && dynamicStepIndex < dynamicSteps.length) {
      // Ensure previousAnswers are passed along
      const enrichedStepData = {
        ...dynamicSteps[dynamicStepIndex],
        previousAnswers: dynamicSteps[dynamicStepIndex].previousAnswers || allResponses
      };
      
      return (
        <DynamicStep 
          form={form}
          stepData={enrichedStepData}
          onOptionSelect={handleDynamicOptionSelect}
          onFormSuccess={handleEndFormSuccess}
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
      {!success && !reachedEndState && (
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
        
        {!success && !isProcessingResponse && currentDynamicStep?.messageType !== "end" && !reachedEndState && (
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading || reachedEndState}
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
                disabled={isLoading || reachedEndState || (currentStep === 1 && !step1Selection) || (currentStep === 2 && !form.watch("step2Selection"))}
              >
                {isLoading ? 'Lädt...' : 'Weiter'}
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isLoading || reachedEndState}
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
