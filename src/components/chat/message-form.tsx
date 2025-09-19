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

  return (
    <div className="space-y-3">
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
