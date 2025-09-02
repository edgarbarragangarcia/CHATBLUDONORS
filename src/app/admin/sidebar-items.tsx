
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
import { cn } from '@/lib/utils';


export default function AdminSidebarItems({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const buttonClass = (path: string) => cn(
        "hover:bg-white/10 hover:text-white",
        isActive(path) && "bg-white/20 text-white"
    );

    return (
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" className={buttonClass('/admin')}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/users" className={buttonClass('/admin/users')}>
                        <Users />
                        Users
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/chats" className={buttonClass('/admin/chats')}>
                <MessageCircle />
                Chats
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
