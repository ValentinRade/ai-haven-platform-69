
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Chat } from '@/types/chat';

interface ChatMessageListProps {
  currentChat?: Chat;
  isLoading: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ currentChat, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-128px)] w-full">
      {!currentChat || currentChat.messages.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center text-gray-500">
            <h2 className="text-2xl font-medium mb-2">Willkommen bei Immofinanz AI</h2>
            <p className="max-w-md">
              Stellen Sie Ihre Frage unten im Textfeld.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full space-y-6">
          {currentChat.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex w-full justify-start mt-6">
          <div className="chat-message-ai px-4 py-3 mr-auto w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%]">
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
