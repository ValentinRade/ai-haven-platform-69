
import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// A map of icon names to their corresponding imports
const iconMap = {
  "arrow-left": dynamicIconImports["arrow-left"],
  "arrow-right": dynamicIconImports["arrow-right"],
  "chevron-left": dynamicIconImports["chevron-left"],
  "chevron-right": dynamicIconImports["chevron-right"],
  "loader-circle": dynamicIconImports["loader-circle"],
  "progress": dynamicIconImports["progress"],
};

export type IconName = keyof typeof iconMap;

interface IconLoaderProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

const IconLoader: React.FC<IconLoaderProps> = ({ 
  name, 
  ...props 
}) => {
  // Fallback component while the icon is loading
  const fallback = (
    <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
  );
  
  // Dynamically import the icon
  const Icon = lazy(() => iconMap[name]());

  return (
    <Suspense fallback={fallback}>
      <Icon {...props} />
    </Suspense>
  );
};

export default IconLoader;
