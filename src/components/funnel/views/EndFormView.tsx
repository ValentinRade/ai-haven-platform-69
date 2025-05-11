
import React from "react";
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
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Extract form fields from metadata or use defaults
  const formFields = data.metadata?.formFields || [
    { id: "firstName", label: "Vorname", inputType: "text", validation: { required: true } },
    { id: "lastName", label: "Nachname", inputType: "text", validation: { required: true } },
    { id: "email", label: "E-Mail", inputType: "email", validation: { required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" } },
    { id: "phone", label: "Telefonnummer", inputType: "tel", validation: { required: true } }
  ];

  console.log("EndFormView rendering with data:", {
    headline: data.content.headline,
    formFields: formFields.length,
    hasSuccessCallback: !!onSuccess
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        stepId: data.stepId,
        previousAnswers: data.previousAnswers || {},
        event: {
          type: "formSubmission",
          data: values
        }
      };

      console.log("Submitting form data to webhook:", payload);
      
      // Send the data to the webhook without waiting for the response
      fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Add no-cors mode to avoid CORS issues
        body: JSON.stringify(payload)
      });

      // Immediately set success state without waiting for response
      setIsSuccess(true);
      
      // Call parent success callback if provided
      if (onSuccess) {
        console.log("Calling onSuccess callback from EndFormView");
        onSuccess();
      }
      
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
    } catch (error) {
      console.error("Error preparing form submission:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem beim Senden deiner Anfrage. Bitte versuche es später erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show success state if we're NOT using the parent's success callback
  // This prevents double success screens
  if (isSuccess && !onSuccess) {
    return (
      <div className="text-center py-10">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-green-500 mx-auto mb-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h2 className="text-2xl font-bold text-primary mb-4">Vielen Dank für deine Anfrage!</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Wir haben deine Informationen erhalten und werden uns in Kürze mit dir in Verbindung setzen.
        </p>
        <div className="border-t border-gray-200 pt-6 mt-6">
          <p className="text-sm text-gray-500">
            Bei weiteren Fragen stehen wir dir gerne zur Verfügung.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-medium text-primary mb-4">
          {data.content.headline || "Kontaktformular"}
        </h2>
        <p className="text-gray-600 mb-6">{data.content.text}</p>
      </div>

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
