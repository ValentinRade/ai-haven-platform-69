
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-5 w-5" />
            <span>Zurück</span>
          </Link>
        </div>
        
        <div className="flex flex-col items-center">
          <h1 className="font-semibold text-lg text-gray-800">Immobilien-Chat</h1>
          <p className="text-xs text-gray-500">Unsere Experten helfen Ihnen</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src="/lovable-uploads/6d473eb1-0f85-450b-9d9d-89796c9e141a.png" alt="Immobilien Experten" />
              <AvatarFallback>IE</AvatarFallback>
            </Avatar>
          </div>
          <Link to="/" className="flex items-center text-gray-600 hover:text-primary transition-colors">
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
