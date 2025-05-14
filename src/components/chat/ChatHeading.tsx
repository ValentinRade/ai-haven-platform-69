
import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const ChatHeading: React.FC = () => {
  const location = useLocation();
  
  // Determine if we're on the funnel page
  const isFunnelPage = location.pathname === "/funnel";
  
  // Display different heading based on the page
  const headingText = isFunnelPage 
    ? "Deine Kontaktanfrage"
    : "Deine Immobilien Finanzierung";

  return (
    <motion.h1 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-8 text-primary relative"
    >
      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        {headingText}
      </span>
      <div className="h-1 w-24 md:w-32 bg-primary rounded-full mx-auto mt-2 opacity-70"></div>
    </motion.h1>
  );
};

export default ChatHeading;
