
import React, { useState, useEffect } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFooter from "@/components/chat/ChatFooter";
import ChatHeading from "@/components/chat/ChatHeading";
import FunnelContainer from "@/components/funnel/FunnelContainer";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

const FunnelPage: React.FC = () => {
  const [funnelCompleted, setFunnelCompleted] = useState(false);
  const [showFunnel, setShowFunnel] = useState(true);
  const [isEndStateReached, setIsEndStateReached] = useState(false);
  
  // Use a webhook URL that will handle the funnel flow and end with a contact form
  const webhookUrl = "https://agent.snipe-solutions.de/webhook/funnel";

  // Handle funnel completion - THIS FUNCTION MUST BE CALLED when the funnel is complete
  const handleFunnelComplete = () => {
    console.log("FunnelPage: handleFunnelComplete called - showing thank you page");
    
    // Mark end state as reached to prevent any resets or reloads
    setIsEndStateReached(true);
    
    // First hide the funnel
    setShowFunnel(false);
    
    // Then mark it as completed to show thank you page
    setFunnelCompleted(true);
  };

  // Handle restart of funnel - only available from thank you page
  // AND only if we haven't reached an end state
  const handleRestartFunnel = () => {
    // Prevent restart if we've reached the final end state
    if (isEndStateReached) {
      console.log("FunnelPage: Restart prevented - end state has been reached");
      return;
    }
    
    console.log("FunnelPage: handleRestartFunnel called - restarting funnel");
    // Reset the state to show the funnel again
    setFunnelCompleted(false);
    setShowFunnel(true);
  };

  // Log the current state for debugging
  useEffect(() => {
    console.log("FunnelPage state changed:", { 
      showFunnel, 
      funnelCompleted, 
      isEndStateReached 
    });
  }, [showFunnel, funnelCompleted, isEndStateReached]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto pt-4 md:pt-8">
          <ChatHeading />
          
          <div className="mt-6 mb-12">
            {showFunnel ? (
              <FunnelContainer 
                webhookUrl={webhookUrl} 
                onFunnelComplete={handleFunnelComplete} 
              />
            ) : funnelCompleted ? (
              <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
                <div className="text-center py-10">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 text-green-500 mx-auto mb-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h2 className="text-2xl font-bold text-primary mb-4">Vielen Dank!</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Wir haben deine Anfrage erhalten und werden uns <strong>innerhalb von 48 Stunden</strong> bei dir melden.
                  </p>
                  
                  {/* Only show restart button if we're not in the final end state */}
                  {!isEndStateReached && (
                    <Button onClick={handleRestartFunnel} className="mt-6">
                      Neuen Antrag starten
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      <ChatFooter />
      <Toaster />
    </div>
  );
};

export default FunnelPage;
