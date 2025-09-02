
import * as React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  Package,
  PanelLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
    
    const isAdmin = !!user && (user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(user.email ?? ''));

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="bg-background/80 backdrop-blur-sm border-r">
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
                  <SidebarMenuButton href="/" className="hover:bg-accent hover:text-accent-foreground">
                      <PanelLeft />
                      Back to App
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      <div className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
