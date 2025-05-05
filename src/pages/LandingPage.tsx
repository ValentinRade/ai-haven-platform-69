import React, { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ChevronDown, Home, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Header from '@/components/Header';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const LandingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hey! 👋 Willkommen bei Immofinanz. Erzähl mir, nach welcher Art von Immobilie du suchst?",
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Simulate response based on the conversation flow
    setTimeout(() => {
      let botResponse;
      
      if (messages.length === 1) {
        // First question response
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Super! In welcher Region/Stadt suchst du? Das hilft mir, passende Angebote zu finden.",
          isUser: false,
        };
      } else if (messages.length === 3) {
        // Second question response
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Wie groß sollte die Immobilie sein? (Zimmeranzahl oder m²)",
          isUser: false,
        };
      } else if (messages.length === 5) {
        // Third question response
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Was ist dein ungefähres Budget?",
          isUser: false,
        };
      } else {
        // Default response
        botResponse = {
          id: (Date.now() + 1).toString(),
          content: "Danke für deine Angaben! Ich habe alle Infos zusammengestellt. Ein Immobilienexperte wird sich innerhalb von 24 Stunden mit passenden Angeboten bei dir melden. Möchtest du noch etwas ergänzen?",
          isUser: false,
        };
      }
      
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);

      toast({
        title: "Neuer Schritt",
        description: "Wir kommen deiner Traumimmobilie näher!",
      });
    }, 1500);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header component with hero section */}
      <Header />

      {/* Features Section - with adjusted margins to account for new header */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Warum Immofinanz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Schnelle Beratung</h3>
                <p className="text-gray-600">Finde in unter 5 Minuten heraus, welche Immobilien für dich verfügbar sind</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Personalisierte Vorschläge</h3>
                <p className="text-gray-600">Erhalte maßgeschneiderte Immobilienangebote, die perfekt zu deinen Wünschen passen</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Einfacher Prozess</h3>
                <p className="text-gray-600">Vom Chat zur Besichtigung in kürzester Zeit - ohne komplizierte Formulare</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="flex-grow py-6 px-4 bg-gray-50">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-6"
          >
            Starte deinen Immobilien-Chat
          </motion.h2>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Chat Messages */}
            <div className="p-4 space-y-4 min-h-[350px] max-h-[450px] overflow-y-auto">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] ${
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
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-none">
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

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Schreibe deine Nachricht hier..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 resize-none border border-gray-200 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary min-h-[60px] max-h-[120px] rounded-xl"
                />
                <Button
                  className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full p-0 flex items-center justify-center shadow-md"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 mt-6">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Immofinanz GmbH. Alle Rechte vorbehalten.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <a href="#" className="text-xs text-primary hover:underline">Datenschutz</a>
            <a href="#" className="text-xs text-primary hover:underline">Impressum</a>
            <a href="#" className="text-xs text-primary hover:underline">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
