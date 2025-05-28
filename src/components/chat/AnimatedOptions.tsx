
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedOptionsProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
}

const AnimatedOptions: React.FC<AnimatedOptionsProps> = ({ 
  children, 
  delay = 200, 
  staggerDelay = 100 
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (showOptions && visibleCount < children.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, staggerDelay);

      return () => clearTimeout(timer);
    }
  }, [showOptions, visibleCount, children.length, staggerDelay]);

  if (!showOptions) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {children.slice(0, visibleCount).map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedOptions;
