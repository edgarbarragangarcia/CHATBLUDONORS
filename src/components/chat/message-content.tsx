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

  const lines = contentString.split(/\\n|\n/);
  const buttonLinks: { href: string; text: string }[] = [];
  const textLines: string[] = [];

  const urlRegex = /(https?:\/\/\S+)/;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    const urlMatch = line.match(urlRegex);

    if (urlMatch) {
      const url = urlMatch[0].replace(/\\$/, '');
      if (lowerLine.includes('foto de la donante')) {
        buttonLinks.push({ href: url, text: 'Ver Foto' });
      } else if (lowerLine.includes('perfil ampliado')) {
        buttonLinks.push({ href: url, text: 'Ver Perfil Ampliado' });
      } else {
        textLines.push(line);
      }
    } else {
      textLines.push(line);
    }
  });

  const cleanedContent = textLines.join('\n').replace(/\n{3,}/g, '\n\n');

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown>{cleanedContent}</ReactMarkdown>
      <div className="mt-4">
        {buttonLinks.map((link, index) => (
          <Button key={index} asChild className="mr-2 mb-2">
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.text}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}