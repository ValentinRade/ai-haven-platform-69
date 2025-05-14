
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
    console.log("EndFormView: Form submitted with values:", values);
    
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
      
      // Send the data to the webhook
      const fetchPromise = fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Add no-cors mode to avoid CORS issues
        body: JSON.stringify(payload)
      }).catch(err => {
        // Still continue even if fetch errors out in no-cors mode
        console.warn("Fetch error in no-cors mode (can be ignored):", err);
      });
      
      // Wait for the fetch to complete, but don't let it block the UI flow
      await fetchPromise;
      
      console.log("Form submission to webhook complete");
      
      // IMPORTANT: Call onSuccess callback immediately after form is submitted
      // This is crucial for showing the thank you page
      if (onSuccess) {
        console.log("EndFormView: Calling onSuccess callback to show thank you page");
        onSuccess();
      } else {
        console.warn("EndFormView: No onSuccess callback provided - user won't see thank you page");
      }
      
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Es gab ein Problem beim Senden deiner Anfrage. Bitte versuche es später erneut.",
      });
      
      // Even if there's an error with the webhook, we want to show the thank you page
      // because the user has filled out the form and expects confirmation
      if (onSuccess) {
        console.log("EndFormView: Calling onSuccess callback despite error");
        onSuccess();
      }
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
