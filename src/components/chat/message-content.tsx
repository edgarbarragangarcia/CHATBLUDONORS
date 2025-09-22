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
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Procesar enlaces markdown [texto](url)
    processed = processed.replace(/\[([^\]]+)\]\(((?:https?:\/\/)?[^)]+)\)/g, (match, text, url) => {
      // Verificar si la URL está en formato markdown también
      const nestedMarkdown = url.match(/\[([^\]]+)\]\(((?:https?:\/\/)?[^)]+)\)/);
      if (nestedMarkdown) {
        // Si hay un enlace markdown anidado, usar la URL interna
        return `<a href="${nestedMarkdown[2]}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${text}</a>`;
      }
      
      // Limpiar la URL de cualquier prefijo de dominio no deseado
      const cleanUrl = url.replace(/^https?:\/\/[^\/]+\//, '');
      // Asegurarse de que la URL sea absoluta si es un enlace de Google Drive
      const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : 
                      cleanUrl.includes('drive.google.com') ? `https://${cleanUrl}` : cleanUrl;
      
      return `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${text}</a>`;
    });
    
    return processed;
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
  const processedImageUrls = new Set<string>() // Para evitar duplicados
  const processedDriveFileIds = new Set<string>() // Para evitar duplicados de archivos de Drive
  
  // Determinar el orden de los enlaces antes de procesarlos
  const uniqueDriveLinks = driveLinks.filter((link, index, self) => {
    // Eliminar duplicados basados en la URL
    return index === self.findIndex(l => l.originalUrl === link.originalUrl)
  })
  
  uniqueDriveLinks.forEach((link, linkIndex) => {
    // Extraer el ID del archivo de Google Drive
    const driveFileIdMatch = link.originalUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
    const driveFileId = driveFileIdMatch ? driveFileIdMatch[1] : null
    
    // Si ya procesamos este archivo de Drive, saltarlo
    if (driveFileId && processedDriveFileIds.has(driveFileId)) {
      lastIndex = link.endIndex
      return
    }
    
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
    // Extraer el texto del enlace si está en formato markdown
    const markdownMatch = contentString.slice(Math.max(0, link.startIndex - 50), link.endIndex + 50)
      .match(/\[([^\]]+)\]\((https:\/\/drive\.google\.com\/[^)]+)\)/)
    
    const linkText = markdownMatch ? markdownMatch[1] : ''
    const hasPhotoKeyword = linkText.toLowerCase().includes('foto') || 
                           linkText.toLowerCase().includes('imagen') ||
                           link.originalUrl.toLowerCase().includes('ver foto')
    
    // Para el formato específico del webhook: detectar si es foto basándonos en el orden
    // Primera URL = foto, segunda URL = perfil ampliado
    const isFirstLink = linkIndex === 0
    const isSecondLink = linkIndex === 1
    
    // Si es el primer enlace, tratarlo como foto
    const isImageLink = isFirstLink || 
                       link.originalUrl.includes('1AJkWdvRKDg13Y49WaEyL6gL8Xyruz8H8') || // ID específico de la foto
                       hasPhotoKeyword
    
    if (isImageLink && link.imageUrl && !processedImageUrls.has(link.imageUrl)) {
      // Agregar como imagen solo si no la hemos procesado antes
      processedImageUrls.add(link.imageUrl)
      if (driveFileId) processedDriveFileIds.add(driveFileId)
      parts.push({
        type: 'image',
        content: link.originalUrl,
        imageUrl: link.imageUrl,
        originalUrl: link.originalUrl
      })
    } else if (!isImageLink) {
      // Agregar como enlace/botón
      if (driveFileId) processedDriveFileIds.add(driveFileId)
      
      // Extraer el texto del enlace del formato markdown si existe
      const markdownMatch = contentString.slice(Math.max(0, link.startIndex - 50), link.endIndex + 50)
        .match(/\[([^\]]+)\]\((https:\/\/drive\.google\.com\/[^)]+)\)/)
      
      parts.push({
        type: 'link',
        content: link.originalUrl,
        originalUrl: link.originalUrl,
        linkText: markdownMatch ? markdownMatch[1] : (isSecondLink ? 'Ver perfil ampliado' : 'Ver enlace')
      })
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
                    alt="Foto de la donante"
                    className="max-w-full h-auto rounded-lg shadow-sm border border-border/50 transition-transform duration-200 group-hover:scale-[1.02] cursor-pointer"
                    style={{ maxHeight: '400px', minHeight: '200px' }}
                    onLoadStart={() => handleImageLoadStart(part.imageUrl!)}
                    onLoad={() => handleImageLoad(part.imageUrl!)}
                    onError={() => handleImageError(part.imageUrl!)}
                    loading="lazy"
                    onClick={() => window.open(part.originalUrl, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 rounded-lg" />
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg border border-dashed">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No se pudo cargar la imagen</p>
                    <a 
                      href={part.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Ver en Google Drive
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        }
        
        if (part.type === 'link' && part.originalUrl) {
          // Verificar si la URL está en formato markdown
          const markdownMatch = part.originalUrl.match(/\[([^\]]+)\]\(((?:https?:\/\/)?[^)]+)\)/);
          const url = markdownMatch ? markdownMatch[2] : part.originalUrl;
          
          // Limpiar la URL de cualquier prefijo de dominio no deseado
          const cleanUrl = url.replace(/^https?:\/\/[^\/]+\//, '');
          // Asegurarse de que la URL sea absoluta si es un enlace de Google Drive
          const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : 
                          cleanUrl.includes('drive.google.com') ? `https://${cleanUrl}` : cleanUrl;
          
          return (
            <div key={index} className="mt-2">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-corporate-navy hover:bg-corporate-navy/90 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {part.linkText || 'Ver enlace'}
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )
        }
        
        return null
      })}
    </div>
  )
}