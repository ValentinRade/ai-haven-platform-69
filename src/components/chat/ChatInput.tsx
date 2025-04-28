
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isRecording,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelRecording
}) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="bg-gray-50 pt-2 pb-2 px-4 border-t border-gray-200 h-24 w-full">
      <div className="flex items-end gap-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm w-full">
        {!isRecording ? (
          <>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Schreiben Sie eine Nachricht..."
              className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-full h-8 w-8 flex-shrink-0",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
              onClick={onStartRecording}
              aria-label="Sprachaufnahme starten"
            >
              <Mic size={18} />
            </Button>
            <Button 
              onClick={onSend} 
              size="icon" 
              className={cn(
                "rounded-full h-8 w-8 bg-primary",
                (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed"
              )}
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full px-2">
            <div className="flex items-center gap-2 text-red-500">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">{formatDuration(recordingDuration)}</span>
            </div>
            <div className="flex-1 h-12 bg-gray-100 rounded-lg">
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 to-gray-100/50 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={onCancelRecording}
                aria-label="Aufnahme abbrechen"
              >
                <Trash2 size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={onStopRecording}
                aria-label="Aufnahme beenden und senden"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="text-xs text-center mt-1 text-gray-500">
        Immofinanz AI © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ChatInput;
