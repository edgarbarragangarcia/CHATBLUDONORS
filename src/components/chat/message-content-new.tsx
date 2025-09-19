"use client"

import { useState } from "react"
import { detectGoogleDriveLinks } from "@/lib/google-drive-utils"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

interface MessageContentProps {
  content: string | object
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())
  
  // Convertir objeto a string si es necesario
  const contentString = typeof content === 'object' ? JSON.stringify(content, null, 2) : content
  
  const driveLinks = detectGoogleDriveLinks(contentString)
  
  // Función para procesar texto con formato de negrilla
  const processTextFormatting = (text: string) => {
    // Convertir **texto** a <strong>texto</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  }
  
  if (driveLinks.length === 0) {
    // Si no hay enlaces de Google Drive, mostrar el contenido normal
    // Si es un objeto JSON, mostrarlo formateado
    if (typeof content === 'object') {
      return (
        <div className={cn("whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border", className)}>
          <pre className="text-sm overflow-x-auto">
            <code>{JSON.stringify(content, null, 2)}</code>
          </pre>
        </div>
      )
    }
    
    const formattedContent = processTextFormatting(contentString)
    return (
      <p 
        className={cn("whitespace-pre-wrap", className)}
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    )
  }
  
  // Procesar el contenido para mostrar imágenes, enlaces y texto
  const parts: Array<{
    type: 'text' | 'image' | 'link'
    content: string
    imageUrl?: string
    originalUrl?: string
    linkText?: string
  }> = []
  
  let lastIndex = 0
  let perfilButtonRendered = false // Para asegurar que solo se renderice un botón de perfil
  
  driveLinks.forEach((link) => {
    // Agregar texto antes del enlace
    if (link.startIndex > lastIndex) {
      const textBefore = contentString.slice(lastIndex, link.startIndex)
      if (textBefore.trim()) {
        parts.push({
          type: 'text',
          content: textBefore
        })
      }
    }
    
    // Determinar si es una imagen o un enlace basándonos en el contexto
    const isImageLink = contentString.toLowerCase().includes('foto') && 
                       (link.originalUrl.includes('1AlbDDEqzWZ6Bci_mkQ7ch3l2HNhFTThv') || // ID de la foto actual
                        link.originalUrl.includes('1AJkWdvRKDg13Y49WaEyL6gL8Xyruz8H8')) || // ID anterior de foto
                       contentString.toLowerCase().includes('imagen')
    
    // Detectar si es un perfil ampliado basándonos en el contexto
    const isPerfilAmpliado = contentString.toLowerCase().includes('perfil ampliado') ||
                            link.originalUrl.includes('1oqz_5xVT50NbNsl3ddfkI-2BuTYqBt3a') || // ID actual de perfil
                            link.originalUrl.includes('1orUrJlosERwf9mw9ThSTmLScTReX22qn') // ID anterior de perfil
    
    if (isImageLink) {
      // Agregar como imagen
      parts.push({
        type: 'image',
        content: link.originalUrl,
        imageUrl: link.imageUrl,
        originalUrl: link.originalUrl
      })
    } else if (isPerfilAmpliado && !perfilButtonRendered) {
      // Solo renderizar un botón de perfil ampliado
      parts.push({
        type: 'link',
        content: link.originalUrl,
        originalUrl: link.originalUrl,
        linkText: 'Ver perfil ampliado'
      })
      perfilButtonRendered = true
    }
    
    lastIndex = link.endIndex
  })
  
  // Agregar texto después del último enlace
  if (lastIndex < contentString.length) {
    const textAfter = contentString.slice(lastIndex)
    if (textAfter.trim()) {
      parts.push({
        type: 'text',
        content: textAfter
      })
    }
  }
  
  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set([...prev, imageUrl]))
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageUrl)
      return newSet
    })
  }

  const handleImageLoad = (imageUrl: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageUrl)
      return newSet
    })
  }

  const handleImageLoadStart = (imageUrl: string) => {
    setImageLoading(prev => new Set([...prev, imageUrl]))
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          const formattedContent = processTextFormatting(part.content)
          return (
            <p 
              key={index} 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )
        }
        
        if (part.type === 'image' && part.imageUrl && part.originalUrl) {
          const hasError = imageErrors.has(part.imageUrl)
          const isLoading = imageLoading.has(part.imageUrl)
          
          return (
            <div key={index} className="space-y-2">
              {/* Mostrar la imagen como contenido principal */}
              {!hasError ? (
                <div className="relative group">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}
                  <img
                    src={part.imageUrl}
                    alt="Imagen compartida"
                    className="max-w-full h-auto rounded-lg shadow-sm border border-border/50 transition-transform duration-200 group-hover:scale-[1.02]"
                    style={{ maxHeight: '400px' }}
                    onLoadStart={() => handleImageLoadStart(part.imageUrl!)}
                    onLoad={() => handleImageLoad(part.imageUrl!)}
                    onError={() => handleImageError(part.imageUrl!)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg" />
                </div>
              ) : null}
            </div>
          )
        }
        
        if (part.type === 'link' && part.originalUrl) {
          // Extraer la URL limpia del enlace de Google Drive
          const cleanUrl = part.originalUrl.match(/https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view[^\s\])]*/)?.[0] || part.originalUrl;
          
          return (
            <div key={index} className="my-2" dangerouslySetInnerHTML={{
              __html: `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-corporate-navy hover:bg-corporate-navy/90 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md">Ver perfil ampliado<svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`
            }} />
          )
        }
        
        return null
      })}
    </div>
  )
}