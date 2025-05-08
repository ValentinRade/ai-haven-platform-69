
import React from "react";

interface FunnelProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FunnelProgress: React.FC<FunnelProgressProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  // Calculate progress percentage
  const progressPercentage = Math.floor((currentStep / totalSteps) * 100);
  
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Schritt {currentStep} von {totalSteps}</span>
        <span>{progressPercentage}% abgeschlossen</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FunnelProgress;
