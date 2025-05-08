
import React from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatFooter from "@/components/chat/ChatFooter";
import ChatHeading from "@/components/chat/ChatHeading";
import FunnelContainer from "@/components/funnel/FunnelContainer";

const FunnelPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto pt-4 md:pt-8">
          <ChatHeading />
          
          <div className="mt-6 mb-12">
            <FunnelContainer />
          </div>
        </div>
      </div>
      
      <ChatFooter />
    </div>
  );
};

export default FunnelPage;
