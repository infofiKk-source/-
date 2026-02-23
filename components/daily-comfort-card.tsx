"use client"

import { useState, useEffect } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { comfortTemplates, type ComfortTemplate } from "@/src/data/comfortTemplates"
import type { Emotion } from "@/lib/data"

interface DailyComfortCardProps {
  mood?: Emotion | null
  showShareButton?: boolean
}

export function DailyComfortCard({ mood, showShareButton = true }: DailyComfortCardProps) {
  const [template, setTemplate] = useState<ComfortTemplate | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 오늘 날짜 기준으로 로컬스토리지에서 확인
    const today = new Date().toDateString()
    const cacheKey = `daily-comfort-${today}${mood ? `-${mood}` : ""}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      // 캐시된 템플릿이 있으면 사용
      try {
        const parsed = JSON.parse(cached)
        setTemplate(parsed)
        return
      } catch (error) {
        console.error("캐시 파싱 실패:", error)
      }
    }

    // 템플릿 선택 로직
    let availableTemplates: ComfortTemplate[]

    if (mood) {
      // 특정 감정에 맞는 템플릿 + 전체 템플릿
      availableTemplates = comfortTemplates.filter(
        (t) => !t.mood || t.mood === mood
      )
    } else {
      // 전체 템플릿
      availableTemplates = comfortTemplates
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * availableTemplates.length)
    const selectedTemplate = availableTemplates[randomIndex]

    // 로컬스토리지에 저장
    localStorage.setItem(cacheKey, JSON.stringify(selectedTemplate))
    setTemplate(selectedTemplate)
  }, [mood])

  const handleShare = async () => {
    if (!template) return

    const shareText = `${template.emoji} ${template.message}\n\n${template.action}`

    try {
      // 클립보드에 복사
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("복사 실패:", error)
      // 폴백: 텍스트 영역 생성 후 복사
      const textArea = document.createElement("textarea")
      textArea.value = shareText
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("복사 실패:", err)
      }
      document.body.removeChild(textArea)
    }
  }

  if (!template) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${template.gradient} p-6 shadow-sm`}
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-4xl">{template.emoji}</div>
          {showShareButton && (
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
              aria-label="공유하기"
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Share2 className="h-4 w-4 text-foreground" />
              )}
            </button>
          )}
        </div>

        <p className="mb-4 text-base leading-relaxed text-foreground font-medium">
          {template.message}
        </p>

        <div className="rounded-xl bg-background/60 backdrop-blur-sm p-3">
          <p className="text-sm text-muted-foreground mb-1">오늘의 제안</p>
          <p className="text-sm font-medium text-foreground">{template.action}</p>
        </div>
      </div>
    </div>
  )
}
