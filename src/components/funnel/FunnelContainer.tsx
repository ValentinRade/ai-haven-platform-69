
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FunnelProgress from "./FunnelProgress";
import Step1 from "./Step1";
import Step2 from "./Step2";
import DynamicStep from "./DynamicStep";
import { useChatStore } from "@/store/chatStore";
import { toast } from "@/hooks/use-toast";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [totalSteps, setTotalSteps] = useState(4); // Default number of steps
  const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);
  
  const form = useForm<FunnelData>();
  const { watch, setValue, getValues, handleSubmit } = form;
  const step1Selection = watch("step1Selection");
  
  const { sendToWebhook } = useChatStore();
  const actualWebhookUrl = webhookUrl || useChatStore.getState().webhookUrl;

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
    setError(null);
    
    try {
      console.log("Sending funnel data to webhook:", data);
      
      // Using existing webhook infrastructure from chatStore
      const response = await fetch(actualWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "funnel_step",
          currentStep,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
      
      const responseData = await response.json();
      console.log("Webhook response:", responseData);
      
      // Check if there are next dynamic steps to add
      if (responseData.nextSteps && Array.isArray(responseData.nextSteps)) {
        setDynamicSteps(responseData.nextSteps);
      }
      
      return responseData;
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
      // Send current step data to webhook
      await sendDataToWebhook(currentData);
      
      // Move to next step
      if (currentStep === 1 && shouldSkipStep2) {
        // Skip Step 2 for Ratenkredit
        setCurrentStep(3);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      // Error is already handled in sendDataToWebhook
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
    }
  };

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
        
        {!success && (
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
                disabled={isLoading}
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
