
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, ArrowLeft, Users, MessageCircle, Home, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

export default function AdminNavbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkClass = (path: string) => cn(
        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-modern relative overflow-hidden group",
        pathname.startsWith(path) 
            ? "text-primary-foreground bg-primary shadow-modern" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
    );

    return (
        <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto">
                {/* Logo and Brand */}
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-modern">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="heading-4 text-foreground">Panel de Administración</h1>
                        <p className="caption text-muted-foreground">Sistema de gestión</p>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    <Link href="/admin" className={navLinkClass('/admin')}>
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                        {pathname === '/admin' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
                        )}
                    </Link>
                    
                    {isAdmin && (
                        <Link href="/admin/users" className={navLinkClass('/admin/users')}>
                            <Users className="h-4 w-4" />
                            <span>Usuarios</span>
                            {pathname.startsWith('/admin/users') && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
                            )}
                        </Link>
                    )}
                    
                    <Link href="/admin/chats" className={navLinkClass('/admin/chats')}>
                        <MessageCircle className="h-4 w-4" />
                        <span>Chats</span>
                        {pathname.startsWith('/admin/chats') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
                        )}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl transition-modern hover:shadow-modern">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Volver a la App</span>
                        </Link>
                    </Button>
                    
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden rounded-xl p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-border/50">
                    <nav className="flex flex-col gap-1 p-4">
                        <Link 
                            href="/admin" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-modern",
                                pathname === '/admin' 
                                    ? "text-primary-foreground bg-primary shadow-modern" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Home className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        
                        {isAdmin && (
                            <Link 
                                href="/admin/users" 
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-modern",
                                    pathname.startsWith('/admin/users') 
                                        ? "text-primary-foreground bg-primary shadow-modern" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Users className="h-5 w-5" />
                                <span>Usuarios</span>
                            </Link>
                        )}
                        
                        <Link 
                            href="/admin/chats" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-modern",
                                pathname.startsWith('/admin/chats') 
                                    ? "text-primary-foreground bg-primary shadow-modern" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span>Chats</span>
                        </Link>
                        
                        {/* Mobile Theme Toggle */}
                        <div className="mt-4 pt-4 border-t border-border/50 px-4">
                            <ThemeToggle />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
