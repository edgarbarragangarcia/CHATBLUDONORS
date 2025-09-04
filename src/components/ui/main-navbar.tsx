'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageCircle, Settings, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

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
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const goToAdmin = () => {
    router.push('/admin');
  };

  const navLinkClass = (path: string) => cn(
    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-modern relative overflow-hidden group",
    pathname.startsWith(path) 
      ? "text-primary-foreground bg-primary shadow-modern" 
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-100/80 via-pink-50/80 to-blue-100/80 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border-b border-purple-200/30 dark:border-purple-700/30 backdrop-blur-xl shadow-lg shadow-purple-100/20 dark:shadow-purple-900/20">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Logo and Brand - Left Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 group-hover:from-purple-300 group-hover:to-pink-300 dark:group-hover:from-purple-700 dark:group-hover:to-pink-700 transition-all duration-300 shadow-md">
            <MessageCircle className="h-5 w-5 text-purple-700 dark:text-purple-200" />
          </div>
          <div className="hidden sm:block">
            <h1 className="heading-4 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent font-bold">INGENIABOTS</h1>
              <p className="caption text-purple-600/70 dark:text-purple-300/70">Interfaz Integradora de Agentes</p>
          </div>
        </Link>

        {/* User Menu - Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* User Menu */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 p-2 transition-all duration-300">
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-border/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center ring-2 ring-purple-300/30 dark:ring-purple-600/30">
                      <User className="h-4 w-4 text-purple-700 dark:text-purple-200" />
                    </div>
                  )}
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="caption text-muted-foreground">
                      {isAdmin ? 'Administrador' : 'Usuario'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 py-2">
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-border/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center ring-2 ring-purple-300/30 dark:ring-purple-600/30">
                        <User className="h-5 w-5 text-purple-700 dark:text-purple-200" />
                      </div>
                    )}
                    <div className="flex flex-col space-y-1 overflow-hidden">
                      <p className="text-base font-medium leading-none truncate">{userName}</p>
                      <p className="text-sm leading-none text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={goToAdmin} className="cursor-pointer py-2 text-base">
                        <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>Panel de Administrador</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:!text-red-500 focus:!text-red-500 py-2 text-base">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden rounded-xl p-2 hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-300"
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
            
            {/* Mobile User Menu & Actions */}
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              <div className="px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 justify-start transition-all duration-300">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt={userName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-border/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center ring-2 ring-purple-300/30 dark:ring-purple-600/30">
                          <User className="h-5 w-5 text-purple-700 dark:text-purple-200" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="caption text-muted-foreground">
                          {isAdmin ? 'Administrador' : 'Usuario'}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 py-2">
                        {userAvatar ? (
                          <img 
                            src={userAvatar} 
                            alt={userName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-border/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border/20">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex flex-col space-y-1 overflow-hidden">
                          <p className="text-base font-medium leading-none truncate">{userName}</p>
                          <p className="text-sm leading-none text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <>
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => { goToAdmin(); setIsMobileMenuOpen(false); }} className="cursor-pointer py-2 text-base">
                            <Shield className="mr-3 h-5 w-5 text-muted-foreground" />
                            <span>Panel de Administrador</span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="cursor-pointer text-red-500 hover:!text-red-500 focus:!text-red-500 py-2 text-base">
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Mobile Theme Toggle */}
              <div className="px-4">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}