
"use client"

import { useState, useEffect, useCallback } from "react"
import { type User } from "@supabase/supabase-js"
import { generateSuggestedReplies } from "@/ai/flows/suggested-replies"
import { useWebhook } from "@/contexts/webhook-context"

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
  const { getWebhookUrl } = useWebhook()

  const getProfileForUser = (userId: string) => {
    // Caso especial para mensajes del sistema/bot
    if (userId === 'system' || userId === '00000000-0000-0000-0000-000000000000') {
      return {
        name: 'Bot',
        avatar: null,
      }
    }
    
    // Si es el usuario actual, usamos sus metadatos
    if (userId === user.id) {
      return {
        name: user.user_metadata.full_name || email || 'Usuario',
        avatar: user.user_metadata.avatar_url,
      }
    }
    // Para otros usuarios, retornamos un perfil genérico
    return {
      name: `Usuario ${userId.substring(0, 6)}`,
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

  // Función para obtener el webhook URL del chat usando el contexto
  const fetchChatWebhook = useCallback(async () => {
    try {
      const webhookUrl = await getWebhookUrl(chatId)
      console.log('Chat webhook URL obtenida del contexto:', webhookUrl)
      setChatWebhookUrl(webhookUrl)
    } catch (error) {
      console.error('Error fetching chat webhook from context:', error)
      setChatWebhookUrl(null)
    }
  }, [getWebhookUrl, chatId])

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

  // Función para enviar mensaje al webhook usando proxy interno (sin CORS)
  const sendToWebhook = async (content: string): Promise<string | null> => {
    if (!chatWebhookUrl) {
      console.log('No hay webhook configurado para este chat')
      return null
    }
    
    try {
      console.log('Enviando mensaje a través del proxy interno')
      
      const response = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatId: chatId,
          message: content, 
          userId: user.id 
        }),
        // Timeout de 20 segundos (el proxy interno tiene su propio timeout)
        signal: AbortSignal.timeout(20000)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          if (data.response) {
            console.log('Respuesta del webhook recibida:', data.response)
            return data.response
          } else {
            console.log('Webhook procesado exitosamente sin respuesta')
            return null
          }
        } else {
          console.warn('Error en el webhook:', data.error)
          return null
        }
      } else {
        console.error('Error en el proxy interno:', response.status)
        return null
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Timeout en el envío del webhook (20s)')
        } else {
          console.warn('Error enviando al webhook:', error.message)
        }
      } else {
        console.warn('Error desconocido enviando al webhook:', error)
      }
      return null
    }
  }

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "" || !chatId) return

    console.log('Sending message:', content)

    // Primero guardamos el mensaje del usuario - esto siempre debe funcionar
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

    // Si hay webhook configurado, intentamos enviar el mensaje (opcional)
    if (chatWebhookUrl) {
      try {
        console.log('Attempting to send to webhook:', chatWebhookUrl)
        const webhookResponse = await sendToWebhook(content)
        
        if (webhookResponse) {
          console.log('Webhook response received:', webhookResponse)
          // Guardamos la respuesta del webhook como un mensaje del sistema
          // Usamos un UUID especial para el sistema: 00000000-0000-0000-0000-000000000000
          const { error: botMessageError } = await supabase
            .from("messages")
            .insert([{ 
              content: webhookResponse, 
              user_id: '00000000-0000-0000-0000-000000000000', // UUID especial para mensajes del bot
              chat_id: chatId 
            }])
          
          if (botMessageError) {
            console.error("Error sending bot message:", botMessageError)
          } else {
            console.log('Bot message saved successfully')
          }
        } else {
          console.log('Webhook no disponible o no respondió - el chat continúa funcionando normalmente')
        }
      } catch (webhookError) {
        console.warn('Webhook no pudo procesarse, pero el mensaje del usuario se guardó correctamente:', webhookError)
        // El mensaje del usuario ya se guardó, así que el chat sigue funcionando
      }
    } else {
      console.log('No hay webhook configurado para este chat')
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
