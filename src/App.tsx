
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

import MainLayout from "./layouts/MainLayout";
import ChatPage from "./pages/ChatPage";
import AdminLayout from "./layouts/AdminLayout";
import WorkflowBuilder from "./pages/admin/WorkflowBuilder";
import WorkflowOverview from "./pages/admin/WorkflowOverview";
import UserManagement from "./pages/admin/UserManagement";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<ChatPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<WorkflowOverview />} />
              <Route path="workflow-builder" element={<WorkflowBuilder />} />
              <Route path="workflow-overview" element={<WorkflowOverview />} />
              <Route path="user-management" element={<UserManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
