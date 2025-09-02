
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
    const isActive = (path: string) => pathname.startsWith(path);

    const buttonClass = (path: string) => cn(
        "hover:bg-accent hover:text-accent-foreground",
        isActive(path) && "bg-accent text-accent-foreground"
    );

    return (
        <SidebarMenu>
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
