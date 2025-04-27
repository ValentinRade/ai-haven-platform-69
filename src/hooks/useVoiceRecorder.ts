
import { useState, useRef } from 'react';
import { VoiceRecorder } from '@/utils/voiceRecorder';
import { toast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chatStore';

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const { addMessageToCurrentChat, createNewChat, currentChatId } = useChatStore();

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

  return {
    isRecording,
    handleStartRecording,
    handleStopRecording,
    handleCancelRecording
  };
};
