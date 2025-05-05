
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useChatStore } from "@/store/chatStore";

const ChatButton: React.FC = () => {
  const { setIsOpen } = useChatStore();

  const handleOpenChat = () => {
    setIsOpen(true);
    toast({
      title: "KI-Chat wird geöffnet",
      description: "Unser virtueller Assistent hilft dir bei deiner Immobiliensuche."
    });
    // Scroll to chat section
    const chatSection = document.getElementById("chat-section");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleOpenChat}
        size="lg"
        className="rounded-full shadow-lg bg-primary hover:bg-primary/90 h-14 w-14 p-0"
      >
        <MessageCircle size={24} className="text-white" />
      </Button>
    </motion.div>
  );
};

export default ChatButton;
