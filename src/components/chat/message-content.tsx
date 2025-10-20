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
  
  // Extraer enlaces de Google Drive y su texto descriptivo asociado
  const extractDriveLinks = (text: string): DriveLink[] => {
    const links: DriveLink[] = [];
    // Expresión regular final que captura el formato: *   **Texto:** [URL](URL)
    const regex = /\*   \*\*(.*?):\*\* \[(https:\/\/drive\.google\.com\/[^\]]+)\]\(\1\)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const description = match[1].trim();
      const url = match[2];
      // Determina el tipo basado en la descripción
      const type = description.toLowerCase().includes('foto') ? 'photo' : 'profile';
      
      links.push({
        text: description,
        url: url,
        type
      });
    }
    
    return links;
  }
  
  // Extraer el texto limpio (sin las líneas que contienen enlaces de Drive)
  const getCleanText = (text: string) => {
    // Elimina las líneas completas que contienen un enlace de Google Drive para evitar duplicados
    return text.split('\n').filter(line => !/\[(https:\/\/drive\.google\.com\/[^\]]+)\]\(\1\)/.test(line)).join('\n').trim();
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

  // Convertir URL de Google Drive a URL de imagen directa
  const getPreviewUrl = (url: string) => {
    const fileId = getGoogleDriveId(url);
    // Usamos un proxy de imagen para evitar problemas de CORS y mejorar el rendimiento
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : null;
  }

  const processedText = processTextFormatting(cleanText);

  return (
    <div className={cn("space-y-3", className)}>
      {cleanText && <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: processedText }} />}
      
      <div className="space-y-3">
        {driveLinks.map((link, index) => {
          const previewUrl = getPreviewUrl(link.url);
          const isPhoto = link.text.toLowerCase().includes('foto');

          // Si es una foto y tenemos una URL de vista previa válida que no ha dado error
          if (isPhoto && previewUrl && !imageErrors.has(previewUrl)) {
            return (
              <div key={index} className="relative group max-w-sm">
                {imageLoading.has(previewUrl) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                )}
                <img 
                  src={previewUrl} 
                  alt={link.text} 
                  className={cn(
                    "w-full h-auto rounded-lg shadow-md transition-all duration-300 ease-in-out",
                    imageLoading.has(previewUrl) ? "opacity-0" : "opacity-100 group-hover:scale-105 group-hover:shadow-xl"
                  )}
                  onLoad={() => handleImageLoad(previewUrl)}
                  onError={() => handleImageError(previewUrl)}
                  onLoadStart={() => handleImageLoadStart(previewUrl)}
                />
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Abrir imagen en nueva pestaña"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 001.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            );
          }

          // Fallback: Renderizar como un botón si no es una foto o si la imagen falló
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-primary/10 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/20 transition-all duration-300 shadow-sm border border-primary/20 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span>{link.text}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}