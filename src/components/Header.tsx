
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleOpenChat = () => {
    // Statt den Chat zu öffnen, navigieren wir zur Chat-Seite
    navigate('/chat');
  };

  return (
    <header className="relative z-10">
      {/* Hero Image Background */}
      <div className="w-full h-[400px] md:h-[500px] relative overflow-hidden">
        <img 
          src="/lovable-uploads/aefaa6f6-c772-4c1f-917b-f0a8c77a531d.png" 
          alt="Moderne Architektur" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60">
          {/* Header Content */}
          <div className="container mx-auto px-4 h-full flex flex-col">
            {/* Top Navigation */}
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
                  <Video className="w-4 h-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium text-gray-800">@immofinanz</span>
                </div>
              </div>
            </div>
            
            {/* Hero Content - Using flex to position content and buttons */}
            <div className="flex-grow flex flex-col">
              {/* Text content with proper spacing */}
              <div className="flex-grow flex flex-col justify-center pt-4 px-4 md:px-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md mb-3">
                  Entdecken Sie Ihr Traumhaus
                </h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-lg mb-6">
                  Moderne Architektur trifft auf intelligente Raumnutzung
                </p>
              </div>
              
              {/* Buttons positioned at bottom with padding - ensures visibility */}
              <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 pb-6 px-4 md:px-0">
                <Button 
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-6 py-2.5 rounded-full shadow-lg w-full md:w-auto text-sm"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Immobilien entdecken
                </Button>
                
                <motion.button
                  onClick={handleOpenChat}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 w-full md:w-auto text-sm"
                  whileHover={{ 
                    boxShadow: "0 0 15px rgba(0, 130, 66, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  KI Chat öffnen
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
