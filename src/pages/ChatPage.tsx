
import React, { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatHeading from "@/components/chat/ChatHeading";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatInput from "@/components/chat/ChatInput";
import ChatFooter from "@/components/chat/ChatFooter";

const ChatPage: React.FC = () => {
  // Use the chat store
  const { 
    messages, 
    addMessage, 
    chatId
  } = useChatStore();
  
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      console.log("Initializing chat with ID:", chatId);
      addMessage({
        content: "Hey! 👋 Willkommen bei Immofinanz. Erzähl mir, nach welcher Art von Immobilie du suchst?",
        isUser: false
      });
    }
  }, [messages.length, addMessage, chatId]);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <ChatHeader />

      <div className="flex-grow container mx-auto px-2 md:px-4 py-3 md:py-6 flex flex-col overflow-hidden">
        <ChatHeading />
        
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto flex flex-col flex-grow transition-all duration-300 hover:shadow-lg">
          <ChatMessageList />
          <ChatInput />
        </div>
      </div>

      <ChatFooter />
    </div>
  );
};

export default ChatPage;
