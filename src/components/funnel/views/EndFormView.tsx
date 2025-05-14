
import React, { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface EndFormViewProps {
  data: {
    content: {
      headline?: string;
      text: string;
    };
    stepId: string;
    messageType?: string; // Add messageType to properly handle "end" messages
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
  form: UseFormReturn<any>; // Parent form from FunnelContainer
  onSuccess?: () => void;  // Add callback for success state
}

type FormValues = {
  [key: string]: string;
};

const EndFormView: React.FC<EndFormViewProps> = ({ data, form: parentForm, onSuccess }) => {
  // Use a local form if no parent form is provided (for backward compatibility)
  const localForm = useForm<FormValues>();
  const form = parentForm || localForm;
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [endReached, setEndReached] = React.useState(false);

  // CRITICAL: Check if this is an end messageType immediately on component mount
  // and immediately trigger end state without requiring form submission
  useEffect(() => {
    console.log("EndFormView checking messageType:", data.messageType);
    
    // If this is an "end" message type, immediately trigger end state
    if (data.messageType === "end") {
      console.log("EndFormView: Detected END messageType, setting endReached=true");
      
      // Set end reached state to true to prevent any further submissions
      setEndReached(true);
      
      // IMMEDIATELY trigger onSuccess to show thank you page without waiting for form submission
      if (onSuccess) {
        console.log("EndFormView: Auto-triggering onSuccess due to END messageType");
        onSuccess();
      }
    }
  }, [data.messageType, onSuccess]);

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
    endReached
  });

  const onSubmit = async (values: FormValues) => {
    // If end state is already reached, do nothing - prevent duplicate submissions
    if (endReached) {
      console.log("EndFormView: Submission prevented - end already reached");
      return;
    }
    
    // Mark as end reached immediately to prevent any subsequent submissions
    setEndReached(true);
    setIsSubmitting(true);
    console.log("EndFormView: Form submitted with values:", values);
    
    try {
      // CRITICAL: First call onSuccess to make sure thank you page appears quickly
      // This must happen before the webhook request to ensure UI shows immediately
      if (onSuccess) {
        console.log("EndFormView: Calling onSuccess callback BEFORE webhook to ensure thank you page appears");
        onSuccess();
      }
      
      const payload = {
        stepId: data.stepId,
        previousAnswers: data.previousAnswers || {},
        event: {
          type: "formSubmission",
          data: values
        }
      };

      console.log("Submitting form data to webhook:", payload);

      // Send the data to the webhook (this happens after onSuccess is called)
      try {
        const fetchPromise = fetch(data.webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Add no-cors mode to avoid CORS issues
          body: JSON.stringify(payload)
        });
        
        // We don't await this fetch to ensure the UI flow continues
        fetchPromise.catch(err => {
          // Still continue even if fetch errors out in no-cors mode
          console.warn("Fetch error in no-cors mode (can be ignored):", err);
        });
      } catch (webhookError) {
        console.warn("Webhook submission error (continuing anyway):", webhookError);
      }
      
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      
      // Even if there's an error, if we've called onSuccess already, we don't need
      // to show an error toast since the user is already seeing the thank you page
      if (!onSuccess) {
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Es gab ein Problem beim Senden deiner Anfrage. Bitte versuche es später erneut.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show the form at all if endReached is true
  if (endReached && data.messageType === "end") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-primary mb-4">
          {data.content.headline || "Kontaktformular"}
        </h2>
        <p className="text-gray-600 mb-6">{data.content.text}</p>
      </div>

      {/* Only show the form if end state hasn't been reached yet */}
      {!endReached && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formFields.map((field) => (
              <FormField
                key={field.id}
                control={form.control}
                name={field.id}
                rules={{
                  required: field.validation?.required ? "Dieses Feld ist erforderlich" : false,
                  pattern: field.validation?.pattern
                    ? {
                        value: new RegExp(field.validation.pattern),
                        message: `Ungültiges Format für ${field.label}`,
                      }
                    : undefined,
                  minLength: field.validation?.minLength
                    ? {
                        value: field.validation.minLength,
                        message: `${field.label} muss mindestens ${field.validation.minLength} Zeichen lang sein`,
                      }
                    : undefined,
                  maxLength: field.validation?.maxLength
                    ? {
                        value: field.validation.maxLength,
                        message: `${field.label} darf maximal ${field.validation.maxLength} Zeichen lang sein`,
                      }
                    : undefined,
                }}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={field.inputType}
                        placeholder={field.label}
                        {...formField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting || endReached}
            >
              {isSubmitting ? "Wird gesendet..." : "Absenden"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default EndFormView;
