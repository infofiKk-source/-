"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { emotions } from "@/lib/data"
import type { Emotion } from "@/lib/data"
import { EmotionTag } from "@/components/emotion-tag"
import { HelpNotice } from "@/components/help-notice"
import { DailyComfortCard } from "@/components/daily-comfort-card"
import { PopularContentsSection } from "@/components/popular-contents-section"
import Link from "next/link"
import { getCurrentUser } from "@/lib/firebase/auth"

export function HomeHero() {
  const router = useRouter()
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    if (selectedEmotion) {
      const params = new URLSearchParams()
      params.set("mood", selectedEmotion)
      if (message) params.set("message", message)
      router.push(`/feed?${params.toString()}`)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header area */}
      <header className="px-6 pt-14 pb-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              오늘의 마음
            </p>
            <h1 className="font-serif text-2xl font-semibold leading-snug text-foreground">
              지금, 어떤 감정이
              <br />
              <span className="text-primary">마음을 채우고 있나요?</span>
            </h1>
          </div>
          {!getCurrentUser() && (
            <Link
              href="/auth"
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-muted"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      {/* Daily Comfort Card */}
      <section className="px-6 mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">오늘의 위로</p>
          <Link
            href="/daily"
            className="text-xs font-medium text-primary hover:underline"
          >
            더 보기
          </Link>
        </div>
        <DailyComfortCard mood={selectedEmotion} showShareButton={true} />
      </section>

      {/* Emotion selection */}
      <section className="px-6" aria-label="감정 선택">
        <div className="flex flex-wrap gap-2.5">
          {emotions.map((emotion) => (
            <EmotionTag
              key={emotion.label}
              label={emotion.label}
              icon={emotion.icon}
              isSelected={selectedEmotion === emotion.label}
              onClick={() => {
                const newSelected = selectedEmotion === emotion.label ? null : emotion.label
                setSelectedEmotion(newSelected)
              }}
            />
          ))}
        </div>
      </section>

      {/* Message input */}
      <section className="mt-8 px-6" aria-label="한 줄 입력">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="마음속 이야기를 한 줄로 적어보세요..."
            maxLength={100}
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-card p-4 pr-4 text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">
            {message.length}/100
          </span>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 px-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedEmotion}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>위로 받으러 가기</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      {/* Gentle encouragement */}
      <section className="mt-auto px-6 pt-10">
        <div className="rounded-2xl bg-warm-glow/40 p-5">
          <p className="font-serif text-sm leading-relaxed text-foreground/70 italic">
            {
              "\"감정을 느끼는 것은 약함이 아니에요. 당신의 마음이 살아있다는 증거입니다.\""
            }
          </p>
        </div>
      </section>

      {/* Popular Contents Section */}
      <PopularContentsSection selectedEmotion={selectedEmotion} />

      {/* Help notice */}
      <div className="px-6 pt-6">
        <HelpNotice />
      </div>
    </div>
  )
}
