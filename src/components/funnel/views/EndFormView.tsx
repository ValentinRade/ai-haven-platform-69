
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
    hasSuccessCallback: !!onSuccess
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    console.log("EndFormView: Form submitted with values:", values);
    
    try {
      // Prepare the payload in the SAME FORMAT as all other steps
      const payload = {
        stepId: data.stepId, // Keep the same stepId, don't change it
        previousAnswers: {
          ...data.previousAnswers,
          // Add contact form fields to previous answers - using individual keys like other steps
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone
        },
        event: {
          type: "step_submit", // Same event type as other steps
          currentStep: parseInt(data.stepId),
          timestamp: new Date().toISOString()
        }
      };

      console.log("Submitting contact form data to webhook (same format as other steps):", payload);

      // Send webhook but IGNORE the response - we don't need it for the final step
      fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        // Log error but don't block the flow
        console.warn("Webhook error (ignoring):", error);
      });
      
      // Show success toast immediately
      toast({
        title: "Erfolg",
        description: "Deine Anfrage wurde erfolgreich übermittelt.",
      });
      
      // CRITICAL: Call onSuccess IMMEDIATELY to trigger thank you page
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
