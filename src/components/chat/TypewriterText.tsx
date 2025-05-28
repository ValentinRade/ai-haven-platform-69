
import React, { useState, useEffect } from "react";
import { marked } from "marked";

interface TypewriterTextProps {
  content: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ 
  content, 
  speed = 8, // Faster default speed
  onComplete 
}) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset when content changes
  useEffect(() => {
    setDisplayedContent("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [content]);

  // Main typewriter effect
  useEffect(() => {
    if (currentIndex < content.length && !isComplete) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= content.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, content, speed, isComplete, onComplete]);

  const renderTypedContent = (text: string) => {
    try {
      // Use marked to parse markdown to HTML
      const parsedHtml = marked(text);
      return <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />;
    } catch (error) {
      console.error("Error parsing message content:", error);
      return <div>{text}</div>;
    }
  };

  return (
    <div className="relative">
      {renderTypedContent(displayedContent)}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse" />
      )}
    </div>
  );
};

export default TypewriterText;
