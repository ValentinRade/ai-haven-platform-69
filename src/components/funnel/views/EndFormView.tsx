import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/store/chatStore";

interface EndFormViewProps {
  data: {
    content: {
      headline?: string;
      text: string;
    };
    stepId: string;
    messageType?: string;
    metadata?: {
      formFields?: Array<{
        id: string;
        label: string;
        inputType: string;
        validation?: {
          required?: boolean;
          pattern?: string;
          minLength?: number;
          maxLength?: number;
        };
      }>;
    };
    previousAnswers?: any;
    webhookUrl: string;
  };
  form: UseFormReturn<any>;
  onSuccess?: () => void;
}

const EndFormView: React.FC<EndFormViewProps> = ({ data, form: parentForm, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vorname: "",
    nachname: "",
    telefonnummer: ""
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vorname: "",
    nachname: "",
    telefonnummer: ""
  });

  // Get chatId from the chat store
  const { chatId } = useChatStore();

  useEffect(() => {
    console.log("EndFormView checking messageType:", data.messageType);
    
    if (data.messageType === "end") {
      console.log("EndFormView: Detected END messageType, showing contact form");
    }
  }, [data.messageType]);

  // Extract form fields from metadata or use defaults
  const formFields = data.metadata?.formFields || [
    { id: "firstName", label: "Vorname", inputType: "text", validation: { required: true } },
    { id: "lastName", label: "Nachname", inputType: "text", validation: { required: true } },
    { id: "email", label: "E-Mail", inputType: "email", validation: { required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" } },
    { id: "phone", label: "Telefonnummer", inputType: "tel", validation: { required: true } }
  ];

  console.log("EndFormView rendering with data:", {
    headline: data.content.headline,
    messageType: data.messageType,
    formFields: formFields.length,
    hasSuccessCallback: !!onSuccess,
    chatId: chatId
  });

  // Handle input changes
  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ""
      }));
    }
  };

  // Validate a single field
  const validateField = (field: any, value: string) => {
    if (field.validation?.required && !value.trim()) {
      return "Dieses Feld ist erforderlich";
    }
    
    if (field.validation?.pattern && value) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return `Ungültiges Format für ${field.label}`;
      }
    }
    
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} muss mindestens ${field.validation.minLength} Zeichen lang sein`;
    }
    
    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} darf maximal ${field.validation.maxLength} Zeichen lang sein`;
    }
    
    return "";
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = { firstName: "", lastName: "", email: "", phone: "", vorname: "", nachname: "", telefonnummer: "" };
    let hasErrors = false;
    
    formFields.forEach(field => {
      const error = validateField(field, formData[field.id as keyof typeof formData]);
      if (error) {
        newErrors[field.id as keyof typeof newErrors] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle manual submission
  const handleSubmit = async () => {
    // Prevent double submissions
    if (isSubmitting) {
      console.log("EndFormView: Already submitting, ignoring duplicate submission");
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      console.log("EndFormView: Form validation failed");
      return;
    }
    
    setIsSubmitting(true);
    console.log("EndFormView: Manual form submission with values:", formData);
    
    try {
      // Payload in the same format as other steps
      const payload = {
        stepId: data.stepId,
        previousAnswers: {
          ...data.previousAnswers,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          vorname: formData.vorname,
          nachname: formData.nachname,
          telefonnummer: formData.telefonnummer
        },
        chatId: chatId, // Include chatId like other steps
        event: {
          type: "step_submit",
          currentStep: parseInt(data.stepId),
          timestamp: new Date().toISOString()
        }
      };

      console.log("Submitting contact form data to webhook:", payload);

      // Send webhook - response ignored as not needed
      fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        // Log webhook error but don't block
        console.warn("Webhook error (ignoring):", error);
      });
      
      // Show success toast immediately
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
      
      // Call onSuccess callback immediately to show thank you page
      console.log("EndFormView: Calling onSuccess callback to show thank you page");
      if (onSuccess) {
        onSuccess();
      } else {
        console.error("EndFormView: No onSuccess callback provided!");
      }
      
    } catch (error) {
      console.error("Error in contact form submission:", error);
      
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem beim Senden deiner Anfrage. Bitte versuche es später erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-primary mb-4">
          {data.content.headline || "Kontaktformular"}
        </h2>
        <p className="text-gray-600 mb-6">{data.content.text}</p>
      </div>

      <div className="space-y-4">
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type={field.inputType}
              placeholder={field.label}
              value={formData[field.id as keyof typeof formData]}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={errors[field.id as keyof typeof errors] ? "border-red-500" : ""}
            />
            {errors[field.id as keyof typeof errors] && (
              <p className="text-sm font-medium text-red-500">
                {errors[field.id as keyof typeof errors]}
              </p>
            )}
          </div>
        ))}

        <Button
          onClick={handleSubmit}
          className="w-full mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet..." : "Absenden"}
        </Button>
      </div>
    </div>
  );
};

export default EndFormView;
