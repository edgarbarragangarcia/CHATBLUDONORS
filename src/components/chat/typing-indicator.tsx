"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  isVisible: boolean
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null

  return (
    <div className="flex items-start gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <Avatar className="h-9 w-9">
        <AvatarImage src={undefined} alt="Anakin" />
        <AvatarFallback className="bg-corporate-navy text-white">
          🤖
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[70%] rounded-xl p-4 text-sm shadow-modern transition-modern bg-corporate-gray-light/20 dark:bg-corporate-navy/20 text-corporate-navy dark:text-corporate-gray-light border border-corporate-gray-light/50 dark:border-corporate-navy/50">
        <p className="font-semibold text-xs pb-1">Anakin</p>
        <div className="flex items-center gap-1">
          <span className="text-sm">Escribiendo</span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}