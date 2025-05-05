import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const ChatPage: React.FC = () => {
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
  
  // Webhook URL
  const webhookUrl = "https://agent.snipe-solutions.de/webhook-test/antragsstrecke";

  const handleSendMessage = async () => {
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

    // Send message to webhook
    try {
      console.log("Sending message to webhook:", message);
      
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          userId: "user-" + Date.now(),
          timestamp: new Date().toISOString(),
          conversation: messages.map(msg => ({
            content: msg.content,
            isUser: msg.isUser
          }))
        }),
      });
      
      console.log("Webhook response status:", webhookResponse.status);
      
      // Continue with simulated response (can be replaced with actual webhook response later)
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
      
    } catch (error) {
      console.error("Error sending message to webhook:", error);
      
      // Continue with local response even if webhook fails
      toast({
        title: "Hinweis",
        description: "Es gab ein Problem bei der Kommunikation. Wir verarbeiten deine Anfrage lokal.",
        variant: "destructive",
      });
      
      // Continue with simulated response
      // ... keep existing code (simulated response logic)
    } finally {
      // setIsLoading will be set to false in the setTimeout above
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-primary hover:text-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Startseite
            </Link>
          </div>
          <img 
            src="/lovable-uploads/d3c3c26f-df32-4d33-9430-cf975050325f.png" 
            alt="Immofinanz Logo" 
            className="h-8"
          />
        </div>
      </header>

      <div className="flex-grow container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-center mb-8"
        >
          KI-Chat für deine Immobiliensuche
        </motion.h1>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto">
          {/* Chat Messages */}
          <div className="p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
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

        {/* Personal Contact Section - Added below the chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mt-12 mb-8"
        >
          <Card className="overflow-hidden border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2">
                <img 
                  src="/lovable-uploads/73b0ef6d-60db-4cab-8d68-27df33713747.png" 
                  alt="Immobilien-Berater" 
                  className="w-full h-full object-cover aspect-square md:aspect-auto"
                />
              </div>
              <CardContent className="flex flex-col p-6 w-full md:w-1/2">
                <h3 className="text-xl font-bold mb-3">Persönliche Beratung</h3>
                <p className="text-gray-700 mb-4">
                  Unser erfahrenes Team steht dir bei allen Fragen rund um deine Immobiliensuche zur Seite. Wir nehmen uns Zeit für ein persönliches Gespräch, um deine Wünsche und Bedürfnisse genau zu verstehen.
                </p>
                <p className="text-gray-700 mb-4">
                  Nach dem Chat-Gespräch kontaktieren wir dich innerhalb von 24 Stunden, um die nächsten Schritte zu besprechen.
                </p>
                <Button className="mt-auto bg-primary hover:bg-primary/90">
                  Termin vereinbaren
                </Button>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 mt-auto">
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

export default ChatPage;
