"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import { sampleContentCards, samplePosts } from "@/src/data/sample"
import type { Emotion, CommunityPost } from "@/lib/data"
import { ContentCard } from "@/components/content-card"
import { CommunityCard } from "@/components/community-card"
import { EmotionTag } from "@/components/emotion-tag"
import { HelpNotice } from "@/components/help-notice"
import { useState, useEffect, Suspense } from "react"

function FeedInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null
  const messageParam = searchParams.get("message")
  const [activeFilter, setActiveFilter] = useState<Emotion | null>(moodParam)
  const [posts, setPosts] = useState<CommunityPost[]>(samplePosts)

  // sessionStorage에서 새로 작성한 글 확인
  useEffect(() => {
    const newPostData = sessionStorage.getItem("newPost")
    if (newPostData) {
      try {
        const newPost: CommunityPost = JSON.parse(newPostData)
        setPosts((prev) => [newPost, ...prev])
        sessionStorage.removeItem("newPost")
      } catch (e) {
        console.error("Failed to parse new post data", e)
      }
    }
  }, [])

  const filteredContent = activeFilter
    ? sampleContentCards.filter((c) => c.emotion === activeFilter)
    : sampleContentCards

  const filteredPosts = activeFilter
    ? posts.filter((p) => p.mood === activeFilter)
    : posts

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
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {activeFilter ? `${activeFilter}의 위로` : "오늘의 위로"}
            </h1>
            {messageParam && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {`"${messageParam}"`}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Emotion filter */}
      <section className="px-5 pt-5 pb-2" aria-label="감정 필터">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
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
        <h2 className="mb-4 text-base font-semibold text-foreground">
          {activeFilter
            ? `${activeFilter}을 위한 추천 콘텐츠`
            : "당신을 위한 추천 콘텐츠"}
        </h2>
        {filteredContent.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredContent.map((card) => (
              <ContentCard key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-full bg-muted p-4">
              <ArrowLeft className="h-6 w-6 text-muted-foreground rotate-180" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeFilter ? `${activeFilter}을 위한 콘텐츠가 아직 없어요` : "추천 콘텐츠가 없어요"}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              곧 더 많은 콘텐츠를 준비할게요
            </p>
          </div>
        )}
      </section>

      {/* Community posts */}
      <section className="px-5 pt-8 pb-6" aria-label="비슷한 마음을 가진 사람들">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            비슷한 마음의 이야기
          </h2>
          <Link
            href="/post/new"
            className="text-xs font-medium text-primary hover:underline"
          >
            나도 적어보기
          </Link>
        </div>
        {filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <CommunityCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-full bg-muted p-4">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeFilter ? `${activeFilter}에 대한 이야기가 아직 없어요` : "아직 이야기가 없어요"}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              첫 번째 이야기를 남겨보세요
            </p>
            <Link
              href="/post/new"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              이야기 작성하기
            </Link>
          </div>
        )}
      </section>

      {/* Help notice */}
      <HelpNotice />
    </div>
  )
}

export function FeedContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <FeedInner />
    </Suspense>
  )
}
