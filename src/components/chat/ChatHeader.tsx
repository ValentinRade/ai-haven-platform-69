
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatHeader: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
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
  );
};

export default ChatHeader;
