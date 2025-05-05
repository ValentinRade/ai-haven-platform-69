
import React from "react";
import { motion } from "framer-motion";

const ChatHeading: React.FC = () => {
  return (
    <motion.h1 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-xl md:text-3xl font-bold text-center mb-3 md:mb-8 text-primary relative"
    >
      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        Deine Immobilien Finanzierung
      </span>
      <div className="h-1 w-24 md:w-32 bg-primary rounded-full mx-auto mt-2 opacity-70"></div>
    </motion.h1>
  );
};

export default ChatHeading;
