
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { marked } from 'marked';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [parsedContent, setParsedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Parse content when message changes
  useEffect(() => {
    if (isAudioMessage) return;
    
    try {
      let content = message.content;
      
      // Check if content is JSON format
      if (content.startsWith('[{')) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed[0]?.output) {
            content = parsed[0].output;
          }
        } catch (e) {
          console.log('Failed to parse JSON content:', e);
        }
      }
      
      // Use marked to parse markdown without creating memory leaks
      setParsedContent(marked.parse(content));
    } catch (error) {
      console.error('Error parsing message content:', error);
      setParsedContent(message.content);
    }
  }, [message.content]);

  const playAudio = () => {
    if (!audio) {
      const newAudio = new Audio(`data:audio/webm;base64,${message.content}`);
      setAudio(newAudio);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const isAudioMessage = message.content.startsWith('/9j/') || 
                        message.content.startsWith('GkXf') || 
                        message.content.startsWith('T21v');

  return (
    <div 
      className={cn(
        "flex w-full mb-6",
        message.type === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "px-4 py-3",
          message.type === 'user' ? "chat-message-user ml-auto" : "chat-message-ai mr-auto",
          "w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%]"
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isAudioMessage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full",
                  isPlaying && "text-primary"
                )}
                onClick={playAudio}
              >
                <AudioLines size={20} />
              </Button>
              <span className="text-sm text-gray-500">
                {isPlaying ? "Wird abgespielt..." : "Sprachnachricht"}
              </span>
            </div>
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
