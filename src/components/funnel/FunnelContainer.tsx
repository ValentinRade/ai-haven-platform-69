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
  const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
  const [sessionChatId, setSessionChatId] = useState<string>('');
  
  const form = useForm<FunnelData>();
  const { watch, setValue, getValues, handleSubmit } = form;
  const step1Selection = watch("step1Selection");
  
  const { sendToWebhook, generateNewChatId } = useChatStore();
  // Use the new Webhook URL
  const actualWebhookUrl = webhookUrl || "https://agent.snipe-solutions.de/webhook-test/funnel";

  // Generate a new chatId for each funnel session
  useEffect(() => {
    setSessionChatId(generateNewChatId());
    console.log("New funnel session started with chatId:", sessionChatId);
  }, []);

  // Determine if Step 2 should be skipped
  const shouldSkipStep2 = step1Selection === "Ratenkredit";

  // Update total steps when dynamic steps change
  useEffect(() => {
    // Base steps (Step 1 + Step 2 (if not skipped) + Contact Form + Summary)
    const baseSteps = shouldSkipStep2 ? 3 : 4;
    setTotalSteps(baseSteps + dynamicSteps.length);
  }, [dynamicSteps, shouldSkipStep2]);

  const sendDataToWebhook = async (data: FunnelData) => {
    setIsLoading(true);
    setIsProcessingResponse(true);
    setError(null);
    
    try {
      console.log("Sending funnel data to webhook:", data);
      console.log("Using session chatId:", sessionChatId);
      
      // Create the request body as a JavaScript object
      const requestBody = {
        stepId: currentStep.toString(),
        previousAnswers: data, // contains all form answers up to this point
        chatId: sessionChatId, // Include the session-specific chatId
        event: {
          type: "funnel_step",
          currentStep,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log("Webhook request body:", requestBody);
      
      // Send the data directly without using JSON.stringify in the body
      const response = await fetch(actualWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Use JSON.stringify to convert requestBody to JSON string
        body: JSON.stringify(requestBody)
      });
      
      // For demo purposes, we'll add a slight delay to simulate server processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Since we can't read the response in no-cors mode, we'll use a default response
      const defaultNextSteps = [
        {
          type: "contact",
          title: "Ihre Kontaktdaten",
          description: "Bitte geben Sie Ihre Kontaktdaten ein, damit wir Sie erreichen können."
        }
      ];
      
      setDynamicSteps(defaultNextSteps);
      return { nextSteps: defaultNextSteps };
      
    } catch (error) {
      console.error("Error sending data to webhook:", error);
      setError("Es gab ein Problem bei der Kommunikation mit dem Server.");
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem Server.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onNext = async () => {
    // Get current form values
    const currentData = getValues();
    
    try {
      // Only send data to webhook after Step 2 (or after Step 1 if Step 2 is skipped)
      if (currentStep === 2 || (currentStep === 1 && shouldSkipStep2)) {
        await sendDataToWebhook(currentData);
      }
      
      // Move to next step
      if (currentStep === 1 && shouldSkipStep2) {
        // Skip Step 2 for Ratenkredit
        setCurrentStep(3);
      } else {
        setCurrentStep(prev => prev + 1);
      }
      
      // Hide the typing animation after transition to next step
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
      await sendDataToWebhook(data);
      setSuccess(true);
      toast({
        title: "Erfolg",
        description: "Ihre Daten wurden erfolgreich übermittelt.",
      });
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
        const dynamicStepIndex = currentStep - (shouldSkipStep2 ? 2 : 3);
        return (
          <DynamicStep 
            form={form}
            stepData={dynamicSteps[dynamicStepIndex] || {
              type: "contact",
              title: "Ihre Kontaktdaten",
              description: "Bitte geben Sie Ihre Kontaktdaten ein, damit wir Sie erreichen können."
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
