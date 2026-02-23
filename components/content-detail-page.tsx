"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink, Heart } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Content } from "@/lib/firebase/contents"
import type { Content as SampleContent } from "@/src/data/sample"

interface ContentDetailPageProps {
  content: Content | SampleContent
}

export function ContentDetailPage({ content }: ContentDetailPageProps) {
  const primaryTag = content.tags?.[0]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="홈으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-semibold text-foreground">콘텐츠</h1>
        </div>
      </header>

      {/* Content */}
      <article className="px-5 pt-6">
        {/* 썸네일 */}
        {content.thumbnail && (
          <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* 제목 및 태그 */}
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-medium text-primary/70">{content.type}</span>
            {primaryTag && <EmotionBadge mood={primaryTag} />}
          </div>
          <h2 className="text-xl font-semibold leading-snug text-foreground">
            {content.title}
          </h2>
        </div>

        {/* 공감 수 */}
        {"empathyCount" in content && (
          <div className="mb-6 flex items-center gap-2">
            <Heart className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-primary">
              {content.empathyCount || 0}
            </span>
            <span className="text-sm text-muted-foreground">명이 공감했어요</span>
          </div>
        )}

        {/* 위로 문구 */}
        <div className="mb-6 rounded-2xl bg-warm-glow/40 p-5">
          <p className="font-serif text-base leading-relaxed text-primary italic">
            {`"${content.comfort_line}"`}
          </p>
        </div>

        {/* 추천 이유 */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">추천 이유</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{content.why}</p>
        </div>

        {/* 링크 */}
        <a
          href={content.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <span>콘텐츠 보러 가기</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </article>
    </div>
  )
}
