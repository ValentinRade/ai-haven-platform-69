
export const isAudioMessage = (content: string): boolean => {
  return content.startsWith('/9j/') || 
         content.startsWith('GkXf') || 
         content.startsWith('T21v');
};
