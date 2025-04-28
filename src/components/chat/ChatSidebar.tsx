
import React, { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare, UserRound, Trash2, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { isAudioMessage } from '@/store/utils/chatUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSidebarProps {
  onChatSelect?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onChatSelect }) => {
  const { chats, currentChatId, setCurrentChat, createNewChat, loadChats, deleteChat } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId);
    if (onChatSelect) {
      onChatSelect();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={createNewChat}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <PlusCircle size={16} />
          <span>Neuer Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex flex-col w-full text-left rounded-lg px-3 py-3 transition-colors",
                  "hover:bg-gray-200",
                  currentChatId === chat.id 
                    ? "bg-gray-200" 
                    : "bg-white"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => handleChatSelect(chat.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback>
                          <UserRound size={14} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 truncate">{chat.creator_display_name || 'Unbenannt'}</span>
                      {chat.is_private && (
                        <span className="flex items-center text-xs text-gray-500 flex-shrink-0">
                          <EyeOff size={12} className="mr-1" />
                          Privat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare size={16} className="flex-shrink-0 text-gray-500" />
                      <span className="font-medium break-words line-clamp-2">{chat.title}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                      <span className="truncate max-w-[180px]">{chat.lastMessage}</span>
                      <span className="flex-shrink-0 ml-2">
                        {format(chat.timestamp, 'dd. MMM', { locale: de })}
                      </span>
                    </div>
                  </button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Chat löschen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchten Sie diesen Chat wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteChat(chat.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          size="sm"
          asChild
          className="w-full gap-2 text-xs"
        >
          <a href="/admin/workflow-overview">
            Admin-Bereich
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
