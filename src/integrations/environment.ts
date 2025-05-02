
/**
 * Environment variables and configuration settings
 */

// Webhook URL for chat communication
export const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 
  'https://automation-n8n.ny2xzw.easypanel.host/webhook/06bd3c97-5c9b-49bb-88c3-d16a5d20a52b';

// Function to check if we're in production mode
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

// Function to check if we're running on Railway
export const isRailway = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.location.hostname.includes('railway.app') || 
     window.location.hostname.includes('up.railway.app'));
};

// Get the base API URL depending on environment
export const getBaseApiUrl = (): string => {
  if (isRailway()) {
    return window.location.origin;
  }
  return isProduction() ? 'https://your-production-api.com' : 'http://localhost:3000';
};
