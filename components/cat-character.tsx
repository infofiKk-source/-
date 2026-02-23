"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"

interface CatCharacterProps {
  size?: "small" | "medium" | "large"
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  showHeartAnimation?: boolean
  className?: string
}

export function CatCharacter({
  size = "small",
  position = "bottom-right",
  showHeartAnimation = false,
  className = "",
}: CatCharacterProps) {
  const [showHeart, setShowHeart] = useState(false)

  useEffect(() => {
    if (showHeartAnimation) {
      setShowHeart(true)
      const timer = setTimeout(() => {
        setShowHeart(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showHeartAnimation])

  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  }

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-30 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className="relative">
        <Image
          src="/cat-character.png"
          alt=""
          width={size === "small" ? 64 : size === "medium" ? 96 : 128}
          height={size === "small" ? 64 : size === "medium" ? 96 : 128}
          className={`${sizeClasses[size]} object-contain opacity-80 transition-opacity hover:opacity-100`}
          priority={false}
          unoptimized
        />
        {showHeart && (
          <div className="absolute -top-2 -right-2 animate-bounce">
            <Heart className="w-4 h-4 fill-primary text-primary animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}
