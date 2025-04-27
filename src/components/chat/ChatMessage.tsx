
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
  const audioDataReady = useRef(false);
  const audioLoading = useRef(false);

  useEffect(() => {
    if (!message.content) {
      setParsedContent('');
      return;
    }

    const contentStr = typeof message.content === 'object' 
      ? JSON.stringify(message.content)
      : message.content;
    
    if (isAudioMessage(contentStr)) {
      // Initialize audio immediately for audio messages
      if (!audio && !audioInitialized.current) {
        audioInitialized.current = true;
        const newAudio = new Audio(`data:audio/webm;base64,${contentStr}`);
        
        newAudio.addEventListener('loadedmetadata', () => {
          setDuration(newAudio.duration);
          setProgress(0);
          audioDataReady.current = true;
          audioLoading.current = false;
          console.log('Audio metadata loaded, duration:', newAudio.duration);
        });
        
        newAudio.addEventListener('timeupdate', () => {
          setCurrentTime(newAudio.currentTime);
          setProgress((newAudio.currentTime / newAudio.duration) * 100);
        });
        
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        
        // Force load audio data without playing
        newAudio.preload = 'metadata';
        
        // Ensure audio data is loaded
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
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        audioDataReady.current = true;
        audioLoading.current = false;
      };
      
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

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
    if (!audio || progress === 0) {
      return formatTime(duration);
    }
    return formatTime(currentTime);
  };

  const playAudio = () => {
    if (!audio) return;

    // If audio data isn't ready yet, force load it
    ensureAudioDataLoaded();

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error('Error playing audio:', err));
      setIsPlaying(true);
    }
  };

  const ensureAudioDataLoaded = () => {
    if (!audio) return;
    
    if (!audioDataReady.current && !audioLoading.current) {
      audioLoading.current = true;
      audio.load();
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audio) {
      console.log('Audio not initialized yet');
      return;
    }
    
    // Make sure audio data is loaded first
    ensureAudioDataLoaded();
    
    // Even if duration isn't available yet, update the progress value anyway
    // so the slider movement is responsive to user interaction
    setProgress(value[0]);
    
    try {
      // Wait for audio metadata to be loaded
      if (audioDataReady.current && isFinite(audio.duration) && audio.duration > 0) {
        const newTime = (value[0] / 100) * audio.duration;
        if (isFinite(newTime) && newTime >= 0) {
          audio.currentTime = newTime;
          setCurrentTime(newTime);
          
          // If the user is scrubbing but not playing yet, update the display time
          if (!isPlaying) {
            setCurrentTime(newTime);
          }
        }
      } else if (!audioLoading.current) {
        // If we haven't tried loading data yet, do it now
        audioLoading.current = true;
        console.log('Forcing audio metadata load');
        audio.load();
        
        // Listen for the metadata to load, then set the time
        const onceLoaded = () => {
          if (isFinite(audio.duration) && audio.duration > 0) {
            const newTime = (value[0] / 100) * audio.duration;
            if (isFinite(newTime) && newTime >= 0) {
              audio.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }
          audio.removeEventListener('loadedmetadata', onceLoaded);
        };
        
        audio.addEventListener('loadedmetadata', onceLoaded);
      }
    } catch (error) {
      console.error('Error setting audio current time:', error);
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
