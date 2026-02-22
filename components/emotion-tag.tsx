"use client"

import {
  Cloud,
  Wind,
  Flame,
  BatteryLow,
  HeartCrack,
  Sparkles,
  Droplets,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Emotion } from "@/lib/data"

const iconMap: Record<string, React.ElementType> = {
  cloud: Cloud,
  wind: Wind,
  flame: Flame,
  "battery-low": BatteryLow,
  "heart-crack": HeartCrack,
  sparkles: Sparkles,
  droplets: Droplets,
  zap: Zap,
}

interface EmotionTagProps {
  label: Emotion
  icon: string
  isSelected?: boolean
  onClick?: () => void
  size?: "sm" | "md"
}

export function EmotionTag({
  label,
  icon,
  isSelected = false,
  onClick,
  size = "md",
}: EmotionTagProps) {
  const Icon = iconMap[icon] || Cloud

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-emotion-tag text-emotion-tag-foreground hover:border-primary/40 hover:bg-primary/10"
      )}
      aria-pressed={isSelected}
    >
      <Icon className={cn(size === "md" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      <span className="font-medium whitespace-nowrap" style={{ writingMode: "horizontal-tb" }}>{label}</span>
    </button>
  )
}

export function EmotionBadge({ mood }: { mood: Emotion }) {
  const emotionColors: Record<Emotion, string> = {
    외로움: "bg-blue-50 text-blue-600 border-blue-200",
    불안: "bg-amber-50 text-amber-600 border-amber-200",
    번아웃: "bg-orange-50 text-orange-600 border-orange-200",
    무기력: "bg-stone-100 text-stone-500 border-stone-200",
    이별: "bg-rose-50 text-rose-500 border-rose-200",
    "낮은 자존감": "bg-emerald-50 text-emerald-600 border-emerald-200",
    슬픔: "bg-sky-50 text-sky-600 border-sky-200",
    분노: "bg-red-50 text-red-500 border-red-200",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        emotionColors[mood]
      )}
      style={{ writingMode: "horizontal-tb" }}
    >
      {mood}
    </span>
  )
}
