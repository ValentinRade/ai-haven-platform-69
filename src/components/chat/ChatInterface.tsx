
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from './ChatMessage';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentChat, addMessageToCurrentChat } = useChatStore();
  const currentChat = getCurrentChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to simulate AI response
  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate network delay
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
    
    // Add user message
    addMessageToCurrentChat({
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    });
    
    // Clear input
    setInput('');
    
    // Simulate AI response
    simulateAIResponse(input);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  if (!currentChat) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {currentChat.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="chat-message-ai px-4 py-3 max-w-[80%]">
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
      
      <div className="sticky bottom-0 bg-gray-50 pt-2 pb-4 px-4">
        <div className="flex items-end gap-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreiben Sie eine Nachricht..."
            className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px]"
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
