
import React, { useState } from "react";
import TypewriterText from "@/components/chat/TypewriterText";

interface InfoViewProps {
  data: {
    title?: string;
    description?: string;
    content?: {
      headline?: string;
      text: string;
    };
  };
}

const InfoView: React.FC<InfoViewProps> = ({ data }) => {
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  
  // Extract content from either format
  const title = data.content?.headline || data.title || "Information";
  const text = data.content?.text || data.description || "";
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        <TypewriterText 
          content={title}
          speed={8}
          onComplete={() => setTitleAnimationComplete(true)}
        />
      </h2>
      {text && titleAnimationComplete && (
        <div className="text-gray-600">
          <TypewriterText content={text} speed={8} />
        </div>
      )}
    </div>
  );
};

export default InfoView;
