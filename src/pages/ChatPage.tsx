
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useChatStore } from "@/store/chatStore";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Use the chat store
  const { 
    messages, 
    isLoading, 
    userId,
    addMessage, 
    setIsLoading,
    sendToWebhook
  } = useChatStore();
  
  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        content: "Hey! 👋 Willkommen bei Immofinanz. Erzähl mir, nach welcher Art von Immobilie du suchst?",
        isUser: false
      });
    }
  }, [messages.length, addMessage]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    addMessage({
      content: message,
      isUser: true
    });
    
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    // Send message to webhook
    try {
      console.log("Using persistent user ID:", userId);
      await sendToWebhook(currentMessage);
      
      // Continue with simulated response
      setTimeout(() => {
        let botResponse = "";
        
        if (messages.length === 1) {
          // First question response
          botResponse = "Super! In welcher Region/Stadt suchst du? Das hilft mir, passende Angebote zu finden.";
        } else if (messages.length === 3) {
          // Second question response
          botResponse = "Wie groß sollte die Immobilie sein? (Zimmeranzahl oder m²)";
        } else if (messages.length === 5) {
          // Third question response
          botResponse = "Was ist dein ungefähres Budget?";
        } else {
          // Default response
          botResponse = "Danke für deine Angaben! Ich habe alle Infos zusammengestellt. Ein Immobilienexperte wird sich innerhalb von 24 Stunden mit passenden Angeboten bei dir melden. Möchtest du noch etwas ergänzen?";
        }
        
        addMessage({
          content: botResponse,
          isUser: false
        });
        
        setIsLoading(false);

        toast({
          title: "Neuer Schritt",
          description: "Wir kommen deiner Traumimmobilie näher!",
        });
      }, 1500);
      
    } catch (error) {
      console.error("Error sending message to webhook:", error);
      
      toast({
        title: "Hinweis",
        description: "Es gab ein Problem bei der Kommunikation. Wir verarbeiten deine Anfrage lokal.",
        variant: "destructive",
      });
      
      // Continue with simulated response even if webhook fails
      setTimeout(() => {
        let botResponse = "";
        
        if (messages.length === 1) {
          // First question response
          botResponse = "Super! In welcher Region/Stadt suchst du? Das hilft mir, passende Angebote zu finden.";
        } else if (messages.length === 3) {
          // Second question response
          botResponse = "Wie groß sollte die Immobilie sein? (Zimmeranzahl oder m²)";
        } else if (messages.length === 5) {
          // Third question response
          botResponse = "Was ist dein ungefähres Budget?";
        } else {
          // Default response
          botResponse = "Danke für deine Angaben! Ich habe alle Infos zusammengestellt. Ein Immobilienexperte wird sich innerhalb von 24 Stunden mit passenden Angeboten bei dir melden. Möchtest du noch etwas ergänzen?";
        }
        
        addMessage({
          content: botResponse,
          isUser: false
        });
        
        setIsLoading(false);

        toast({
          title: "Neuer Schritt",
          description: "Wir kommen deiner Traumimmobilie näher!",
        });
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Header - Smaller on mobile */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-2 md:py-4 px-3 md:px-4 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary hover:text-primary/90">
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-sm" : ""}>Zurück</span>
            </Link>
          </div>
          <img 
            src="/lovable-uploads/d3c3c26f-df32-4d33-9430-cf975050325f.png" 
            alt="Immofinanz Logo" 
            className="h-6 md:h-8"
          />
        </div>
      </header>

      <div className="flex-grow container mx-auto px-2 md:px-4 py-3 md:py-8 flex flex-col overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xl md:text-3xl font-bold text-center mb-2 md:mb-8 ${isMobile ? "hidden" : "block"}`}
        >
          KI-Chat für deine Immobiliensuche
        </motion.h1>
        
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto flex flex-col flex-grow">
          {/* Chat Messages - Expand to fill available space */}
          <div className="p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto flex-grow">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 md:p-3 rounded-xl md:rounded-2xl max-w-[85%] ${
                    msg.isUser
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 md:p-3 rounded-xl md:rounded-2xl rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatRef}></div>
          </div>

          {/* Chat Input - Fixed at bottom */}
          <div className="border-t border-gray-200 p-2 md:p-3 bg-gray-50">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Schreibe deine Nachricht hier..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none border border-gray-200 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] md:min-h-[60px] max-h-[100px] md:max-h-[120px] rounded-xl text-sm md:text-base"
              />
              <Button
                className="bg-primary hover:bg-primary/90 h-10 w-10 md:h-12 md:w-12 rounded-full p-0 flex items-center justify-center shadow-md"
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
              >
                <Send size={isMobile ? 16 : 18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - smaller/hidden on mobile */}
      <footer className={`bg-white border-t border-gray-200 py-2 md:py-4 px-3 md:px-4 mt-auto flex-shrink-0 ${isMobile ? "hidden" : "block"}`}>
        <div className="container mx-auto text-center">
          <p className="text-xs md:text-sm text-gray-500">
            © {new Date().getFullYear()} Immofinanz GmbH. Alle Rechte vorbehalten.
          </p>
          <div className="mt-1 md:mt-2 flex justify-center space-x-4 md:space-x-6">
            <a href="#" className="text-xs text-primary hover:underline">Datenschutz</a>
            <a href="#" className="text-xs text-primary hover:underline">Impressum</a>
            <a href="#" className="text-xs text-primary hover:underline">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
