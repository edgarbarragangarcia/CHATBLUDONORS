'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';

interface MainNavbarProps {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
    app_metadata?: {
      role?: string;
    };
  };
  isAdmin?: boolean;
}

export default function MainNavbar({ user, isAdmin }: MainNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string) => cn(
    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-modern relative overflow-hidden group",
    pathname.startsWith(path) 
      ? "text-primary-foreground bg-primary shadow-modern" 
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-modern">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h1 className="heading-4 text-foreground">INGENIABOTS</h1>
              <p className="caption text-muted-foreground">Interfaz Integradora de Agentes</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/" className={navLinkClass('/')}>
            <MessageCircle className="h-4 w-4" />
            <span>Chats</span>
            {pathname === '/' && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
            )}
          </Link>
          
          {isAdmin && (
            <Link href="/admin" className={navLinkClass('/admin')}>
              <Settings className="h-4 w-4" />
              <span>Administración</span>
              {pathname.startsWith('/admin') && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />
              )}
            </Link>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* User Info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-border/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="caption text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <form action="/auth/signout" method="post" className="hidden sm:block">
            <Button 
              type="submit" 
              variant="outline" 
              size="sm" 
              className="rounded-xl transition-modern hover:shadow-modern"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Cerrar Sesión</span>
            </Button>
          </form>

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
              href="/" 
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-modern",
                pathname === '/' 
                  ? "text-primary-foreground bg-primary shadow-modern" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chats</span>
            </Link>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-modern",
                  pathname.startsWith('/admin') 
                    ? "text-primary-foreground bg-primary shadow-modern" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Administración</span>
              </Link>
            )}
            
            {/* Mobile User Info & Actions */}
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              <div className="flex items-center gap-3 px-4 py-2">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-border/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="caption text-muted-foreground">
                    {isAdmin ? 'Administrador' : 'Usuario'}
                  </p>
                </div>
              </div>
              
              {/* Mobile Theme Toggle */}
              <div className="px-4">
                <ThemeToggle />
              </div>
              
              {/* Mobile Logout */}
              <form action="/auth/signout" method="post" className="px-4">
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl transition-modern hover:shadow-modern justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}