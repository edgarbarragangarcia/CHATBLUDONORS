
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, ArrowLeft, Users, MessageCircle, Home, Settings, Menu, X, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

export default function AdminNavbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkClass = (path: string) => cn(
        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden group shadow-sm",
        pathname.startsWith(path) 
            ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 shadow-lg shadow-purple-200/50 dark:shadow-purple-800/50" 
            : "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-800/30"
    );

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-100/80 via-pink-50/80 to-blue-100/80 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border-b border-purple-200/30 dark:border-purple-700/30 backdrop-blur-xl shadow-lg shadow-purple-100/20 dark:shadow-purple-900/20">
            <div className="flex h-16 items-center justify-between px-3 sm:px-6 max-w-7xl mx-auto">
                {/* Logo and Brand */}
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 group-hover:from-purple-300 group-hover:to-pink-300 dark:group-hover:from-purple-700 dark:group-hover:to-pink-700 transition-all duration-300 shadow-md shadow-purple-200/30 dark:shadow-purple-800/30">
                        <Shield className="h-5 w-5 text-purple-700 dark:text-purple-200" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="heading-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">Panel de Administración</h1>
                        <p className="caption text-purple-600/70 dark:text-purple-300/70">Sistema de gestión</p>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-2">
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
                    
                    <Link href="/admin/forms" className={navLinkClass('/admin/forms')}>
                        <FileText className="h-4 w-4" />
                        <span>Formularios</span>
                        {pathname.startsWith('/admin/forms') && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
                        )}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl transition-all duration-300 border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 hover:shadow-lg hover:shadow-purple-200/30 dark:hover:shadow-purple-800/30 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Volver a la App</span>
                        </Link>
                    </Button>
                    
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden rounded-xl p-2 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-300 text-purple-700 dark:text-purple-300"
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
                <div className="md:hidden bg-gradient-to-r from-purple-50/90 via-pink-25/90 to-blue-50/90 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-t border-purple-200/30 dark:border-purple-700/30 backdrop-blur-xl">
                    <nav className="flex flex-col gap-1 p-4">
                        {isAdmin && (
                            <Link 
                                href="/admin/users" 
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 shadow-sm",
                                    pathname.startsWith('/admin/users') 
                                        ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 shadow-lg shadow-purple-200/50 dark:shadow-purple-800/50" 
                                        : "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-800/30"
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
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 shadow-sm",
                                pathname.startsWith('/admin/chats') 
                                    ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 shadow-lg shadow-purple-200/50 dark:shadow-purple-800/50" 
                                    : "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-800/30"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span>Chats</span>
                        </Link>
                        
                        <Link 
                            href="/admin/forms" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 shadow-sm",
                                pathname.startsWith('/admin/forms') 
                                    ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 shadow-lg shadow-purple-200/50 dark:shadow-purple-800/50" 
                                    : "text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-800/30"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FileText className="h-5 w-5" />
                            <span>Formularios</span>
                        </Link>
                        
                        {/* Mobile Theme Toggle */}
                        <div className="mt-4 pt-4 border-t border-purple-200/30 dark:border-purple-700/30 px-4">
                            <ThemeToggle />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
