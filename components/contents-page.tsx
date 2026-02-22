"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import { contents } from "@/src/data/sample"
import type { Emotion } from "@/lib/data"
import type { Content } from "@/src/data/sample"
import { ContentCard } from "@/components/content-card"
import { EmotionTag } from "@/components/emotion-tag"
import { HelpNotice } from "@/components/help-notice"
import { useState, Suspense } from "react"

function ContentsInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null
  const [activeFilter, setActiveFilter] = useState<Emotion | null>(moodParam)

  const filteredContent = activeFilter
    ? contents.filter((c) => c.tags.includes(activeFilter))
    : contents

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="피드로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">
            {activeFilter ? `${activeFilter}을 위한 추천 콘텐츠` : "추천 콘텐츠"}
          </h1>
        </div>
      </header>

      {/* Emotion filter */}
      <section className="px-5 pt-5 pb-2" aria-label="감정 필터">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              !activeFilter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-emotion-tag text-emotion-tag-foreground hover:border-primary/40"
            }`}
          >
            전체
          </button>
          {emotions.map((e) => (
            <EmotionTag
              key={e.label}
              label={e.label}
              icon={e.icon}
              size="sm"
              isSelected={activeFilter === e.label}
              onClick={() =>
                setActiveFilter(activeFilter === e.label ? null : e.label)
              }
            />
          ))}
        </div>
      </section>

      {/* Recommended content */}
      <section className="px-5 pt-4" aria-label="추천 콘텐츠">
        {filteredContent.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredContent.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-full bg-warm-glow/20 p-4">
              <ArrowLeft className="h-6 w-6 text-primary/60 rotate-180" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeFilter ? `${activeFilter}을 위한 콘텐츠가 아직 없어요` : "추천 콘텐츠가 없어요"}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              곧 더 많은 콘텐츠를 준비할게요. 조금만 기다려주세요.
            </p>
          </div>
        )}
      </section>

      {/* Help notice */}
      <HelpNotice />
    </div>
  )
}

export function ContentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <ContentsInner />
    </Suspense>
  )
}
