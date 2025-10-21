"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WebhookCache {
  [chatId: string]: string | null
}

interface WebhookContextType {
  getWebhookUrl: (chatId: string) => Promise<string | null>
  setWebhookUrl: (chatId: string, url: string | null) => void
  removeWebhook: (chatId: string) => void
  clearCache: () => void
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined)

export function WebhookProvider({ children }: { children: ReactNode }) {
  const [webhookCache, setWebhookCache] = useState<WebhookCache>({})
  const supabase = createClient()

  // Función para obtener webhook URL (primero del caché, luego de Supabase)
  const getWebhookUrl = async (chatId: string): Promise<string | null> => {
    // Si ya está en caché, devolverlo inmediatamente
    if (chatId in webhookCache) {
      return webhookCache[chatId]
    }

    // Si no está en caché, consultar Supabase
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('webhook_url')
        .eq('id', chatId)
        .single()

      if (error) {
        console.error('Error fetching webhook URL:', error)
        // Guardar null en caché para evitar consultas repetitivas
        setWebhookCache(prev => ({ ...prev, [chatId]: null }))
        return null
      }

      const webhookUrl = data?.webhook_url || null
      
      // Guardar en caché
      setWebhookCache(prev => ({ ...prev, [chatId]: webhookUrl }))
      return webhookUrl
    } catch (error) {
      console.error('Error fetching webhook URL:', error)
      setWebhookCache(prev => ({ ...prev, [chatId]: null }))
      return null
    }
  }

  // Función para actualizar webhook URL en caché
  const setWebhookUrl = (chatId: string, url: string | null) => {
    setWebhookCache(prev => ({ ...prev, [chatId]: url }))
  }

  // Función para remover webhook del caché (cuando se elimina un chat)
  const removeWebhook = (chatId: string) => {
    setWebhookCache(prev => {
      const newCache = { ...prev }
      delete newCache[chatId]
      return newCache
    })
  }

  // Función para limpiar todo el caché
  const clearCache = () => {
    setWebhookCache({})
  }

  // Escuchar cambios en tiempo real en la tabla de chats para mantener el caché sincronizado
  useEffect(() => {
    
    const channel = supabase
      .channel('webhook-cache-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chats' },
        (payload) => {
          const chatId = payload.new.id
          const newWebhookUrl = payload.new.webhook_url
          setWebhookUrl(chatId, newWebhookUrl)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chats' },
        (payload) => {
          const chatId = payload.old.id
          removeWebhook(chatId)
        }
      )
      .subscribe((status) => {
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const value: WebhookContextType = {
    getWebhookUrl,
    setWebhookUrl,
    removeWebhook,
    clearCache
  }

  return (
    <WebhookContext.Provider value={value}>
      {children}
    </WebhookContext.Provider>
  )
}

export function useWebhook() {
  const context = useContext(WebhookContext)
  if (context === undefined) {
    throw new Error('useWebhook must be used within a WebhookProvider')
  }
  return context
}