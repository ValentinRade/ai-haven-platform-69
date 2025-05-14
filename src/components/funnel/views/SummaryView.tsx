
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
    previousAnswers?: Record<string, any>;
  };
  onEditStep?: (stepId: string) => void;
}

// Map of technical field names to user-friendly labels
const fieldNameMapping: Record<string, string> = {
  finanzierungsbedarf: "Finanzierungsbedarf",
  wohnstatus: "Wohn-/Vermietungsstatus",
  vorhaben: "Vorhaben",
  region: "Region",
  zeitplan: "Zeitplan",
  eigenkapital: "Eigenkapital",
  einkommen: "Einkommen",
  wohnsituation: "Aktuelle Wohnsituation",
  familienstand: "Familienstand",
  mitfinanzierende: "Mitfinanzierende Personen",
  "finanzierungs-prioritaet": "Finanzierungs-Priorität",
  step1Selection: "Art der Finanzierung",
  step2Selection: "Finanzierungsart",
  // Add more mappings as needed
};

// Function to get a readable label for a field name
const getReadableLabel = (key: string): string => {
  return fieldNameMapping[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
};

// Function to clean up variable values
const getReadableValue = (value: any): string => {
  if (value === undefined || value === null) return "-";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
    return "-"; // Skip template variables
  }
  return value.toString();
};

const SummaryView: React.FC<SummaryViewProps> = ({ data, onEditStep }) => {
  // Extract content from either format
  const title = data.content?.headline || data.title || "Zusammenfassung";
  const text = data.content?.text || data.description || "Hier ist eine Zusammenfassung deiner Angaben.";
  
  // Process summary items from both formats
  let items = data.summaryItems || [];
  
  // If we have previousAnswers, convert them to summary items
  if (data.previousAnswers && Object.keys(data.previousAnswers).length > 0) {
    // Filter out empty values, template strings, and system fields
    const filteredAnswers = Object.entries(data.previousAnswers)
      .filter(([key, value]) => {
        // Skip empty values, system fields, and template strings
        if (value === undefined || value === null || value === '') return false;
        if (key.startsWith('_') || key === 'chatId') return false;
        if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) return false;
        return true;
      })
      .map(([key, value]) => ({
        label: getReadableLabel(key),
        value: getReadableValue(value),
      }));
    
    // Add filtered answers to existing items
    items = [...items, ...filteredAnswers];
  }
  
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
