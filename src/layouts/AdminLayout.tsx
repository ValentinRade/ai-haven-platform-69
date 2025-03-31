
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
