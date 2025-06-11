
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface BinaryChoiceViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
  onOptionSelect?: (optionId: string) => void;
}

const BinaryChoiceView: React.FC<BinaryChoiceViewProps> = ({ form, data, onOptionSelect }) => {
  const { setValue } = form;
  const fieldName = data.id || data.stepId || `binaryChoice_${Date.now()}`;
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.content?.headline || data.title || "Bitte wähle eine Option";
  const description = data.content?.text || data.description;
  
  const options = data.options || [];
  
  // Ensure we have exactly 2 options for binary choice
  if (options.length !== 2) {
    console.warn("BinaryChoiceView requires exactly 2 options, got:", options.length);
  }

  const handleSelection = (value: string) => {
    setValue(fieldName, value);
    console.log(`Binary choice selection made: ${value} for field: ${fieldName}`);
    
    // Immediately trigger the next step without waiting for a "next" button
    if (onOptionSelect) {
      // Small delay to show the selection visually before proceeding
      setTimeout(() => {
        onOptionSelect(value);
      }, 200);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        <TypewriterText 
          content={title} 
          speed={8}
          onComplete={() => setTitleAnimationComplete(true)}
        />
      </h2>
      {description && titleAnimationComplete && (
        <div className="text-gray-600 mb-8">
          <TypewriterText 
            content={description} 
            speed={8} 
            onComplete={() => setTextAnimationComplete(true)}
          />
        </div>
      )}

      {/* Show binary choice options after text animation completes */}
      {options.length === 2 && ((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <div 
              key={option.id} 
              className="group flex items-center justify-center rounded-xl border-2 p-6 md:p-8 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 hover:shadow-lg transform hover:scale-105 duration-200 min-h-[120px]"
              onClick={() => handleSelection(option.id)}
            >
              <div className="text-center">
                <div className="text-lg md:text-xl font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {option.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show error message if not exactly 2 options */}
      {options.length !== 2 && ((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            Binary Choice erfordert genau 2 Optionen, aber {options.length} wurden bereitgestellt.
          </p>
        </div>
      )}
    </div>
  );
};

export default BinaryChoiceView;
