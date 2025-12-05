"use client"

import ReactMarkdown from 'react-markdown'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface MessageContentProps {
  content: string | object
  className?: string
}

interface ExtractedLink {
  href: string
  text: string
  type: 'photo' | 'profile' | 'generic'
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)
  const contentString = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;

  const getDirectGoogleDriveUrl = (url: string): string => {
    const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  };

  const determineLinkType = (text: string, url: string, index: number): 'photo' | 'profile' | 'generic' => {
    const lowerText = text.toLowerCase();

    // Detectar si es una foto
    if (lowerText.includes('foto') || lowerText.includes('photo') ||
      lowerText.includes('imagen') || lowerText.includes('image')) {
      return 'photo';
    }

    // Detectar si es un perfil ampliado
    if (lowerText.includes('perfil') || lowerText.includes('profile') ||
      lowerText.includes('ampliado') || lowerText.includes('extended') ||
      lowerText.includes('completo') || lowerText.includes('full')) {
      return 'profile';
    }

    // Si no hay texto descriptivo, usar el orden (primera = foto, segunda = perfil)
    if (index === 0) return 'photo';
    if (index === 1) return 'profile';

    return 'generic';
  };

  const extractLinks = (text: string): { links: ExtractedLink[], cleanedText: string } => {
    const links: ExtractedLink[] = [];
    let cleanedText = text;

    // 1. Extraer enlaces en formato Markdown [texto](URL)
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/\S+)\)/g;
    let match;
    let markdownIndex = 0;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];
      const linkType = determineLinkType(linkText, linkUrl, markdownIndex);

      links.push({
        href: linkUrl,
        text: linkText,
        type: linkType
      });

      markdownIndex++;
    }

    // Eliminar los enlaces Markdown del contenido
    cleanedText = cleanedText.replace(markdownLinkRegex, '');

    // 2. Extraer URLs planas (que no estén en formato Markdown)
    // Primero, crear una versión temporal sin los enlaces Markdown para evitar duplicados
    let tempText = text.replace(markdownLinkRegex, '');
    const plainUrlRegex = /(https?:\/\/[^\s]+)/g;
    let urlMatch;
    let plainIndex = markdownIndex;

    while ((urlMatch = plainUrlRegex.exec(tempText)) !== null) {
      const url = urlMatch[1];

      // Determinar el tipo basado en el contexto alrededor de la URL
      const contextBefore = tempText.substring(Math.max(0, urlMatch.index - 50), urlMatch.index).toLowerCase();
      let linkType: 'photo' | 'profile' | 'generic' = 'generic';
      let linkText = '';

      if (contextBefore.includes('foto') || contextBefore.includes('photo') ||
        contextBefore.includes('imagen') || contextBefore.includes('image')) {
        linkType = 'photo';
        linkText = 'Ver Foto';
      } else if (contextBefore.includes('perfil') || contextBefore.includes('profile') ||
        contextBefore.includes('ampliado') || contextBefore.includes('extended')) {
        linkType = 'profile';
        linkText = 'Ver Perfil Ampliado';
      } else {
        // Si no hay contexto, usar el orden
        if (plainIndex === 0 && links.length === 0) {
          linkType = 'photo';
          linkText = 'Ver Foto';
        } else if (plainIndex === 1 || (plainIndex === 0 && links.length === 1)) {
          linkType = 'profile';
          linkText = 'Ver Perfil Ampliado';
        } else {
          linkText = 'Ver Enlace';
        }
      }

      links.push({
        href: url,
        text: linkText,
        type: linkType
      });

      plainIndex++;
    }

    // Eliminar las URLs planas del contenido
    cleanedText = cleanedText.replace(plainUrlRegex, '');

    // Limpiar saltos de línea excesivos que puedan quedar
    cleanedText = cleanedText.replace(/(\r\n|\n|\r){2,}/g, '\n').trim();

    return { links, cleanedText };
  };

  const { links: buttonLinks, cleanedText } = extractLinks(contentString);

  const getButtonIcon = (type: 'photo' | 'profile' | 'generic') => {
    switch (type) {
      case 'photo':
        return <ImageIcon className="w-4 h-4 mr-2" />;
      case 'profile':
        return <FileText className="w-4 h-4 mr-2" />;
      default:
        return <ExternalLink className="w-4 h-4 mr-2" />;
    }
  };

  const getButtonText = (link: ExtractedLink): string => {
    if (link.text && link.text.trim() !== '') {
      return link.text;
    }

    switch (link.type) {
      case 'photo':
        return 'Ver Foto';
      case 'profile':
        return 'Ver Perfil Ampliado';
      default:
        return 'Ver Enlace';
    }
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown>{cleanedText}</ReactMarkdown>
      {buttonLinks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 not-prose">
          {buttonLinks.map((link, index) => {
            const buttonText = getButtonText(link);
            const icon = getButtonIcon(link.type);

            if (link.type === 'photo') {
              return (
                <Button
                  key={index}
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(link.href)}`;
                    setModalImageUrl(proxyUrl);
                  }}
                >
                  {icon}
                  {buttonText}
                </Button>
              )
            }

            return (
              <Button
                key={index}
                asChild
                variant={link.type === 'profile' ? 'default' : 'outline'}
                className={link.type === 'profile'
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all"
                  : "border-gray-300 hover:bg-gray-50 transition-all"
                }
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {icon}
                  {buttonText}
                </a>
              </Button>
            )
          })}
        </div>
      )}

      <Dialog open={!!modalImageUrl} onOpenChange={(isOpen) => !isOpen && setModalImageUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de la Foto</DialogTitle>
          </DialogHeader>
          <div className="mt-4 -mx-6 -mb-6">
            {modalImageUrl && <img src={modalImageUrl} alt="Vista previa de la foto" className="w-full h-auto rounded-b-lg" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}