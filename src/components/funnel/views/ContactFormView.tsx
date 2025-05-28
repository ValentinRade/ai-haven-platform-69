
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FunnelData } from "../FunnelContainer";
import { DynamicStepData } from "../DynamicStep";
import TypewriterText from "@/components/chat/TypewriterText";

interface ContactFormViewProps {
  form: UseFormReturn<FunnelData>;
  data: DynamicStepData;
}

const ContactFormView: React.FC<ContactFormViewProps> = ({ form, data }) => {
  const { register, formState: { errors } } = form;
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  
  const title = data.title || data.content?.headline || "Ihre Kontaktdaten";
  const description = data.description || data.content?.text;
  
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-medium text-primary mb-6">
        <TypewriterText 
          content={title}
          speed={8}
          onComplete={() => setTitleAnimationComplete(true)}
        />
      </h2>
      {description && titleAnimationComplete && (
        <div className="text-gray-600 mb-6">
          <TypewriterText 
            content={description} 
            speed={8}
            onComplete={() => setTextAnimationComplete(true)}
          />
        </div>
      )}

      {((description && textAnimationComplete) || (!description && titleAnimationComplete)) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                id="firstName"
                {...register("firstName", { 
                  required: "Vorname ist erforderlich"
                })}
                placeholder="Vorname"
                className="w-full"
              />
              {errors.firstName && (
                <p className="text-destructive text-sm mt-1">
                  {String(errors.firstName.message)}
                </p>
              )}
            </div>
            
            <div>
              <Input
                id="lastName"
                {...register("lastName", { 
                  required: "Nachname ist erforderlich"
                })}
                placeholder="Nachname"
                className="w-full"
              />
              {errors.lastName && (
                <p className="text-destructive text-sm mt-1">
                  {String(errors.lastName.message)}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "E-Mail ist erforderlich",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Ungültige E-Mail-Adresse"
                }
              })}
              placeholder="E-Mail-Adresse"
              className="w-full"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">
                {String(errors.email.message)}
              </p>
            )}
          </div>
          
          <div>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="Telefonnummer (optional)"
              className="w-full"
            />
            {errors.phone && (
              <p className="text-destructive text-sm mt-1">
                {String(errors.phone.message)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactFormView;
