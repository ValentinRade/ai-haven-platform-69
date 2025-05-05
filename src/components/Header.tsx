
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/store/chatStore';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import ChatButton from './ChatButton';

const Header: React.FC = () => {
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
    <>
      <header className="relative z-10">
        {/* Hero Image Background */}
        <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden">
          <img 
            src="/lovable-uploads/aefaa6f6-c772-4c1f-917b-f0a8c77a531d.png" 
            alt="Moderne Architektur" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent">
            {/* Header Content */}
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center justify-between py-4">
                <Link to="/" className="flex items-center">
                  <img 
                    src="/lovable-uploads/d3c3c26f-df32-4d33-9430-cf975050325f.png" 
                    alt="Immofinanz Logo" 
                    className="h-10 drop-shadow-md"
                  />
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-white/20">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-xs md:text-sm font-medium text-gray-800">TikTok Immobilien</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Content */}
              <div className="pt-16 md:pt-24 px-4 md:px-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md mb-2">
                  Entdecken Sie Ihr Traumhaus
                </h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-lg mb-6">
                  Moderne Architektur trifft auf intelligente Raumnutzung
                </p>
                
                {/* New KI Chat Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex space-x-4"
                >
                  <Button 
                    className="bg-white text-primary hover:bg-white/90 font-medium px-6 py-2 rounded-full shadow-lg"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Immobilien entdecken
                  </Button>
                  
                  <motion.button
                    onClick={handleOpenChat}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-full shadow-lg flex items-center transition-all duration-300 hover:scale-105"
                    whileHover={{ 
                      boxShadow: "0 0 15px rgba(0, 130, 66, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    KI Chat öffnen
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Add the ChatButton component */}
      <ChatButton />
    </>
  );
};

export default Header;
