"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Message = {
  id: string
  created_at: string
  content: string | object
  user_id: string
  user_avatar: string | null
  user_name: string | null
  chat_id: string
}

interface MessagesCache {
  [chatId: string]: Message[]
}

interface MessagesContextType {
  getMessages: (chatId: string) => Message[]
  addMessage: (chatId: string, message: Message) => void
  clearMessages: (chatId: string) => void
  clearAllMessages: () => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messagesCache, setMessagesCache] = useState<MessagesCache>({})

  // Obtener mensajes de un chat específico
  const getMessages = (chatId: string): Message[] => {
    return messagesCache[chatId] || []
  }

  // Agregar un mensaje a un chat específico
  const addMessage = (chatId: string, message: Message) => {
    setMessagesCache(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }))
  }

  // Limpiar mensajes de un chat específico
  const clearMessages = (chatId: string) => {
    setMessagesCache(prev => {
      const newCache = { ...prev }
      delete newCache[chatId]
      return newCache
    })
  }

  // Limpiar todos los mensajes
  const clearAllMessages = () => {
    setMessagesCache({})
  }

  return (
    <MessagesContext.Provider value={{
      getMessages,
      addMessage,
      clearMessages,
      clearAllMessages
    }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}