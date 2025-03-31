
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Building, LayoutDashboard, Users, Workflow } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { Link } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <Sidebar defaultCollapsed={false}>
        <SidebarHeader className="flex items-center px-4 py-2">
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/c347b4c9-f575-4333-aeb2-3c8013a34710.png" alt="Immofinanz Logo" className="h-8" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/workflow-overview">
                      <LayoutDashboard size={20} />
                      <span>Workflow Übersicht</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/workflow-builder">
                      <Workflow size={20} />
                      <span>Workflow Builder</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/user-management">
                      <Users size={20} />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Anwendung</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">
                      <Building size={20} />
                      <span>Zur Immofinanz AI</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Immofinanz GmbH
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="flex-1 p-6">
          <div className="ml-0 md:ml-2 animate-fade-in">
            <SidebarTrigger className="mb-4" />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
