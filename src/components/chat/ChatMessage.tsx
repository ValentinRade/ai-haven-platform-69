
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div 
      className={cn(
        "flex w-full mb-6", // Behält den vollen Container bei
        message.type === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "px-4 py-3",
          message.type === 'user' ? "chat-message-user ml-auto" : "chat-message-ai mr-auto", 
          // Festgelegte Breiten für Konsistenz:
          "w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%]"
        )}
      >
        <div className="prose">
          <p className="m-0 text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {format(message.timestamp, 'HH:mm', { locale: de })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
