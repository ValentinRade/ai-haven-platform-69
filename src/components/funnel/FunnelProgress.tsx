
import React from "react";

interface FunnelProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FunnelProgress: React.FC<FunnelProgressProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="mb-8">
      <div className="text-sm text-gray-500 mb-2">
        <span>Schritt {currentStep}</span>
      </div>
    </div>
  );
};

export default FunnelProgress;
