
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
    isLoading 
  } = useChatStore();
  const currentChat = getCurrentChat();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um den Chat zu nutzen.",
          variant: "default"
        });
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');

    if (!currentChatId) {
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
      toast({
        title: "Aufnahme gestartet",
        description: "Sprechen Sie jetzt...",
      });
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
      setIsRecording(false);
      const base64Audio = await voiceRecorderRef.current.stopRecording();
      
      if (!currentChatId) {
        await createNewChat();
      }
      
      const duration = voiceRecorderRef.current.estimateDuration(base64Audio);
      
      await addMessageToCurrentChat({
        type: 'user',
        content: base64Audio,
        timestamp: new Date(),
        duration: duration
      });

      toast({
        title: "Sprachnachricht gesendet",
        description: `${duration} Sekunden Aufnahme gesendet.`,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast({
        title: "Fehler beim Beenden der Aufnahme",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  const handleCancelRecording = async () => {
    try {
      if (!isRecording) return;
      
      // Stop the recording but don't send the audio
      await voiceRecorderRef.current.stopRecording();
      // Reset the recording state
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
      <ChatHeader title={currentChat?.title || 'Neuer Chat'} />
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
