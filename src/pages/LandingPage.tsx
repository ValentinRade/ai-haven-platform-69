
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Header from '@/components/Header';

const LandingPage: React.FC = () => {
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
