
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FunnelPage from "./pages/FunnelPage";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FunnelPage />} />
        <Route path="/funnel" element={<FunnelPage />} />
        <Route path="*" element={<FunnelPage />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
