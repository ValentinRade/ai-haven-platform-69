
import React from "react";

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
  // Extract content from either format
  const title = data.content?.headline || data.title || "Information";
  const text = data.content?.text || data.description || "";
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {title}
      </h2>
      {text && (
        <p className="text-gray-600">{text}</p>
      )}
    </div>
  );
};

export default InfoView;
