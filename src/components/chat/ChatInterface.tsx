
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, UserRound, Settings, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from './ChatMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentChat, addMessageToCurrentChat } = useChatStore();
  const currentChat = getCurrentChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response: string;
    
    if (userMessage.toLowerCase().includes('immobilien')) {
      response = 'Die Immofinanz GmbH ist ein führendes Immobilienunternehmen mit Fokus auf Gewerbeimmobilien in Europa. Kann ich Ihnen weitere Informationen dazu geben?';
    } else if (userMessage.toLowerCase().includes('workflow')) {
      response = 'Sie können im Admin-Bereich einen neuen Workflow erstellen. Gehen Sie dazu auf "Admin" und dann "Workflow Builder".';
    } else if (userMessage.toLowerCase().includes('benutzer') || userMessage.toLowerCase().includes('user')) {
      response = 'Benutzerkonten können im Admin-Bereich unter "User Management" verwaltet werden.';
    } else {
      response = 'Danke für Ihre Anfrage. Als Immofinanz AI kann ich Ihnen bei Fragen zu Immobilien, Workflows und der Plattform helfen. Wie kann ich Ihnen weiterhelfen?';
    }
    
    addMessageToCurrentChat({
      type: 'ai',
      content: response,
      timestamp: new Date()
    });
    
    setIsLoading(false);
  };
  
  const handleSend = () => {
    if (input.trim() === '' || isLoading) return;
    
    addMessageToCurrentChat({
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    });
    
    setInput('');
    
    simulateAIResponse(input);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 h-16 flex items-center justify-between w-full">
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
      
      <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-144px)] w-full">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center text-gray-500">
              <img 
                src="/lovable-uploads/c347b4c9-f575-4333-aeb2-3c8013a34710.png" 
                alt="Immofinanz Logo" 
                className="mx-auto h-16 mb-4" 
              />
              <h2 className="text-2xl font-medium mb-2">Willkommen bei Immofinanz AI</h2>
              <p className="max-w-md">
                Stellen Sie Fragen zu Immobilien, Workflows oder der Plattform.
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
      
      <div className="bg-gray-50 pt-2 pb-4 px-4 border-t border-gray-200 h-32 w-full">
        <div className="flex items-end gap-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm w-full">
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
        <div className="text-xs text-center mt-2 text-gray-500">
          Immofinanz AI © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
