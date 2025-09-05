"use client"

import { useState } from "react"
import { detectGoogleDriveLinks } from "@/lib/google-drive-utils"
import { cn } from "@/lib/utils"
import { ExternalLink, ImageIcon } from "lucide-react"

interface MessageContentProps {
  content: string
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())
  
  const driveLinks = detectGoogleDriveLinks(content)
  
  if (driveLinks.length === 0) {
    // Si no hay enlaces de Google Drive, mostrar el contenido normal
    return (
      <p className={cn("whitespace-pre-wrap", className)}>
        {content}
      </p>
    )
  }
  
  // Procesar el contenido para mostrar imágenes y texto
  const parts: Array<{
    type: 'text' | 'image'
    content: string
    imageUrl?: string
    originalUrl?: string
  }> = []
  
  let lastIndex = 0
  
  driveLinks.forEach((link) => {
    // Agregar texto antes del enlace
    if (link.startIndex > lastIndex) {
      const textBefore = content.slice(lastIndex, link.startIndex)
      if (textBefore.trim()) {
        parts.push({
          type: 'text',
          content: textBefore
        })
      }
    }
    
    // Agregar la imagen
    parts.push({
      type: 'image',
      content: link.originalUrl,
      imageUrl: link.imageUrl,
      originalUrl: link.originalUrl
    })
    
    lastIndex = link.endIndex
  })
  
  // Agregar texto después del último enlace
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex)
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
          return (
            <p key={index} className="whitespace-pre-wrap">
              {part.content}
            </p>
          )
        }
        
        if (part.type === 'image' && part.imageUrl && part.originalUrl) {
          const hasError = imageErrors.has(part.imageUrl)
          const isLoading = imageLoading.has(part.imageUrl)
          
          return (
            <div key={index} className="space-y-2">
              {/* Siempre mostrar el enlace como alternativa principal */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Imagen de Google Drive</p>
                  <a 
                    href={part.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver imagen en Google Drive
                  </a>
                </div>
              </div>
              
              {/* Intentar mostrar la imagen como fallback */}
              {!hasError && (
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
                    style={{ maxHeight: '400px', display: hasError ? 'none' : 'block' }}
                    onLoadStart={() => handleImageLoadStart(part.imageUrl!)}
                    onLoad={() => handleImageLoad(part.imageUrl!)}
                    onError={() => handleImageError(part.imageUrl!)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg" />
                </div>
              )}
            </div>
          )
        }
        
        return null
      })}
    </div>
  )
}