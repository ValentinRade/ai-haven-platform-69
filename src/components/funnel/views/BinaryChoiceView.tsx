
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const title = data.content?.headline || data.title || "Bitte wähle eine Option";
  const description = data.content?.text || data.description;
  
  const options = data.options || [];
  
  // Ensure we have exactly 2 options for binary choice
  if (options.length !== 2) {
    console.warn("BinaryChoiceView requires exactly 2 options, got:", options.length);
  }

  const handleSelection = (value: string) => {
    setSelectedOption(value);
    setValue(fieldName, value);
    console.log(`Binary choice selection made: ${value} for field: ${fieldName}`);
    
    // Immediately trigger the next step without waiting for a "next" button
    if (onOptionSelect) {
      // Small delay to show the selection visually before proceeding
      setTimeout(() => {
        onOptionSelect(value);
      }, 300);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            return (
              <div 
                key={option.id} 
                className={`
                  group relative overflow-hidden rounded-2xl cursor-pointer
                  transition-all duration-300 ease-out transform
                  ${isSelected 
                    ? 'bg-primary text-white shadow-2xl scale-105 ring-4 ring-primary/20' 
                    : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30 hover:shadow-xl hover:scale-102'
                  }
                  min-h-[140px] md:min-h-[160px]
                `}
                onClick={() => handleSelection(option.id)}
              >
                {/* Background gradient overlay */}
                <div className={`
                  absolute inset-0 transition-opacity duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-primary to-primary/90 opacity-100' 
                    : 'bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100'
                  }
                `} />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center h-full p-6 md:p-8">
                  <div className="text-center">
                    {/* Option number indicator */}
                    <div className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-4
                      transition-all duration-300
                      ${isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      }
                    `}>
                      {index + 1}
                    </div>
                    
                    {/* Option label */}
                    <div className={`
                      text-lg md:text-xl font-semibold leading-relaxed
                      transition-all duration-300
                      ${isSelected 
                        ? 'text-white' 
                        : 'text-gray-900 group-hover:text-primary'
                      }
                    `}>
                      {option.label}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Subtle animation effect */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-300
                  ${isSelected 
                    ? 'ring-2 ring-white/30' 
                    : 'ring-0'
                  }
                `} />
              </div>
            );
          })}
        </div>
      )}

      {/* Show error message if not exactly 2 options */}
      {options.length !== 2 && ((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 text-lg font-medium">
              Binary Choice erfordert genau 2 Optionen, aber {options.length} wurden bereitgestellt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinaryChoiceView;
