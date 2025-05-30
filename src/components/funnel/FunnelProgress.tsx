
import React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FunnelProgressProps {
  currentStep: number;
  totalSteps?: number; // Make totalSteps optional
}

const FunnelProgress: React.FC<FunnelProgressProps> = ({ 
  currentStep
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        <Badge 
          variant="default" 
          className="bg-immo-green text-white px-3 py-1 rounded-full font-medium"
        >
          Schritt {currentStep}
        </Badge>
        <div className="h-[1px] flex-grow bg-gray-200"></div>
      </div>
    </div>
  );
};

export default FunnelProgress;
