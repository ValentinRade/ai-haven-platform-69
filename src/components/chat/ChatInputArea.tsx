
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { VoiceRecorder } from '@/utils/voiceRecorder';

const ChatInputArea: React.FC = () => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  
  const { 
    addMessageToCurrentChat, 
    createNewChat, 
    currentChatId, 
    isLoading 
  } = useChatStore();

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Handle recording timer
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

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');

    if (!currentChatId) {
      await createNewChat();
    }
    
    await addMessageToCurrentChat({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });
  };

  const handleStartRecording = async () => {
    try {
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      const base64Audio = await voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
      
      if (!currentChatId) {
        await createNewChat();
      }
      
      await addMessageToCurrentChat({
        type: 'user',
        content: base64Audio,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  const handleCancelRecording = async () => {
    try {
      await voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      setIsRecording(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
              className="rounded-full h-8 w-8 flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={handleStartRecording}
              aria-label="Sprachaufnahme starten"
            >
              <Mic size={18} />
            </Button>
            <Button 
              onClick={handleSend} 
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
                onClick={handleCancelRecording}
                aria-label="Aufnahme abbrechen"
              >
                <Trash2 size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={handleStopRecording}
                aria-label="Aufnahme beenden und senden"
              >
                <MicOff size={18} />
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

export default ChatInputArea;
