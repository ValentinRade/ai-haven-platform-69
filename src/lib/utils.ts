
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to resolve template variables like {{previousAnswers.fieldName}}
export function resolveTemplateVariable(template: string, data: Record<string, any>): string {
  if (!template || typeof template !== 'string') return String(template || '-');
  
  // Check for template variable pattern {{previousAnswers.fieldName}}
  const regex = /{{previousAnswers\.([^}]+)}}/g;
  return template.replace(regex, (_, fieldName) => {
    const value = data[fieldName];
    return value !== undefined && value !== null ? String(value) : '-';
  });
}
