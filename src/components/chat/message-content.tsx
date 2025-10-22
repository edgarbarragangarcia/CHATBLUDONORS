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

  // Regex para encontrar enlaces de Markdown en el formato [texto](URL)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/\S+)\)/g;
  
  // Reemplazar los enlaces de Markdown por botones y limpiar el contenido
  let buttonIndex = 0;
  cleanedContent = cleanedContent.replace(markdownLinkRegex, (match, text, url) => {
    const buttonText = buttonIndex === 0 ? "Ver Documento" : "Ver Perfil Ampliado";
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