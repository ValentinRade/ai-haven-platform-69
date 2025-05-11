
import React from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFooter from "@/components/chat/ChatFooter";
import ChatHeading from "@/components/chat/ChatHeading";
import FunnelContainer from "@/components/funnel/FunnelContainer";
import { Toaster } from "@/components/ui/toaster";

const FunnelPage: React.FC = () => {
  // Use a webhook URL that will handle the funnel flow and end with a contact form
  const webhookUrl = "https://agent.snipe-solutions.de/webhook/funnel";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto pt-4 md:pt-8">
          <ChatHeading />
          
          <div className="mt-6 mb-12">
            <FunnelContainer webhookUrl={webhookUrl} />
          </div>
        </div>
      </div>
      
      <ChatFooter />
      <Toaster />
    </div>
  );
};

export default FunnelPage;
