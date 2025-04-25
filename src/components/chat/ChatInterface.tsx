import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, UserRound, Settings, BrainCircuit, Mic, MicOff, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from './ChatMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VoiceRecorder } from '@/utils/voiceRecorder';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const { getCurrentChat, addMessageToCurrentChat, createNewChat, currentChatId } = useChatStore();
  const currentChat = getCurrentChat();
  const navigate = useNavigate();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um den Chat zu nutzen.",
          variant: "default"
        });
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    setIsLoading(false);
  };
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');

    // If no chat exists or no chat is selected, create a new one first
    if (!currentChatId) {
      await createNewChat();
    }
    
    await addMessageToCurrentChat({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    
    await simulateAIResponse(userMessage);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartRecording = async () => {
    try {
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
      toast({
        title: "Aufnahme gestartet",
        description: "Sprechen Sie jetzt...",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Fehler beim Starten der Aufnahme",
        description: "Bitte überprüfen Sie die Mikrofonberechtigung.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
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
      toast({
        title: "Fehler beim Beenden der Aufnahme",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="bg-white shadow-sm border-b border-gray-200 p-3 h-14 flex items-center justify-between w-full">
        <div className="flex-1">
          <h1 className="text-xl font-medium truncate max-w-[80%]">
            {currentChat ? currentChat.title : 'Neuer Chat'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full border-gray-200">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-gray-600" />
              <span>AI Chat</span>
            </div>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full border-gray-200">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-gray-600" />
              <span>Admin</span>
            </div>
          </Button>
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src="" />
            <AvatarFallback>
              <UserRound size={20} />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
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
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            aria-label={isRecording ? "Aufnahme beenden" : "Sprachaufnahme starten"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
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
        </div>
        <div className="text-xs text-center mt-1 text-gray-500">
          Immofinanz AI © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
