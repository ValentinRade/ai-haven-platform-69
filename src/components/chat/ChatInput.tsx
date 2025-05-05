
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatStore } from "@/store/chatStore";
import { toast } from "@/hooks/use-toast";

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  
  const { 
    addMessage, 
    setIsLoading,
    sendToWebhook
  } = useChatStore();

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

    try {
      // Send message to webhook and get response
      const botResponse = await sendToWebhook(currentMessage);
      
      // Add bot response from webhook
      if (botResponse) {
        addMessage({
          content: botResponse,
          isUser: false
        });
      }
      
      toast({
        title: "Neue Nachricht",
        description: "Wir haben eine Antwort für dich!",
      });
    } catch (error) {
      console.error("Error in chat interaction:", error);
      
      addMessage({
        content: "Es tut mir leid, es gab ein Problem bei der Kommunikation mit dem Server. Bitte versuche es später noch einmal.",
        isUser: false
      });
      
      toast({
        title: "Hinweis",
        description: "Es gab ein Problem bei der Kommunikation. Bitte versuche es später noch einmal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 p-2.5 md:p-3.5 bg-gray-50">
      <div className="flex items-end gap-2.5">
        <Textarea
          placeholder="Schreibe deine Nachricht hier..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none border border-gray-200 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] md:min-h-[60px] max-h-[100px] md:max-h-[120px] rounded-xl text-sm md:text-base shadow-sm transition-all"
        />
        <Button
          className="bg-primary hover:bg-primary/90 h-10 w-10 md:h-12 md:w-12 rounded-full p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
          onClick={handleSendMessage}
          disabled={!message.trim() || useChatStore().isLoading}
        >
          <Send size={isMobile ? 16 : 18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
