
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const ChatHeader: React.FC = () => {
  return (
    <div className="relative z-10">
      {/* Hero Image Background */}
      <div className="w-full h-[300px] md:h-[350px] relative overflow-hidden">
        <img 
          src="/lovable-uploads/78e7591f-1b78-4d71-acec-50eeb55db11f.png" 
          alt="Immobilien Experten" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60">
          {/* Header Content */}
          <div className="container mx-auto px-4 h-full flex flex-col">
            {/* Top Navigation */}
            <div className="flex items-center justify-between py-4">
              <Link to="/" className="flex items-center text-white hover:text-primary/90 transition-colors">
                <ChevronLeft className="mr-1 h-5 w-5" />
                <span>Zurück</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-white hover:text-primary/90 transition-colors">
                  <Home className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            {/* Hero Content */}
            <div className="flex-grow flex flex-col justify-center pt-4 px-4 md:px-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-md mb-3 text-center">
                Immobilien-Chat
              </h1>
              <p className="text-md md:text-xl text-white/90 drop-shadow-md max-w-2xl mx-auto text-center">
                Beschreiben Sie uns Ihre Wunschimmobilie und unsere Experten finden das perfekte Zuhause für Sie
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
