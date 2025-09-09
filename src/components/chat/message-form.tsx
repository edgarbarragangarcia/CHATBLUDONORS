"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal } from "lucide-react"

export function MessageForm({ onSendMessage }: { onSendMessage: (content: string) => void }) {
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSendMessage(content)
    setContent("")
  }

  const insertPredefinedPhrase = (phrase: string) => {
    setContent(phrase)
  }

  return (
    <div className="space-y-3">
      {/* Frases predefinidas */}
      <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg border">
        <h4 className="text-xs font-medium text-muted-foreground mb-1">Frases rápidas:</h4>
        <div className="flex flex-col gap-1.5">
          <button 
            type="button"
            onClick={() => insertPredefinedPhrase("Quiero ver la foto de la donante")}
            className="text-left p-2 text-xs bg-background hover:bg-accent hover:text-accent-foreground rounded border transition-colors cursor-pointer"
          >
            1. "Quiero ver la foto de la donante"
          </button>
          <button 
            type="button"
            onClick={() => insertPredefinedPhrase("Dame información sobre la donante")}
            className="text-left p-2 text-xs bg-background hover:bg-accent hover:text-accent-foreground rounded border transition-colors cursor-pointer"
          >
            2. "Dame información sobre la donante"
          </button>
        </div>
      </div>
      
      {/* Formulario de mensaje */}
      <form onSubmit={handleSubmit} className="flex items-start gap-2 sm:gap-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 resize-none min-h-[44px] sm:min-h-[48px]"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!content.trim()} className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 bg-gradient-to-r from-corporate-navy to-corporate-navy/90 hover:from-corporate-navy/90 hover:to-corporate-navy text-white shadow-lg shadow-corporate-navy/30 disabled:opacity-50 disabled:shadow-none">
          <SendHorizonal className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}
