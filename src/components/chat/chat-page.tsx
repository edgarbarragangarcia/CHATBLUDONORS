
"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"
import { generateSuggestedReplies } from "@/ai/flows/suggested-replies"

import { Card } from "@/components/ui/card"
import { MessageList } from "./message-list"
import { MessageForm } from "./message-form"
import { SuggestedReplies } from "./suggested-replies"

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
  const [chatWebhookUrl, setChatWebhookUrl] = useState<string | null>(null)
  const supabase = createClient()

  const getProfileForUser = async (userId: string) => {
    // Caso especial para mensajes del sistema/bot
    if (userId === 'system') {
      return {
        name: 'Asistente IA',
        avatar: null,
      }
    }
    
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
    // A proper implementation would query a `profiles` table.
     const { data, error } = await supabase
      .from('users')
      .select('raw_user_meta_data')
      .eq('id', userId)
      .single()

    if (!error && data) {
       return {
         name: data.raw_user_meta_data?.full_name || `User ${userId.substring(0,6)}`,
         avatar: data.raw_user_meta_data?.avatar_url || null
       }
    }

    return {
      name: `User ${userId.substring(0, 6)}`,
      avatar: null,
    }
  }



  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq('chat_id', chatId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      setMessages([]);
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

  // Función para obtener el webhook URL del chat
  const fetchChatWebhook = useCallback(async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('webhook_url')
      .eq('id', chatId)
      .single()
    
    if (!error && data) {
      setChatWebhookUrl(data.webhook_url)
    }
  }, [supabase, chatId])

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
    fetchChatWebhook() // Cargar el webhook URL del chat

    console.log('Setting up real-time subscription for chat:', chatId)
    
    const channel = supabase
      .channel(`messages-for-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          console.log('Real-time message received:', payload)
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
          console.log('Adding new message to state:', newMessage)
          setMessages((prevMessages) => {
              // Verificar si el mensaje ya existe para evitar duplicados
              const messageExists = prevMessages.some(msg => msg.id === newMessage.id)
              if (messageExists) {
                console.log('Message already exists, skipping')
                return prevMessages
              }
              const updatedMessages = [...prevMessages, newMessage]
              fetchSuggestions(updatedMessages);
              return updatedMessages;
          })
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchMessages, fetchChatWebhook, chatId])

  // Función para enviar mensaje al webhook de n8n
  const sendToWebhook = async (content: string): Promise<string | null> => {
    if (!chatWebhookUrl) return null
    
    try {
      const response = await fetch(chatWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, user_id: user.id, chat_id: chatId })
      })
      
      if (response.ok) {
        const responseText = await response.text()
        
        // Verificar si la respuesta está vacía
        if (!responseText || responseText.trim() === '') {
          console.warn('Webhook returned empty response')
          return null
        }
        
        try {
          const data = JSON.parse(responseText)
          return data.response || data.message || null
        } catch (parseError) {
          console.error('Error parsing webhook response as JSON:', parseError)
          console.log('Raw response:', responseText)
          // Si no es JSON válido, devolver el texto tal como está
          return responseText
        }
      } else {
        console.error('Webhook responded with status:', response.status)
      }
    } catch (error) {
      console.error('Error sending to webhook:', error)
    }
    return null
  }

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "" || !chatId) return

    console.log('Sending message:', content)

    // Primero guardamos el mensaje del usuario
    const { data: insertedMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert([{ content, user_id: user.id, chat_id: chatId }])
      .select()
    
    if (userMessageError) {
      console.error("Error sending user message:", userMessageError)
      return
    }

    console.log('Message inserted successfully:', insertedMessage)

    // Agregar el mensaje inmediatamente al estado local para una respuesta instantánea
    if (insertedMessage && insertedMessage[0]) {
      const profile = await getProfileForUser(insertedMessage[0].user_id)
      const newMessage: Message = {
        id: insertedMessage[0].id,
        created_at: insertedMessage[0].created_at,
        content: insertedMessage[0].content,
        user_id: insertedMessage[0].user_id,
        user_name: profile.name,
        user_avatar: profile.avatar,
        chat_id: insertedMessage[0].chat_id,
      }
      
      console.log('Adding message immediately to local state:', newMessage)
      setMessages(prev => {
        // Verificar si el mensaje ya existe para evitar duplicados
        const messageExists = prev.some(msg => msg.id === newMessage.id)
        if (messageExists) {
          console.log('Message already exists in state, skipping')
          return prev
        }
        return [...prev, newMessage]
      })
    }

    // Si hay webhook configurado, enviamos el mensaje y procesamos la respuesta
    if (chatWebhookUrl) {
      const webhookResponse = await sendToWebhook(content)
      
      if (webhookResponse) {
        // Guardamos la respuesta del webhook como un mensaje del sistema
        const { error: botMessageError } = await supabase
          .from("messages")
          .insert([{ 
            content: webhookResponse, 
            user_id: 'system', // ID especial para mensajes del bot
            chat_id: chatId 
          }])
        
        if (botMessageError) {
          console.error("Error sending bot message:", botMessageError)
        }
      }
    }
  }

  return (
    <main className="h-full flex flex-col bg-background rounded-lg">
        <MessageList messages={messages} currentUserId={user.id} />
        <div className="p-4 border-t bg-background">
            <SuggestedReplies 
                suggestions={suggestedReplies} 
                onSelect={(reply) => handleSendMessage(reply)}
                isLoading={isGenerating}
            />
            <MessageForm onSendMessage={handleSendMessage} />
        </div>
    </main>
  )
}
