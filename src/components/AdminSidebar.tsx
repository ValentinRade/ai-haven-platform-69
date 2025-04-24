
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Users, LayoutDashboard, FileText, ArrowLeft } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <img src="/lovable-uploads/70e3d10a-20be-4809-8385-3ffda9ff9893.png" alt="Immofinanz Logo" className="h-8" />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <AdminHeader />
          
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/admin/workflow-overview')}
                tooltip="Workflow Übersicht"
              >
                <Link to="/admin/workflow-overview">
                  <LayoutDashboard size={20} />
                  <span>Workflow Übersicht</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/admin/workflow-builder')}
                tooltip="Workflow Builder"
              >
                <Link to="/admin/workflow-builder">
                  <FileText size={20} />
                  <span>Workflow Builder</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/admin/user-management')}
                tooltip="User Management"
              >
                <Link to="/admin/user-management">
                  <Users size={20} />
                  <span>User Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="p-4">
          <SidebarMenuButton asChild tooltip="Zurück zum Chat">
            <Link to="/" className="flex items-center gap-2 text-sm">
              <ArrowLeft size={16} />
              <span>Zurück zum Chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AdminSidebar;
