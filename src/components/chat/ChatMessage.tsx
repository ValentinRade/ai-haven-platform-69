
import React, { useState } from 'react';
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

  const parseContent = (content: string) => {
    try {
      // Check if the content is a JSON string containing an array with output property
      if (content.startsWith('[{')) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed[0]?.output) {
          content = parsed[0].output;
        }
      }
      // Convert markdown to HTML
      const html = marked(content, { breaks: true });
      return { __html: html };
    } catch (error) {
      // If parsing fails, return the original content
      return { __html: content };
    }
  };

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
              dangerouslySetInnerHTML={parseContent(message.content)}
              className="text-sm sm:text-base"
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

