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
      <div className="flex items-center gap-2 mb-3 h-8 sm:h-9 text-xs sm:text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        <span>Generating suggestions...</span>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return <div className="h-8 sm:h-9 mb-3"></div>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="bg-accent/50 hover:bg-accent text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 rounded-lg transition-modern"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
