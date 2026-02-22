"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { mockContentCards, mockPosts, emotions } from "@/lib/data"
import type { Emotion, CommunityPost } from "@/lib/data"
import { ContentCard } from "@/components/content-card"
import { CommunityCard } from "@/components/community-card"
import { EmotionTag } from "@/components/emotion-tag"
import { useState, useEffect, Suspense } from "react"

function FeedInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null
  const messageParam = searchParams.get("message")
  const [activeFilter, setActiveFilter] = useState<Emotion | null>(moodParam)
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts)

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
    ? mockContentCards.filter((c) => c.emotion === activeFilter)
    : mockContentCards

  const filteredPosts = activeFilter
    ? posts.filter((p) => p.mood === activeFilter)
    : posts

  const displayContent =
    filteredContent.length > 0 ? filteredContent : mockContentCards
  const displayPosts =
    filteredPosts.length > 0 ? filteredPosts : posts

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
        <div className="flex flex-col gap-4">
          {displayContent.map((card) => (
            <ContentCard key={card.id} card={card} />
          ))}
        </div>
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
        <div className="flex flex-col gap-4">
          {displayPosts.map((post) => (
            <CommunityCard key={post.id} post={post} />
          ))}
        </div>
      </section>
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
