
import React, { useEffect, useRef } from "react";
import ChatMessageBubble from "./ChatMessageBubble";
import { useChatStore } from "@/store/chatStore";

const ChatMessageList: React.FC = () => {
  const { messages, isLoading } = useChatStore();
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="p-3 md:p-5 space-y-3 md:space-y-4 overflow-y-auto flex-grow">
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-800 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl rounded-bl-none shadow-sm">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={chatRef}></div>
    </div>
  );
};

export default ChatMessageList;
