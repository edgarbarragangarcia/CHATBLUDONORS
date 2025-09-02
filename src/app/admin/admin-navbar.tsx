
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Package, PanelLeft, Users, MessageCircle } from 'lucide-react';

export default function AdminNavbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();

    const navLinkClass = (path: string) => cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        pathname.startsWith(path) ? "text-primary bg-muted" : ""
    );

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <Link href="/admin" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                <Package className="h-6 w-6" />
                <span className="sr-only">Admin Panel</span>
            </Link>
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 flex-1">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                    <span className="">Admin Panel</span>
                </Link>
                {isAdmin && (
                     <Link href="/admin/users" className={navLinkClass('/admin/users')}>
                        <Users className="h-4 w-4" />
                        Users
                    </Link>
                )}
                 <Link href="/admin/chats" className={navLinkClass('/admin/chats')}>
                    <MessageCircle className="h-4 w-4" />
                    Chats
                </Link>
            </nav>
            <div className="flex items-center gap-2 ml-auto">
                <Button asChild variant="outline" size="sm">
                    <Link href="/">
                        <PanelLeft className="h-4 w-4 mr-2" />
                        Back to App
                    </Link>
                </Button>
            </div>
        </header>
    );
}
