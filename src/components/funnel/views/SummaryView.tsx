
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface SummaryViewProps {
  data: {
    title?: string;
    description?: string;
    content?: {
      headline?: string;
      text: string;
    };
    summaryItems?: Array<{ label: string; value: string }>;
  };
  onEditStep?: (stepId: string) => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ data, onEditStep }) => {
  // Extract content from either format
  const title = data.content?.headline || data.title || "Zusammenfassung";
  const text = data.content?.text || data.description || "Hier ist eine Zusammenfassung deiner Angaben.";
  const items = data.summaryItems || [];
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6">{text}</p>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                <span className="font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center">
                  <span className="text-gray-900">{item.value}</span>
                  {onEditStep && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0"
                      onClick={() => onEditStep(index.toString())}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Keine Daten vorhanden.</p>
        )}
      </div>
    </div>
  );
};

export default SummaryView;
