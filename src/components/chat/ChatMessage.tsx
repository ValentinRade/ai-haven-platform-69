
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { marked } from 'marked';
import { AudioPlayer } from './AudioPlayer';
import { isAudioMessage } from '@/utils/messageUtils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [parsedContent, setParsedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message.content) {
      setParsedContent('');
      return;
    }

    const contentStr = typeof message.content === 'object' 
      ? JSON.stringify(message.content)
      : message.content;
    
    if (isAudioMessage(contentStr)) {
      return;
    }
    
    try {
      let content = contentStr;
      
      if (contentStr.startsWith('[{')) {
        try {
          const parsed = JSON.parse(contentStr);
          if (Array.isArray(parsed) && parsed[0]?.output) {
            content = parsed[0].output;
          }
        } catch (e) {
          console.log('Failed to parse JSON content:', e);
        }
      }
      
      const result = marked.parse(content);
      if (result instanceof Promise) {
        result.then(html => {
          setParsedContent(html);
        }).catch(error => {
          console.error('Error parsing markdown content:', error);
          setParsedContent(content);
        });
      } else {
        setParsedContent(result);
      }
    } catch (error) {
      console.error('Error parsing message content:', error);
      setParsedContent(typeof message.content === 'string' ? message.content : JSON.stringify(message.content));
    }
  }, [message.content]);

  const isContentAudio = typeof message.content === 'string' && isAudioMessage(message.content);

  return (
    <div className={cn("flex w-full mb-6", message.type === 'user' ? "justify-end" : "justify-start")}>
      <div className={cn(
        "px-4 py-3",
        message.type === 'user' ? "chat-message-user ml-auto" : "chat-message-ai mr-auto",
        "w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%]"
      )}>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isContentAudio ? (
            <AudioPlayer 
              audioContent={message.content as string} 
              duration={message.duration || 30}
            />
          ) : (
            <div 
              ref={contentRef}
              dangerouslySetInnerHTML={{ __html: parsedContent }}
              className="text-sm sm:text-base overflow-auto"
            />
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {format(message.timestamp, 'HH:mm', { locale: de })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
