
import React from "react";
import { marked } from "marked";
import { motion } from "framer-motion";
import TypewriterText from "./TypewriterText";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageBubbleProps {
  message: Message;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  // Function to render markdown and HTML in messages (for user messages)
  const renderMessageContent = (content: string) => {
    try {
      // Use marked to parse markdown to HTML
      const parsedHtml = marked(content);
      return <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />;
    } catch (error) {
      console.error("Error parsing message content:", error);
      return <div>{content}</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl max-w-[85%] ${
          message.isUser
            ? "bg-primary text-white rounded-br-none shadow-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-none shadow-sm"
        }`}
      >
        {message.isUser ? (
          <div>{message.content}</div>
        ) : (
          <TypewriterText content={message.content} speed={30} />
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessageBubble;
