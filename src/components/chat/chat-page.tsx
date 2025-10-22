"use client"

import { useState, useEffect, useCallback } from "react"
import { type User } from "@supabase/supabase-js"
import { useWebhook } from "@/contexts/webhook-context"
import { useMessages, type Message } from "@/contexts/messages-context"

import { Card } from "@/components/ui/card"
import { MessageList } from "./message-list"
import { MessageForm } from "./message-form"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage({ user, email, chatId }: { user: User, email?: string, chatId: string }) {
  const { toast } = useToast()
  const { getWebhookUrl } = useWebhook()
  const { getMessages, addMessage } = useMessages()
  const messages = getMessages(chatId)
  const [isTyping, setIsTyping] = useState(false)
  const [chatWebhookUrl, setChatWebhookUrl] = useState<string | null>(null)

  const getProfileForUser = (userId: string) => {
    // Caso especial para mensajes del sistema/bot
    if (userId === 'system' || userId === '00000000-0000-0000-0000-000000000000') {
      return {
        name: 'Anakin',
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
      setChatWebhookUrl(webhookUrl)
    } catch (error) {
      toast({
        title: "Error de Conexión",
        description: "No se pudo obtener la configuración del webhook para este chat.",
        variant: "destructive",
      })
      setChatWebhookUrl(null)
    }
  }, [getWebhookUrl, chatId])

  useEffect(() => {
    fetchChatWebhook() // Cargar el webhook URL del chat
  }, [fetchChatWebhook, chatId])

  // Función para enviar mensaje al webhook usando proxy interno (sin CORS)
  const sendToWebhook = async (content: string): Promise<any | null> => {
    if (!chatWebhookUrl) {
      return null
    }
    
    try {
      
      const response = await fetch(`/api/webhook-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatId: chatId,
          message: content, 
          userId: user.id 
        }),
        // Timeout de 60 segundos para permitir procesamiento completo
      signal: AbortSignal.timeout(60000)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          if (data.response) {
            return data.response
          } else {
            return null
          }
        } else {
          toast({
            title: "Error en el Webhook",
            description: data.error || "Hubo un problema al procesar la respuesta del webhook.",
            variant: "destructive",
          })
          return null
        }
      } else {
        toast({
          title: "Error de Conexión",
          description: `El servidor proxy respondió con un error ${response.status}.`,
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast({
            title: "Tiempo de Espera Excedido",
            description: "El webhook tardó demasiado en responder (más de 60 segundos).",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error al Enviar Mensaje",
            description: "No se pudo conectar con el webhook. Revisa tu conexión.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error Desconocido",
          description: "Ocurrió un error inesperado al enviar el mensaje.",
          variant: "destructive",
        })
      }
      return null
    }
  }

  // Función para limpiar y corregir URLs malformadas en la respuesta del webhook
  const cleanWebhookResponse = (response: any): any => {
    if (typeof response === 'string') {
      // Limpiar URLs malformadas que incluyen markdown incorrecto con base URL
      let cleaned = response.replace(
        /(https?:\/\/[^\/]+\/)\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[^)]+)\)/g,
        '[$2]($3)'
      );
      
      // Limpiar casos donde la URL base está mal incluida sin corchetes
      cleaned = cleaned.replace(
        /(https?:\/\/[^\/]+\/)([^\s]+)/g,
        (match, baseUrl, path) => {
          // Si el path contiene un enlace de Google Drive, extraer solo ese
          const driveMatch = path.match(/\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[^)]+)\)/);
          if (driveMatch) {
            return `[${driveMatch[1]}](${driveMatch[2]})`;
          }
          // Si es un enlace markdown completo, mantenerlo intacto
          const markdownMatch = path.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
          if (markdownMatch) {
            return `[${markdownMatch[1]}](${markdownMatch[2]})`;
          }
          // Si no coincide con ningún patrón, devolver el path original
          return path;
        }
      );
      
      return cleaned;
    }

    if (Array.isArray(response)) {
      return response.map(item => cleanWebhookResponse(item));
    }
    
    if (typeof response === 'object' && response !== null) {
      const cleaned = { ...response };
      
      // Función auxiliar para limpiar campos de texto
      const cleanTextField = (text: string): string => {
        let cleanedText = text.replace(
          /https:\/\/chatbludonors\.vercel\.app\/\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[^)]+)\)/g,
          '[$1]($2)'
        );
        
        cleanedText = cleanedText.replace(
          /https:\/\/chatbludonors\.vercel\.app\/([^\s]+)/g,
          (match, path) => {
            const driveMatch = path.match(/\[([^\]]+)\]\((https:\/\/drive\.google\.com\/file\/d\/[^)]+)\)/);
            if (driveMatch) {
              return `[${driveMatch[1]}](${driveMatch[2]})`;
            }
            return match;
          }
        );
        
        return cleanedText;
      };
      
      // Limpiar el campo output si existe
      if (cleaned.output && typeof cleaned.output === 'string') {
        cleaned.output = cleanTextField(cleaned.output);
      }
      
      // Limpiar el campo response si existe
      if (cleaned.response && typeof cleaned.response === 'string') {
        cleaned.response = cleanTextField(cleaned.response);
      }
      
      // Limpiar el campo message si existe
      if (cleaned.message && typeof cleaned.message === 'string') {
        cleaned.message = cleanTextField(cleaned.message);
      }
      
      return cleaned;
    }
    
    return response;
  };

  const handleSendMessage = async (content: string) => {
    if (content.trim() === "" || !chatId) return


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
    addMessage(chatId, userMessage)

    // Si hay webhook configurado, intentamos enviar el mensaje
    if (chatWebhookUrl) {
      try {
        setIsTyping(true) // Mostrar indicador de escritura
        const webhookResponse = await sendToWebhook(content)
        
        if (webhookResponse) {
          
          // Limpiar la respuesta del webhook para corregir URLs malformadas
          const cleanedResponse = cleanWebhookResponse(webhookResponse);
          
          // Si el response es un objeto con información completa (incluyendo avatar)
          let messageContent = ''
          let botAvatar = null
          
          if (Array.isArray(cleanedResponse) && cleanedResponse.length > 0) {
            const firstItem = cleanedResponse[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
              messageContent = firstItem.output || firstItem.response || firstItem.message || JSON.stringify(firstItem);
              botAvatar = firstItem.avatar_url || firstItem.profile_avatar || firstItem.user_avatar || null;
            } else {
              messageContent = String(firstItem);
            }
          } else if (cleanedResponse !== null && typeof cleanedResponse === 'object') {
            // Extraer el contenido del mensaje
            messageContent = cleanedResponse.output || cleanedResponse.response || cleanedResponse.message || JSON.stringify(cleanedResponse)
            // Si hay avatar en la respuesta, usarlo
            botAvatar = cleanedResponse.avatar_url || cleanedResponse.profile_avatar || cleanedResponse.user_avatar || null
          } else if (cleanedResponse !== null) {
            messageContent = String(cleanedResponse)
          } else {
            messageContent = 'No hubo respuesta del webhook'
          }
          
          // Crear mensaje del bot directamente en memoria
          const botProfile = getProfileForUser('00000000-0000-0000-0000-000000000000')
          const botMessage: Message = {
            id: `bot-${Date.now()}-${Math.random()}`, // ID único temporal
            created_at: new Date().toISOString(),
            content: messageContent,
            user_id: '00000000-0000-0000-0000-000000000000',
            user_name: botProfile.name,
            user_avatar: botAvatar, // Usar el avatar de la respuesta si existe
            chat_id: chatId,
          }
          
          // Agregar el mensaje del bot al contexto global inmediatamente
          addMessage(chatId, botMessage)
        } else {
        }
      } catch (webhookError) {
        toast({
          title: "Error en el Webhook",
          description: "El mensaje fue guardado, pero no se pudo procesar por el webhook.",
          variant: "destructive",
        })
      } finally {
        setIsTyping(false) // Ocultar indicador de escritura
      }
    } else {
    }
  }

  return (
    <main className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} currentUserId={user.id} isTyping={isTyping} />
      </div>
      <div className="flex-none sticky bottom-0 z-10 bg-background border-t border-border/50">
        <div className="p-4">
          <MessageForm onSendMessage={handleSendMessage} />
        </div>
      </div>
    </main>
  )
}
