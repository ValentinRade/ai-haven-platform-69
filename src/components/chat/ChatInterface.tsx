
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VoiceRecorder } from '@/utils/voiceRecorder';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const voiceRecorderRef = React.useRef<VoiceRecorder>(new VoiceRecorder());
  const { 
    getCurrentChat, 
    addMessageToCurrentChat, 
    createNewChat, 
    currentChatId, 
    isLoading,
    loadChats
  } = useChatStore();
  const currentChat = getCurrentChat();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Nicht angemeldet",
            description: "Bitte melden Sie sich an, um den Chat zu nutzen.",
            variant: "default"
          });
          navigate('/auth');
          return;
        }
        
        console.log('User authenticated, loading chats');
        loadChats();
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast({
          title: "Fehler bei der Authentifizierung",
          description: "Bitte versuchen Sie es später erneut.",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
    
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, loading chats');
        loadChats();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, loadChats]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');

    if (!currentChatId) {
      console.log('No current chat ID, creating new chat');
      await createNewChat();
    }
    
    await addMessageToCurrentChat({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });
  };

  const handleStartRecording = async () => {
    try {
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Fehler beim Starten der Aufnahme",
        description: "Bitte überprüfen Sie die Mikrofonberechtigung.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      const base64Audio = await voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
      
      if (!currentChatId) {
        await createNewChat();
      }
      
      await addMessageToCurrentChat({
        type: 'user',
        content: base64Audio,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      toast({
        title: "Fehler beim Beenden der Aufnahme",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const handleCancelRecording = async () => {
    try {
      await voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
      toast({
        title: "Aufnahme abgebrochen",
        description: "Die Sprachnachricht wurde gelöscht.",
      });
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      setIsRecording(false);
      toast({
        title: "Fehler beim Abbrechen der Aufnahme",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatHeader />
      <ChatMessageList currentChat={currentChat} isLoading={isLoading} />
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isRecording={isRecording}
        onSend={handleSend}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onCancelRecording={handleCancelRecording}
      />
    </div>
  );
};

export default ChatInterface;
