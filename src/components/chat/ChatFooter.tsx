
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

const ChatFooter: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Always show footer on funnel page
  const isFunnelPage = location.pathname === "/funnel";
  const shouldDisplayFooter = !isMobile || isFunnelPage;
  
  return (
    <footer className={`bg-white border-t border-gray-200 py-2 md:py-4 px-3 md:px-4 mt-auto flex-shrink-0 ${shouldDisplayFooter ? "block" : "hidden"}`}>
      <div className="container mx-auto text-center">
        <p className="text-xs md:text-sm text-gray-500">
          © {new Date().getFullYear()} Immofinanz GmbH. Alle Rechte vorbehalten.
        </p>
        <div className="mt-1 md:mt-2 flex justify-center space-x-4 md:space-x-6">
          <a href="#" className="text-xs text-primary hover:underline">Datenschutz</a>
          <a href="#" className="text-xs text-primary hover:underline">Impressum</a>
          <a href="#" className="text-xs text-primary hover:underline">Kontakt</a>
        </div>
      </div>
    </footer>
  );
};

export default ChatFooter;
