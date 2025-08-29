"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"
import { generateSuggestedReplies } from "@/ai/flows/suggested-replies"

import { Card } from "@/components/ui/card"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageForm } from "./message-form"
import { SuggestedReplies } from "./suggested-replies"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export type Message = {
  id: string
  created_at: string
  content: string
  user_id: string
  user_avatar: string | null
  user_name: string | null
  chat_id: string;
}

export default function ChatPage({ user, email, chatId }: { user: User, email?: string, chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  const getProfileForUser = async (userId: string) => {
    // In a real app, you would fetch this from a 'profiles' table.
    // For this example, we'll simulate it for simplicity.
    // If it's the current user, we use their metadata.
    if (userId === user.id) {
      return {
        name: user.user_metadata.full_name || email,
        avatar: user.user_metadata.avatar_url,
      }
    }
    // For other users, we'd look them up. Here we return a generic profile.
    return {
      name: `User ${userId.substring(0, 6)}`,
      avatar: null,
    }
  }

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq('chat_id', chatId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return
    }

    const messagesWithProfiles = await Promise.all(
      data.map(async (msg) => {
        const profile = await getProfileForUser(msg.user_id)
        return {
          ...msg,
          user_name: profile.name,
          user_avatar: profile.avatar,
        }
      })
    )

    setMessages(messagesWithProfiles)
  }, [supabase, user.id, user.user_metadata.full_name, user.user_metadata.avatar_url, email, chatId])


  const fetchSuggestions = async (currentMessages: Message[]) => {
    if (currentMessages.length === 0) return
    setIsGenerating(true)
    setSuggestedReplies([])
    try {
      const chatHistory = currentMessages
        .slice(-5)
        .map((m) => `${m.user_name}: ${m.content}`)
        .join("\n")
      const lastMessage = currentMessages[currentMessages.length-1];
      const userQuery = `${lastMessage.user_name}: ${lastMessage.content}`

      const replies = await generateSuggestedReplies({ chatHistory, userQuery })
      setSuggestedReplies(replies)
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setSuggestedReplies([])
    } finally {
        setIsGenerating(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`messages-for-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const newMsg = payload.new
          const profile = await getProfileForUser(newMsg.user_id)
          const newMessage: Message = {
            id: newMsg.id,
            created_at: newMsg.created_at,
            content: newMsg.content,
            user_id: newMsg.user_id,
            user_name: profile.name,
            user_avatar: profile.avatar,
            chat_id: newMsg.chat_id,
          }
          setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, newMessage]
              fetchSuggestions(updatedMessages);
              return updatedMessages;
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchMessages, chatId])

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "") return

    const { error } = await supabase
      .from("messages")
      .insert([{ content, user_id: user.id, chat_id: chatId }])
    
    if (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-muted/40">
      <ChatHeader user={user} email={email} />
      <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
        <div className="mb-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Volver a todas las salas
            </Link>
        </div>
        <Card className="h-full flex flex-col flex-1">
            <MessageList messages={messages} currentUserId={user.id} />
            <div className="p-4 border-t">
                <SuggestedReplies 
                    suggestions={suggestedReplies} 
                    onSelect={(reply) => handleSendMessage(reply)}
                    isLoading={isGenerating}
                />
                <MessageForm onSendMessage={handleSendMessage} />
            </div>
        </Card>
      </main>
    </div>
  )
}
