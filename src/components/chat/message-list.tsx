
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { Message } from "@/contexts/messages-context"
import { TypingIndicator } from "./typing-indicator"
import { MessageContent } from "./message-content"

export function MessageList({ messages, currentUserId, isTyping = false }: { messages: Message[], currentUserId: string, isTyping?: boolean }) {
  // Estilo para el contenedor de mensajes scrolleable
  const messageListContainerStyle = "h-[calc(100vh-10rem)] overflow-y-auto";
  const scrollRef = useRef<HTMLDivElement>(null)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())

  const handleLike = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="h-[calc(100vh-8rem)] overflow-y-auto p-4 md:p-6 relative">
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isCurrentUser = message.user_id === currentUserId
          const isSystemMessage = message.user_id === '00000000-0000-0000-0000-000000000000'
          const userInitial = message.user_name ? message.user_name.charAt(0).toUpperCase() : "U"
          const systemInitial = <img src="/logoIngenes.png" alt="Ingenes" className="w-4/5 h-4/5 object-contain bg-white rounded-full p-1" />

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              {!isCurrentUser && (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={message.user_avatar || undefined} alt={isSystemMessage ? "Anakin" : message.user_name || "User"} />
                  <AvatarFallback className={isSystemMessage ? "bg-corporate-navy text-white" : ""}>
                    {isSystemMessage ? systemInitial : userInitial}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "w-fit min-w-[120px] max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%] rounded-xl p-3 sm:p-4 text-sm shadow-modern transition-modern",
                    isCurrentUser
                      ? "bg-gradient-to-r from-corporate-navy to-corporate-navy/90 text-white shadow-lg shadow-corporate-navy/30 font-medium"
                      : isSystemMessage
                      ? "bg-corporate-gray-light/20 dark:bg-corporate-navy/20 text-corporate-navy dark:text-corporate-gray-light border border-corporate-gray-light/50 dark:border-corporate-navy/50"
                      : "bg-card/50 backdrop-blur-sm text-card-foreground border border-border/50"
                  )}
                >
                  {!isCurrentUser && (
                    <p className="font-semibold text-xs pb-1">
                      {isSystemMessage ? "Anakin" : message.user_name}
                    </p>
                  )}
                  <MessageContent content={message.content} />
                </div>
                {!isCurrentUser && (
                  <div className="flex justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(message.id)}
                      className={cn(
                        "h-8 px-2 gap-1 text-xs transition-all duration-200",
                        likedMessages.has(message.id)
                          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      )}
                    >
                      <Heart 
                        className={cn(
                          "h-3 w-3 transition-all duration-200",
                          likedMessages.has(message.id) ? "fill-current" : ""
                        )} 
                      />
                      <span>{likedMessages.has(message.id) ? "Te gusta" : "Me gusta"}</span>
                    </Button>
                  </div>
                )}
              </div>
              {isCurrentUser && (
                 <Avatar className="h-9 w-9">
                  <AvatarImage src={message.user_avatar || undefined} alt={message.user_name || "User"} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        <TypingIndicator isVisible={isTyping} />
      </div>
    </div>
  )
}
