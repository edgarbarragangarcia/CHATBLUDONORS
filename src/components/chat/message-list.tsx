
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message } from "@/contexts/messages-context"
import { TypingIndicator } from "./typing-indicator"
import { MessageContent } from "./message-content"

export function MessageList({ messages, currentUserId, isTyping = false }: { messages: Message[], currentUserId: string, isTyping?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isCurrentUser = message.user_id === currentUserId
          const isSystemMessage = message.user_id === '00000000-0000-0000-0000-000000000000'
          const userInitial = message.user_name ? message.user_name.charAt(0).toUpperCase() : "U"
          const systemInitial = "🤖"

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
                  <AvatarImage src={message.user_avatar || undefined} alt={isSystemMessage ? "Bot" : message.user_name || "User"} />
                  <AvatarFallback className={isSystemMessage ? "bg-blue-500 text-white" : ""}>
                    {isSystemMessage ? systemInitial : userInitial}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-xl p-4 text-sm shadow-modern transition-modern",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : isSystemMessage
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
                    : "bg-card/50 backdrop-blur-sm text-card-foreground border border-border/50"
                )}
              >
                {!isCurrentUser && (
                  <p className="font-semibold text-xs pb-1">
                    {isSystemMessage ? "Bot" : message.user_name}
                  </p>
                )}
                <MessageContent content={message.content} />
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
