
import React from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useChatInput } from '@/hooks/useChatInput';

const ChatInterface: React.FC = () => {
  useAuthCheck();
  const { getCurrentChat, isLoading } = useChatStore();
  const currentChat = getCurrentChat();
  const { input, setInput, handleSend } = useChatInput();
  const { 
    isRecording, 
    handleStartRecording, 
    handleStopRecording, 
    handleCancelRecording 
  } = useVoiceRecorder();

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
