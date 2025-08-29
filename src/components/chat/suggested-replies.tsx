"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SuggestedRepliesProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  isLoading: boolean
}

export function SuggestedReplies({ suggestions, onSelect, isLoading }: SuggestedRepliesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mb-3 h-9 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Generating suggestions...</span>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return <div className="h-9 mb-3"></div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="bg-accent/50 hover:bg-accent"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
