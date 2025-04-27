
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { marked } from 'marked';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [parsedContent, setParsedContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const audioInitialized = useRef(false);
  const audioLoading = useRef(false);
  const actualDurationLoaded = useRef(false);
  const actualDuration = useRef<number | null>(null);
  const shouldShowCurrentTime = useRef(false);

  useEffect(() => {
    if (!message.content) {
      setParsedContent('');
      return;
    }

    const contentStr = typeof message.content === 'object' 
      ? JSON.stringify(message.content)
      : message.content;
    
    if (isAudioMessage(contentStr)) {
      if (!audio && !audioInitialized.current) {
        audioInitialized.current = true;
        const newAudio = new Audio(`data:audio/webm;base64,${contentStr}`);
        
        newAudio.addEventListener('loadedmetadata', () => {
          if (isFinite(newAudio.duration) && newAudio.duration > 0) {
            const realDuration = newAudio.duration;
            actualDuration.current = realDuration;
            setDuration(realDuration);
            actualDurationLoaded.current = true;
            console.log('Actual audio duration loaded:', realDuration);
          }
          
          setProgress(0);
          audioLoading.current = false;
        });
        
        newAudio.addEventListener('timeupdate', () => {
          if (!shouldShowCurrentTime.current) {
            shouldShowCurrentTime.current = true;
          }
          
          setCurrentTime(newAudio.currentTime);
          const audioDuration = actualDuration.current || 
            (isFinite(newAudio.duration) && newAudio.duration > 0 ? newAudio.duration : 0);
            
          if (audioDuration > 0) {
            setProgress((newAudio.currentTime / audioDuration) * 100);
          }
        });
        
        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
          shouldShowCurrentTime.current = false;
        });
        
        newAudio.preload = 'metadata';
        
        audioLoading.current = true;
        newAudio.load();
        
        setAudio(newAudio);
      }
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
  }, [message.content, audio]);

  useEffect(() => {
    if (audio) {
      const updateTime = () => {
        setCurrentTime(audio.currentTime);
        const audioDuration = actualDuration.current || 
          (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
          
        if (audioDuration > 0) {
          setProgress((audio.currentTime / audioDuration) * 100);
        }
      };
      
      const handleLoadedMetadata = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          const realDuration = audio.duration;
          actualDuration.current = realDuration;
          setDuration(realDuration);
          actualDurationLoaded.current = true;
          console.log('Actual audio duration loaded from metadata event:', realDuration);
        }
        
        audioLoading.current = false;
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        shouldShowCurrentTime.current = false;
        
        if (audio) {
          try {
            audio.currentTime = 0;
          } catch (error) {
            console.error('Error resetting audio time:', error);
          }
        }
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      
      // Force load duration
      if (audio.readyState >= 1 && !actualDurationLoaded.current) {
        handleLoadedMetadata();
      }

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDisplayTime = () => {
    // When playing, show the current time
    if (shouldShowCurrentTime.current) {
      return formatTime(currentTime);
    }
    
    // When not playing, show the total duration
    // First priority: use the actual loaded duration if available
    if (actualDuration.current && actualDuration.current > 0) {
      return formatTime(actualDuration.current);
    }
    
    // Second priority: use the audio element's duration if valid
    if (audio && isFinite(audio.duration) && audio.duration > 0) {
      return formatTime(audio.duration);
    }
    
    // Third priority: use the state duration if valid
    if (isFinite(duration) && duration > 0) {
      return formatTime(duration);
    }
    
    // Fallback
    return '0:00';
  };

  const playAudio = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      shouldShowCurrentTime.current = false;
    } else {
      audio.play().catch(err => console.error('Error playing audio:', err));
      setIsPlaying(true);
      shouldShowCurrentTime.current = true;
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audio) {
      console.log('Audio not initialized yet');
      return;
    }
    
    setProgress(value[0]);
    
    const audioDuration = actualDuration.current || 
      (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0);
      
    const newTime = (value[0] / 100) * audioDuration;
    
    setCurrentTime(newTime);
    shouldShowCurrentTime.current = true;
    
    if (isFinite(newTime) && newTime >= 0) {
      try {
        audio.currentTime = newTime;
      } catch (error) {
        console.error('Error setting audio current time:', error);
      }
    }
  };

  const isAudioMessage = (content: string): boolean => {
    return content.startsWith('/9j/') || 
           content.startsWith('GkXf') || 
           content.startsWith('T21v');
  };

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
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-10 w-10",
                  isPlaying ? "text-primary bg-primary/10" : "text-gray-600 hover:text-primary"
                )}
                onClick={playAudio}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <div className="flex-1">
                <Slider
                  value={[progress]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="my-2"
                />
                <div className="flex justify-start mt-1">
                  <span className="text-xs text-gray-500">
                    {getDisplayTime()}
                  </span>
                </div>
              </div>
              <Volume2 size={20} className="text-gray-400" />
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
