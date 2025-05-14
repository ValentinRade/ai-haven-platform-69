
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
  wohnVermietungsstatus: "Wohn-/Vermietungsstatus",
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
  wunschimmobilie: "Wunschimmobilie",
  nutzungsart: "Nutzung",
  immobilienstatus: "Immobilienstatus",
  rate: "Monatliche Rate",
  fokus: "Finanzierungs-Wünsche",
  besonderheiten: "Besonderheiten",
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
  
  // Check for template variables and extract the field name
  if (typeof value === "string") {
    const templateMatch = value.match(/{{previousAnswers\.([^}]+)}}/);
    if (templateMatch) {
      const fieldName = templateMatch[1];
      return `[Wert für ${fieldName}]`; // Placeholder for template value
    }
  }
  
  return value.toString();
};

// Function to parse template variables from actual data
const resolveTemplateValue = (template: string, data: Record<string, any>): string => {
  if (!template || typeof template !== 'string') return String(template || '-');
  
  // Check if this is a template variable format: {{previousAnswers.fieldName}}
  const match = template.match(/{{previousAnswers\.([^}]+)}}/);
  if (match) {
    const fieldName = match[1];
    const value = data[fieldName];
    return value !== undefined && value !== null ? String(value) : '-';
  }
  
  return template;
};

const SummaryView: React.FC<SummaryViewProps> = ({ data, onEditStep }) => {
  // Extract content from either format
  const title = data.content?.headline || data.title || "Zusammenfassung";
  const text = data.content?.text || data.description || "Hier ist eine Zusammenfassung deiner Angaben.";
  
  // Process summary items from both formats
  let items = data.summaryItems || [];
  const previousAnswers = data.previousAnswers || {};
  
  // Process template variables in existing summary items
  items = items.map(item => {
    if (typeof item.value === 'string' && item.value.includes('{{previousAnswers.')) {
      return {
        ...item,
        value: resolveTemplateValue(item.value, previousAnswers)
      };
    }
    return item;
  });
  
  // If we have previousAnswers, convert them to summary items
  if (Object.keys(previousAnswers).length > 0) {
    // Filter out empty values, template strings, and system fields
    const filteredAnswers = Object.entries(previousAnswers)
      .filter(([key, value]) => {
        // Skip empty values, system fields, and template strings
        if (value === undefined || value === null || value === '') return false;
        if (key.startsWith('_') || key === 'chatId') return false;
        return true;
      })
      .map(([key, value]) => ({
        label: getReadableLabel(key),
        value: getReadableValue(value),
      }));
    
    // Only add filtered answers that don't already exist in items
    const existingLabels = new Set(items.map(item => item.label));
    const newItems = filteredAnswers.filter(item => !existingLabels.has(item.label));
    
    // Add filtered answers to existing items
    items = [...items, ...newItems];
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
