
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from '@/components/Header';
import { Card, CardContent } from "@/components/ui/card";

const LandingPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header component with hero section */}
      <Header />

      {/* Features Section - with adjusted margins to account for new header */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Warum Immofinanz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Schnelle Beratung</h3>
                <p className="text-gray-600">Finde in unter 5 Minuten heraus, welche Immobilien für dich verfügbar sind</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Personalisierte Vorschläge</h3>
                <p className="text-gray-600">Erhalte maßgeschneiderte Immobilienangebote, die perfekt zu deinen Wünschen passen</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-start"
            >
              <CheckCircle className="text-primary mb-4" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Einfacher Prozess</h3>
                <p className="text-gray-600">Vom Chat zur Besichtigung in kürzester Zeit - ohne komplizierte Formulare</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section - renamed to "Eure Ansprechpartner" */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Eure Ansprechpartner</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 max-w-lg"
            >
              <img 
                src="/lovable-uploads/fa408ef3-c6f3-4d42-aa51-3c8e298ab646.png" 
                alt="Jörg und Yannick Rademacher" 
                className="rounded-xl shadow-lg w-full"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2 max-w-lg"
            >
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Jörg & Yannick Rademacher</h3>
                  <p className="text-gray-600 mb-4">
                    Mit über 25 Jahren Erfahrung im Immobilienmarkt leitet Jörg Rademacher gemeinsam mit seinem Sohn Yannick unser Familienunternehmen. Als Vater-Sohn-Gespann verbinden sie jahrzehntelange Expertise mit innovativen digitalen Ansätzen.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Jörg bringt tiefgreifendes Fachwissen und ein umfangreiches Netzwerk mit, während Yannick als Digital Native neue Perspektiven und moderne Lösungsansätze einbringt. Gemeinsam sorgen sie dafür, dass Immofinanz stets am Puls der Zeit agiert.
                  </p>
                  <p className="text-gray-600 font-medium">
                    "Unser Ziel ist es, traditionelle Immobilienwerte mit zukunftsorientierten Konzepten zu verbinden, um dir den bestmöglichen Service zu bieten."
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Consultation Section - Moved from ChatPage */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Persönliche Beratung</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="overflow-hidden border-gray-200">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2">
                  <img 
                    src="/lovable-uploads/73b0ef6d-60db-4cab-8d68-27df33713747.png" 
                    alt="Immobilien-Berater" 
                    className="w-full h-full object-cover aspect-square md:aspect-auto"
                  />
                </div>
                <CardContent className="flex flex-col p-6 w-full md:w-1/2">
                  <h3 className="text-xl font-bold mb-3">Persönliche Beratung</h3>
                  <p className="text-gray-700 mb-4">
                    Unser erfahrenes Team steht dir bei allen Fragen rund um deine Immobiliensuche zur Seite. Wir nehmen uns Zeit für ein persönliches Gespräch, um deine Wünsche und Bedürfnisse genau zu verstehen.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Nach dem Chat-Gespräch kontaktieren wir dich innerhalb von 24 Stunden, um die nächsten Schritte zu besprechen.
                  </p>
                  <Button className="mt-auto bg-primary hover:bg-primary/90">
                    Termin vereinbaren
                  </Button>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Bereit für dein neues Zuhause?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Sprich mit unserem KI-Assistenten und finde in kürzester Zeit deine Traumimmobilie
          </p>
          <Link to="/chat">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg text-sm"
              size="lg"
            >
              KI-Beratung starten
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Immofinanz GmbH. Alle Rechte vorbehalten.
          </p>
          <div className="mt-2 flex justify-center space-x-6">
            <a href="#" className="text-xs text-primary hover:underline">Datenschutz</a>
            <a href="#" className="text-xs text-primary hover:underline">Impressum</a>
            <a href="#" className="text-xs text-primary hover:underline">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
