
import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';

export const useChatInput = () => {
  const [input, setInput] = useState('');
  const { addMessageToCurrentChat, createNewChat, currentChatId, isLoading } = useChatStore();

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

  return {
    input,
    setInput,
    handleSend,
    isLoading
  };
};
