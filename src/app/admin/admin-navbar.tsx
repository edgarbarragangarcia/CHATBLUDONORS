
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Shield, ArrowLeft, Users, MessageCircle, Home, Menu, X, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

export default function AdminNavbar({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkClass = (path: string) => cn(
        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden group shadow-sm",
        pathname.startsWith(path) 
            ? "text-white bg-gradient-to-r from-corporate-navy to-corporate-navy/80 dark:from-corporate-navy dark:to-corporate-gray-light/20 shadow-lg shadow-corporate-navy/50 dark:shadow-corporate-navy/50" 
            : "text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy/80 dark:hover:text-corporate-gray-light/80 hover:bg-gradient-to-r hover:from-corporate-gray-light/50 hover:to-corporate-navy/10 dark:hover:from-corporate-navy/30 dark:hover:to-corporate-black-70/30 hover:shadow-md hover:shadow-corporate-navy/30 dark:hover:shadow-corporate-navy/30"
    );

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-corporate-navy/20 via-corporate-navy/15 to-corporate-navy/25 dark:from-corporate-navy/20 dark:via-corporate-black-70/20 dark:to-corporate-black-30/20 border-b border-corporate-navy/40 dark:border-corporate-black-70/30 backdrop-blur-xl shadow-xl shadow-corporate-navy/30 dark:shadow-corporate-black-70/40 mobile-safe-area">
            <div className="flex h-14 sm:h-16 items-center justify-between container-responsive">
                {/* Logo and Brand */}
                <Link href="/admin" className="flex items-center gap-2 sm:gap-3 group touch-target md:hidden">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-corporate-gray-light to-corporate-navy/20 dark:from-corporate-navy dark:to-corporate-black-70 group-hover:from-corporate-green/30 group-hover:to-corporate-navy/30 dark:group-hover:from-corporate-navy/80 dark:group-hover:to-corporate-black-30 transition-all duration-300 shadow-md shadow-corporate-navy/30 dark:shadow-corporate-black-70/30">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-corporate-navy dark:text-corporate-gray-light" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-responsive-lg bg-gradient-to-r from-corporate-navy via-corporate-green to-corporate-navy dark:from-corporate-gray-light dark:via-corporate-green dark:to-corporate-gray-light bg-clip-text text-transparent font-bold">Panel de Administración</h1>
                        <p className="text-responsive-xs text-corporate-navy/70 dark:text-corporate-gray-light/70">Sistema de gestión</p>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                   
                    
                    {isAdmin && (
                        <Link href="/admin/users" className="px-2 sm:px-3 py-2 text-responsive-sm font-medium text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy/80 dark:hover:text-corporate-gray-light/80 hover:bg-corporate-gray-light/50 dark:hover:bg-corporate-navy/30 rounded-lg transition-all duration-200 touch-target">
                            Usuarios
                        </Link>
                    )}
                    
                    <Link href="/admin/chats" className="px-2 sm:px-3 py-2 text-responsive-sm font-medium text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy/80 dark:hover:text-corporate-gray-light/80 hover:bg-corporate-gray-light/50 dark:hover:bg-corporate-navy/30 rounded-lg transition-all duration-200 touch-target">
                        Chats
                    </Link>
                    
                    <Link href="/admin/forms" className="px-2 sm:px-3 py-2 text-responsive-sm font-medium text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy/80 dark:hover:text-corporate-gray-light/80 hover:bg-corporate-gray-light/50 dark:hover:bg-corporate-navy/30 rounded-lg transition-all duration-200 touch-target">
                        Formularios
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Theme Toggle - Hidden on mobile */}
                    <div className="hidden sm:block w-8 h-8 sm:w-9 sm:h-9 touch-target">
                        <ThemeToggle />
                    </div>
                    
                    {/* Back to App Button */}
                    <Button asChild variant="outline" size="sm" className="rounded-xl transition-all duration-300 border-corporate-gray-light dark:border-corporate-black-70 bg-gradient-to-r from-corporate-gray-light/50 to-white/50 dark:from-corporate-navy/30 dark:to-corporate-black-70/30 hover:from-corporate-gray-light hover:to-white dark:hover:from-corporate-navy/50 dark:hover:to-corporate-black-70/50 hover:shadow-lg hover:shadow-corporate-navy/30 dark:hover:shadow-corporate-black-70/30 text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy/80 dark:hover:text-corporate-gray-light/80 touch-target px-2 sm:px-3">
                        <Link href="/" className="flex items-center gap-1 sm:gap-2">
                            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="hidden sm:inline text-responsive-xs">Volver a la App</span>
                            <span className="sm:hidden text-responsive-xs">Inicio</span>
                        </Link>
                    </Button>
                    
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden rounded-xl p-2 sm:p-2.5 hover:bg-gradient-to-r hover:from-corporate-gray-light/20 hover:to-corporate-navy/20 dark:hover:from-corporate-navy/30 dark:hover:to-corporate-green/30 transition-all duration-300 text-corporate-navy dark:text-corporate-gray-light touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
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
                <div className="md:hidden bg-gradient-to-r from-corporate-navy/15 via-corporate-navy/10 to-corporate-navy/20 dark:from-corporate-navy/30 dark:via-corporate-black-70/30 dark:to-corporate-black-30/30 border-t border-corporate-navy/40 dark:border-corporate-navy/30 backdrop-blur-xl">
                    <nav className="flex flex-col gap-2 p-4 space-y-1">

                        
                        {/* Users Link - Only for Admins */}
                        {isAdmin && (
                            <Link 
                                href="/admin/users" 
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-responsive-sm font-medium transition-all duration-300 shadow-sm touch-target",
                                    pathname.startsWith('/admin/users') 
                                        ? "text-white bg-gradient-to-r from-corporate-navy to-corporate-green dark:from-corporate-navy dark:to-corporate-green shadow-lg shadow-corporate-gray-light/50 dark:shadow-corporate-navy/50"
                        : "text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy dark:hover:text-corporate-gray-light hover:bg-gradient-to-r hover:from-corporate-gray-light/20 hover:to-corporate-navy/20 dark:hover:from-corporate-navy/30 dark:hover:to-corporate-green/30 hover:shadow-md hover:shadow-corporate-gray-light/30 dark:hover:shadow-corporate-navy/30"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                <span>Usuarios</span>
                            </Link>
                        )}
                        
                        {/* Chats Link */}
                        <Link 
                            href="/admin/chats" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-responsive-sm font-medium transition-all duration-300 shadow-sm touch-target",
                                pathname === '/admin' 
                                         ? "text-white bg-gradient-to-r from-corporate-navy to-corporate-green dark:from-corporate-navy dark:to-corporate-green shadow-lg shadow-corporate-gray-light/50 dark:shadow-corporate-navy/50" 
                                         : "text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy dark:hover:text-corporate-gray-light hover:bg-gradient-to-r hover:from-corporate-gray-light/20 hover:to-corporate-navy/20 dark:hover:from-corporate-navy/30 dark:hover:to-corporate-green/30 hover:shadow-md hover:shadow-corporate-gray-light/30 dark:hover:shadow-corporate-navy/30"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span>Chats</span>
                        </Link>
                        
                        {/* Forms Link */}
                        <Link 
                            href="/admin/forms" 
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-responsive-sm font-medium transition-all duration-300 shadow-sm touch-target",
                                pathname.startsWith('/admin/forms') 
                                         ? "text-white bg-gradient-to-r from-corporate-navy to-corporate-green dark:from-corporate-navy dark:to-corporate-green shadow-lg shadow-corporate-gray-light/50 dark:shadow-corporate-navy/50" 
                                         : "text-corporate-navy dark:text-corporate-gray-light hover:text-corporate-navy dark:hover:text-corporate-gray-light hover:bg-gradient-to-r hover:from-corporate-gray-light/20 hover:to-corporate-navy/20 dark:hover:from-corporate-navy/30 dark:hover:to-corporate-green/30 hover:shadow-md hover:shadow-corporate-gray-light/30 dark:hover:shadow-corporate-navy/30"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span>Formularios</span>
                        </Link>
                        
                        {/* Mobile Theme Toggle */}
                        <div className="mt-6 pt-4 border-t border-corporate-gray-light/30 dark:border-corporate-navy/30">
                             <div className="flex items-center justify-between px-4 py-2">
                                 <span className="text-responsive-sm font-medium text-corporate-navy dark:text-corporate-gray-light">Tema</span>
                                <div className="touch-target">
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
