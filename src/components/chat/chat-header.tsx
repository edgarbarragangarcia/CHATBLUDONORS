"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, MessageSquareHeart, Shield, User as UserIcon } from "lucide-react"

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export function ChatHeader({ user, email }: { user: User & { app_metadata: { role?: 'admin' | 'user' } }, email?: string }) {
  const supabase = createClient()
  const router = useRouter()
  const isAdmin = user.app_metadata?.role === 'admin' || ADMIN_USERS.includes(email ?? '');

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const goToAdmin = () => {
    router.push("/admin");
  }

  const userInitial = user?.user_metadata.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="flex h-16 items-center justify-between bg-background px-4 md:px-6 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <MessageSquareHeart className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">
          INTERFAZ DE AGENTES
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
              <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.full_name} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3 py-2">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.full_name} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium leading-none">{user?.user_metadata.full_name || email}</p>
                    <p className="text-sm leading-none text-muted-foreground">{email}</p>
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
    </header>
  )
}
