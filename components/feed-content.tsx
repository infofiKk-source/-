"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import { contents, posts as samplePosts } from "@/src/data/sample"
import type { Emotion } from "@/lib/data"
import type { Content, Post } from "@/src/data/sample"
import { ContentCard } from "@/components/content-card"
import { CommunityCard } from "@/components/community-card"
import { EmotionTag } from "@/components/emotion-tag"
import { HelpNotice } from "@/components/help-notice"
import { useState, useEffect, Suspense } from "react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getPosts, type Post as FirebasePost } from "@/lib/firebase/posts"
import { Timestamp } from "firebase/firestore"

function FeedInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null
  const messageParam = searchParams.get("message")
  const [activeFilter, setActiveFilter] = useState<Emotion | null>(moodParam)
  const [displayPosts, setDisplayPosts] = useState<Post[]>(samplePosts)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Firebase에서 글 가져오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // 익명 로그인
        let user = getCurrentUser()
        if (!user) {
          try {
            user = await signInAnonymouslyUser()
            setAuthError(null)
          } catch (authErr: any) {
            const errorMessage = authErr?.message || authErr?.code || "인증에 실패했습니다."
            console.error("익명 로그인 실패:", {
              code: authErr?.code,
              message: authErr?.message,
              fullError: authErr,
            })
            setAuthError(`인증 오류: ${errorMessage}`)
            // 실패 시 샘플 데이터만 사용
            const filtered = activeFilter
              ? samplePosts.filter((p) => p.mood_tags.includes(activeFilter))
              : samplePosts
            setDisplayPosts(filtered.slice(0, 5))
            setIsLoading(false)
            return
          }
        }

        // Firebase에서 글 가져오기
        const firebasePosts = await getPosts(activeFilter || undefined, 5)
        
        // Firebase Post를 Post 형식으로 변환
        const convertedPosts: Post[] = firebasePosts.map((p: FirebasePost) => ({
          id: p.id || "",
          mood_tags: p.mood_tags,
          body: p.body,
          created_at: p.created_at instanceof Timestamp
            ? formatTimestamp(p.created_at)
            : typeof p.created_at === "string"
            ? p.created_at
            : "방금 전",
          reactions_count: p.reactions_count || 0,
          comments_count: p.comments_count || 0,
        }))

        // 샘플 데이터와 Firebase 데이터 합치기
        const allPosts = [...convertedPosts, ...samplePosts]
        
        // 필터링
        const filtered = activeFilter
          ? allPosts.filter((p) => p.mood_tags.includes(activeFilter))
          : allPosts

        setDisplayPosts(filtered.slice(0, 5))
        setAuthError(null)
      } catch (error: any) {
        const errorMessage = error?.message || error?.code || "데이터를 불러오는데 실패했습니다."
        console.error("글 로드 실패:", {
          code: error?.code,
          message: error?.message,
          fullError: error,
        })
        setAuthError(`데이터 로드 실패: ${errorMessage}`)
        // 실패 시 샘플 데이터만 사용
        const filtered = activeFilter
          ? samplePosts.filter((p) => p.mood_tags.includes(activeFilter))
          : samplePosts
        setDisplayPosts(filtered.slice(0, 5))
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [activeFilter])

  // Timestamp를 읽기 쉬운 형식으로 변환
  const formatTimestamp = (timestamp: Timestamp): string => {
    const now = new Date()
    const date = timestamp.toDate()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    return date.toLocaleDateString("ko-KR")
  }

  const filteredContent = activeFilter
    ? contents.filter((c) => c.tags.includes(activeFilter)).slice(0, 5)
    : contents.slice(0, 5)

  const filteredPosts = displayPosts

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
        <h2 className="mb-4 text-base font-semibold text-foreground">
          {activeFilter
            ? `${activeFilter}을 위한 추천 콘텐츠`
            : "당신을 위한 추천 콘텐츠"}
        </h2>
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredContent.length > 0 ? (
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
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <CommunityCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="rounded-full bg-warm-glow/20 p-4">
              <MessageCircle className="h-6 w-6 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeFilter ? `${activeFilter}에 대한 이야기가 아직 없어요` : "아직 이야기가 없어요"}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs mb-4">
              첫 번째 이야기를 남겨보세요. 당신의 마음이 누군가에게 위로가 될 거예요.
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

      {/* Error message */}
      {authError && (
        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              {authError}
            </p>
            <p className="mt-2 text-xs text-destructive/70">
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요. 샘플 데이터를 표시하고 있습니다.
            </p>
          </div>
        </section>
      )}

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
