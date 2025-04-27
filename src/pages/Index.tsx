
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';

const Index = () => {
  const { loadChats, chats } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return <Navigate to="/" replace />;
};

export default Index;
