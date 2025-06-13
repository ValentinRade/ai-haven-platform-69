
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

type FormValues = {
  [key: string]: string;
};

const EndFormView: React.FC<EndFormViewProps> = ({ data, form: parentForm, onSuccess }) => {
  const localForm = useForm<FormValues>();
  const form = parentForm || localForm;
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    console.log("EndFormView checking messageType:", data.messageType);
    
    if (data.messageType === "end") {
      console.log("EndFormView: Detected END messageType, showing contact form");
    }
  }, [data.messageType]);

  // Extract form fields from metadata or use defaults - ENSURE ALL IDs ARE VALID STRINGS
  const formFields = (data.metadata?.formFields || [
    { id: "firstName", label: "Vorname", inputType: "text", validation: { required: true } },
    { id: "lastName", label: "Nachname", inputType: "text", validation: { required: true } },
    { id: "email", label: "E-Mail", inputType: "email", validation: { required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" } },
    { id: "phone", label: "Telefonnummer", inputType: "tel", validation: { required: true } }
  ]).filter(field => field && field.id && typeof field.id === 'string' && field.id.trim() !== ''); // CRITICAL: Filter out invalid fields

  console.log("EndFormView rendering with data:", {
    headline: data.content.headline,
    messageType: data.messageType,
    formFields: formFields.length,
    hasSuccessCallback: !!onSuccess,
    validFieldIds: formFields.map(f => f.id)
  });

  const onSubmit = async (values: FormValues, event?: React.FormEvent) => {
    // KRITISCH: Verhindere das Default-Verhalten des Forms
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Verhindere doppelte Submissions
    if (isSubmitting) {
      console.log("EndFormView: Already submitting, ignoring duplicate submission");
      return;
    }
    
    setIsSubmitting(true);
    console.log("EndFormView: Form submitted with values:", values);
    
    try {
      // Payload im GLEICHEN Format wie alle anderen Steps
      const payload = {
        stepId: data.stepId, // Gleiche stepId beibehalten
        previousAnswers: {
          ...data.previousAnswers,
          // Kontaktdaten zu previousAnswers hinzufügen
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone
        },
        event: {
          type: "step_submit", // Gleicher Event-Type wie andere Steps
          currentStep: parseInt(data.stepId),
          timestamp: new Date().toISOString()
        }
      };

      console.log("Submitting contact form data to webhook (same format as other steps):", payload);

      // Webhook senden - Response ignorieren da nicht benötigt
      fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        // Webhook-Fehler loggen aber nicht blockieren
        console.warn("Webhook error (ignoring):", error);
      });
      
      // Erfolgs-Toast sofort anzeigen
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
      
      // SOFORT onSuccess aufrufen für Weiterleitung zur Danke-Seite
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

  // KRITISCH: Submit-Handler der das Default-Verhalten verhindert
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log("EndFormView: Form submit event triggered");
    
    // React Hook Form handleSubmit verwenden
    form.handleSubmit((values) => onSubmit(values, event))();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-primary mb-4">
          {data.content.headline || "Kontaktformular"}
        </h2>
        <p className="text-gray-600 mb-6">{data.content.text}</p>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formFields.map((field) => (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id} // This is now guaranteed to be a valid string
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird gesendet..." : "Absenden"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default EndFormView;
