
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hallo! Ich bin die Immofinanz AI. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date()
    }]);
    
    setIsLoading(false);
  };
  
  const handleSend = () => {
    if (input.trim() === '' || isLoading) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }]);
    
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
  }, [messages]);

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 p-2">
          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "flex w-full",
                  message.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] px-4 py-3",
                    message.type === 'user' ? "chat-message-user" : "chat-message-ai"
                  )}
                >
                  <div className="prose">
                    <p className="m-0 text-sm sm:text-base">{message.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
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
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 pt-2 pb-4">
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
    </div>
  );
};

export default ChatPage;
