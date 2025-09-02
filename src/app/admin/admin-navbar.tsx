
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Package, PanelLeft, Users, MessageCircle } from 'lucide-react';

export default function AdminNavbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();

    const navLinkClass = (path: string) => cn(
        "transition-colors hover:text-foreground",
        pathname.startsWith(path) ? "text-foreground" : "text-muted-foreground"
    );

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6" />
                <span>Admin Panel</span>
            </Link>
            <nav className="flex-1 flex items-center gap-4 text-sm font-medium">
                {isAdmin && (
                    <Link href="/admin/users" className={navLinkClass('/admin/users')}>
                        <Users className="h-5 w-5 inline-block mr-1" />
                        Users
                    </Link>
                )}
                <Link href="/admin/chats" className={navLinkClass('/admin/chats')}>
                    <MessageCircle className="h-5 w-5 inline-block mr-1" />
                    Chats
                </Link>
            </nav>
            <div className="flex items-center gap-2">
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
