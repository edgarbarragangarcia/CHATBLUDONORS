
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';


export default function AdminSidebarItems({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" isActive={isActive('/admin')}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/users" isActive={isActive('/admin/users')}>
                        <Users />
                        Users
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/chats" isActive={isActive('/admin/chats')}>
                <MessageCircle />
                Chats
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
