"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

interface MessageContentProps {
  content: string | object
  className?: string
}

interface DriveLink {
  text: string
  url: string
  type: 'photo' | 'profile'
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())
  
  // Convertir objeto a string si es necesario
  const contentString = typeof content === 'object' ? JSON.stringify(content, null, 2) : content
  
  // Extraer enlaces de Google Drive con sus textos
  const extractDriveLinks = (text: string): DriveLink[] => {
    const links: DriveLink[] = [];
    const regex = /\[([^\]]+)\]\((https:\/\/drive\.google\.com\/[^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Ignorar las URLs que ya están dentro de otro enlace markdown
      const prevChar = text.charAt(Math.max(0, match.index - 1));
      if (prevChar === '(') continue;
      
      const type = match[1].toLowerCase().includes('foto') ? 'photo' : 'profile';
      links.push({
        text: match[1],
        url: match[2],
        type
      });
    }
    
    return links;
  }
  
  // Extraer el texto limpio (sin los enlaces markdown)
  const getCleanText = (text: string) => {
    return text.replace(/\[([^\]]+)\]\(https:\/\/drive\.google\.com\/[^)]+\)/g, '').trim();
  }
  
  // Función para procesar texto con formato de negrilla
  const processTextFormatting = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

  // Si es un objeto JSON y no hay enlaces de Drive, mostrar como JSON formateado
  if (typeof content === 'object' && !contentString.includes('drive.google.com')) {
    return (
      <div className={cn("whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border", className)}>
        <pre className="text-sm overflow-x-auto">
          <code>{JSON.stringify(content, null, 2)}</code>
        </pre>
      </div>
    )
  }

  const driveLinks = extractDriveLinks(contentString);
  const cleanText = getCleanText(contentString);
  
  // Obtener el ID del archivo de Google Drive
  const getGoogleDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/([^/]+)/);
    return match ? match[1] : null;
  }

  // Convertir URL de Google Drive a URL de vista previa
  const getPreviewUrl = (url: string) => {
    const fileId = getGoogleDriveId(url);
    return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mostrar el texto limpio primero */}
      {cleanText && (
        <p 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: processTextFormatting(cleanText) }}
        />
      )}
      
      {/* Mostrar las imágenes y botones de perfil */}
      <div className="flex flex-col gap-4">
        {driveLinks.map((link, index) => {
          if (link.type === 'photo') {
            // Renderizar la imagen
            const imageUrl = getPreviewUrl(link.url);
            const isLoading = imageLoading.has(imageUrl);
            const hasError = imageErrors.has(imageUrl);

            return (
              <div key={index} className="relative group">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
                {hasError ? (
                  <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg border border-dashed">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No se pudo cargar la imagen</p>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Ver en Google Drive
                      </a>
                    </div>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={link.text}
                    className="max-w-full h-auto rounded-lg shadow-sm border border-border/50 transition-transform duration-200 group-hover:scale-[1.02] cursor-pointer"
                    style={{ maxHeight: '400px', minHeight: '200px', objectFit: 'contain' }}
                    onLoadStart={() => handleImageLoadStart(imageUrl)}
                    onLoad={() => handleImageLoad(imageUrl)}
                    onError={() => handleImageError(imageUrl)}
                    loading="lazy"
                    onClick={() => window.open(link.url, '_blank')}
                  />
                )}
              </div>
            );
          } else {
            // Renderizar botón para perfil
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-corporate-navy hover:bg-corporate-navy/90 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md self-start"
              >
                {link.text}
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            );
          }
        })}
      </div>
    </div>
  )
}