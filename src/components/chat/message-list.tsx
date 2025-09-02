
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message } from "./chat-page"

export function MessageList({ messages, currentUserId }: { messages: Message[], currentUserId: string }) {
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
          const userInitial = message.user_name ? message.user_name.charAt(0).toUpperCase() : "U"

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
                  <AvatarImage src={message.user_avatar || undefined} alt={message.user_name || "User"} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3 text-sm shadow-md",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border"
                )}
              >
                {!isCurrentUser && (
                  <p className="font-semibold text-xs pb-1">{message.user_name}</p>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
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
      </div>
    </div>
  )
}
