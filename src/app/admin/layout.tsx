
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  Package,
  Home,
  Users,
  MessageCircle,
  PanelLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import AdminSidebarItems from './sidebar-items';


const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const isAdmin = user?.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user?.email ?? '');

  return (
    <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Package className="size-5" />
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>
          </SidebarHeader>
          <AdminSidebarItems isAdmin={isAdmin} />
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton href="/">
                    <PanelLeft />
                    Back to App
                </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
  );
}
