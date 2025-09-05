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
          
          return (
            <div key={index} className="space-y-2">
              {hasError ? (
                // Mostrar enlace si la imagen falló al cargar
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Imagen no disponible:</span>
                  <a 
                    href={part.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Ver en Google Drive
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                // Mostrar imagen
                <div className="relative group">
                  <img
                    src={part.imageUrl}
                    alt="Imagen compartida"
                    className="max-w-full h-auto rounded-lg shadow-sm border border-border/50 transition-transform duration-200 group-hover:scale-[1.02]"
                    style={{ maxHeight: '400px' }}
                    onError={() => handleImageError(part.imageUrl!)}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg" />
                  <a 
                    href={part.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-md"
                    title="Ver en Google Drive"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
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