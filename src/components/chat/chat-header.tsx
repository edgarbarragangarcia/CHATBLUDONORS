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
import { LogOut, MessageSquareHeart, Shield } from "lucide-react"

const ADMIN_USERS = ['eabarragang@ingenes.com', 'ntorres@ingenes.com', 'administrador@ingenes.com'];

export function ChatHeader({ user }: { user: User }) {
  const supabase = createClient()
  const router = useRouter()
  const isAdmin = ADMIN_USERS.includes(user.email ?? '');

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const goToAdmin = () => {
    router.push("/admin");
  }

  const userInitial = user?.user_metadata.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MessageSquareHeart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ChromaChat
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.full_name} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.user_metadata.full_name || user?.email}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
             {isAdmin && (
                <DropdownMenuItem onClick={goToAdmin} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </DropdownMenuItem>
             )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
