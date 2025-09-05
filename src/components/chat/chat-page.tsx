
"use client"

import { useState, useEffect, useCallback } from "react"
import { type User } from "@supabase/supabase-js"
import { generateSuggestedReplies } from "@/ai/flows/suggested-replies"
import { useWebhook } from "@/contexts/webhook-context"
import { useMessages, type Message } from "@/contexts/messages-context"

import { Card } from "@/components/ui/card"
import { MessageList } from "./message-list"
import { MessageForm } from "./message-form"
import { SuggestedReplies } from "./suggested-replies"

export default function ChatPage({ user, email, chatId }: { user: User, email?: string, chatId: string }) {
  const { getWebhookUrl } = useWebhook()
  const { getMessages, addMessage } = useMessages()
  const messages = getMessages(chatId)
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [chatWebhookUrl, setChatWebhookUrl] = useState<string | null>(null)

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



  // Los mensajes ahora se manejan completamente en memoria
  // No necesitamos fetchMessages desde Supabase

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
    fetchChatWebhook() // Cargar el webhook URL del chat
    console.log('Chat inicializado en modo memoria para:', chatId)
  }, [fetchChatWebhook, chatId])

  // Generar sugerencias cuando los mensajes cambien (temporalmente deshabilitado)
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     fetchSuggestions(messages)
  //   }
  // }, [messages])

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

    console.log('Enviando mensaje (solo memoria):', content)

    // Crear mensaje del usuario directamente en memoria
    const userProfile = getProfileForUser(user.id)
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random()}`, // ID único temporal
      created_at: new Date().toISOString(),
      content: content,
      user_id: user.id,
      user_name: userProfile.name,
      user_avatar: userProfile.avatar,
      chat_id: chatId,
    }

    // Agregar el mensaje del usuario al contexto global inmediatamente
    console.log('Agregando mensaje del usuario al contexto global:', userMessage)
    addMessage(chatId, userMessage)

    // Si hay webhook configurado, intentamos enviar el mensaje
    if (chatWebhookUrl) {
      try {
        setIsTyping(true) // Mostrar indicador de escritura
        console.log('Enviando al webhook:', chatWebhookUrl)
        const webhookResponse = await sendToWebhook(content)
        
        if (webhookResponse) {
          console.log('Respuesta del webhook recibida:', webhookResponse)
          
          // Crear mensaje del bot directamente en memoria
          const botProfile = getProfileForUser('00000000-0000-0000-0000-000000000000')
          const botMessage: Message = {
            id: `bot-${Date.now()}-${Math.random()}`, // ID único temporal
            created_at: new Date().toISOString(),
            content: webhookResponse !== null && typeof webhookResponse === 'object' && 'output' in webhookResponse ? (webhookResponse as any).output : String(webhookResponse),
            user_id: '00000000-0000-0000-0000-000000000000',
            user_name: botProfile.name,
            user_avatar: botProfile.avatar,
            chat_id: chatId,
          }
          
          // Agregar el mensaje del bot al contexto global inmediatamente
          console.log('Agregando mensaje del bot al contexto global:', botMessage)
          addMessage(chatId, botMessage)
        } else {
          console.log('Webhook no disponible o no respondió - el chat continúa funcionando normalmente')
        }
      } catch (webhookError) {
        console.warn('Error con el webhook, pero el mensaje se mantiene en memoria:', webhookError)
      } finally {
        setIsTyping(false) // Ocultar indicador de escritura
      }
    } else {
      console.log('No hay webhook configurado para este chat')
    }
  }

  return (
    <main className="h-full flex flex-col bg-background rounded-lg">
        <MessageList messages={messages} currentUserId={user.id} isTyping={isTyping} />
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
