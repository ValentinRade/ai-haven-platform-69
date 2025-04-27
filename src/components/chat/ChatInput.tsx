
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { VoiceRecorder } from '@/utils/voiceRecorder';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isRecording,
  onSend,
  onStartRecording,
  onStopRecording
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex-shrink-0"
          aria-label="Datei hochladen"
        >
          <Paperclip size={18} />
        </Button>
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
            isRecording 
              ? "text-red-500 hover:text-red-700 hover:bg-red-50" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          )}
          onClick={isRecording ? onStopRecording : onStartRecording}
          aria-label={isRecording ? "Aufnahme beenden" : "Sprachaufnahme starten"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
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
      </div>
      <div className="text-xs text-center mt-1 text-gray-500">
        Immofinanz AI © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ChatInput;
