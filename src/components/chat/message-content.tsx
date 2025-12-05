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

interface MessageContentProps {
  content: string | object
  className?: string
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

  const buttonLinks: { href: string; text: string }[] = [];
  let cleanedContent = contentString;

  // Regex para encontrar enlaces de Markdown en el formato [texto](URL)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/\S+)\)/g;
  
  // Reemplazar los enlaces de Markdown por botones y limpiar el contenido
  let buttonIndex = 0;
  cleanedContent = cleanedContent.replace(markdownLinkRegex, (match, text, url) => {
    const buttonText = buttonIndex === 0 ? "Ver Foto" : "Ver Perfil Ampliado";
    buttonLinks.push({ href: url, text: buttonText });
    buttonIndex++;
    return ''; // Eliminar el enlace del contenido principal
  });

  // Limpiar saltos de línea excesivos que puedan quedar
  cleanedContent = cleanedContent.replace(/(\r\n|\n|\r){2,}/g, '\n').trim();

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown>{cleanedContent}</ReactMarkdown>
      <div className="mt-4 flex flex-wrap gap-2">
        {buttonLinks.map((link, index) => {
          if (link.text === "Ver Foto") {
            return (
              <Button key={index} variant="outline" onClick={() => {
                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(link.href)}`;
                setModalImageUrl(proxyUrl);
              }}>
                {link.text}
              </Button>
            )
          }
          return (
            <Button key={index} asChild>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </Button>
          )
        })}
      </div>

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