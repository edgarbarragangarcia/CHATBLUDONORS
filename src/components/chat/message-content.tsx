"use client"

import ReactMarkdown, { Components } from 'react-markdown'
import React from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MessageContentProps {
  content: string | object
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  const contentString = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;

  const buttonLinks: { href: string; text: string }[] = [];
  let cleanedContent = contentString;

  // Regex para encontrar "Ver [texto del botón]" y la URL en la misma línea
  const buttonRegex = /Ver (Foto|Perfil Ampliado)[\s\S]*?(https?:\/\/\S+)/gi;
  
  let match;
  while ((match = buttonRegex.exec(contentString)) !== null) {
    const buttonText = `Ver ${match[1]}`;
    const url = match[2];
    buttonLinks.push({ href: url, text: buttonText });
  }

  // Limpiar el contenido de las líneas que generan botones
  cleanedContent = cleanedContent.replace(/Puedes ver sus fotos aquí:/gi, '').replace(buttonRegex, '').trim();

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown>{cleanedContent}</ReactMarkdown>
      <div className="mt-4 flex flex-wrap gap-2">
        {buttonLinks.map((link, index) => (
          <Button key={index} asChild>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.text}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}