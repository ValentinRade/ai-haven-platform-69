
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Global error handler caught an error:', event.error);
});

// Add global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize the app with error boundary
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('Error during app initialization:', error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Es ist ein Fehler aufgetreten</h2>
      <p>Bitte laden Sie die Seite neu oder kontaktieren Sie den Support.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 20px;">
        Seite neu laden
      </button>
    </div>
  `;
}
