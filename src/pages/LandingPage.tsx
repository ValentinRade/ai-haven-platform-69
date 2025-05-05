
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
      content: "Hallo! Ich bin der Immofinanz-Assistent. Wie kann ich dir heute helfen?",
      isUser: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

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

    // Simulate response (would be replaced with actual API call)
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        content: "Danke für deine Anfrage! Einer unserer Immobilienexperten wird sich in Kürze bei dir melden.",
        isUser: false,
      };
      
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);

      toast({
        title: "Nachricht gesendet",
        description: "Wir haben deine Anfrage erhalten!",
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
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container px-4 py-2 flex items-center justify-center">
          <img 
            src="/lovable-uploads/d3c3c26f-df32-4d33-9430-cf975050325f.png" 
            alt="Immofinanz Mobile Logo" 
            className="h-10"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-8 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Immobilien leicht gemacht
          </h1>
          <p className="text-gray-600 mb-6">
            Finden Sie Ihre Traumimmobilie mit unserem innovativen KI-Assistenten
          </p>
          <div className="relative w-full max-w-md mx-auto">
            <img 
              src="/lovable-uploads/c347b4c9-f575-4333-aeb2-3c8013a34710.png" 
              alt="Immobilien Illustration" 
              className="w-full rounded-lg shadow-md"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                onClick={() => scrollToBottom()}
              >
                Chat starten <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-2 text-primary">Schnelle Beratung</h3>
              <p className="text-gray-600">Erhalten Sie sofort qualifizierte Beratung zu Immobilien in Ihrer Nähe.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-2 text-primary">Personalisierte Angebote</h3>
              <p className="text-gray-600">Unsere KI findet passende Immobilien basierend auf Ihren Wünschen.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-2 text-primary">Einfache Terminvereinbarung</h3>
              <p className="text-gray-600">Vereinbaren Sie Besichtigungstermine direkt über unseren Chat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Chatten Sie mit uns</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Chat Messages */}
            <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.isUser
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Schreiben Sie eine Nachricht..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 resize-none border border-gray-200 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary min-h-[60px] max-h-[120px]"
                />
                <Button
                  className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full p-0 flex items-center justify-center"
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
      <footer className="bg-white border-t border-gray-200 py-4 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Immofinanz GmbH. Alle Rechte vorbehalten.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
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
