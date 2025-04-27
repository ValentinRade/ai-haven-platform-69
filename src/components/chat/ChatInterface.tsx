
import React, { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useChatInput } from '@/hooks/useChatInput';

const ChatInterface: React.FC = () => {
  // Custom hooks (must be called in the same order on every render)
  const { getCurrentChat, isLoading } = useChatStore();
  const { input, setInput, handleSend } = useChatInput();
  const { 
    isRecording, 
    handleStartRecording, 
    handleStopRecording, 
    handleCancelRecording 
  } = useVoiceRecorder();
  
  // This hook needs to come after all other hooks to avoid ordering issues
  useAuthCheck();

  const currentChat = getCurrentChat();

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
