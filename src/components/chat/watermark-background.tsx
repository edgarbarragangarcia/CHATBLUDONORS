"use client"

import { useEffect, useState } from "react"

interface WatermarkBackgroundProps {
  size?: "small" | "large"
  opacity?: number
  className?: string
}

export function WatermarkBackground({ size = "large", opacity = 0.15, className = "" }: WatermarkBackgroundProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const backgroundSize = size === "small" ? "250px 250px" : "400px 400px"
  const finalOpacity = opacity

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: 'url(/logoIngenes.png)',
        backgroundSize,
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        opacity: finalOpacity
      }}
    />
  )
}