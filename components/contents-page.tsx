"use client"

import { useSearchParams } from "next/navigation"
import { ArrowLeft, Sparkles, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import { contents } from "@/src/data/sample"
import type { Emotion } from "@/lib/data"
import type { Content } from "@/src/data/sample"
import { ContentCard } from "@/components/content-card"
import { EmotionTag } from "@/components/emotion-tag"
import { HelpNotice } from "@/components/help-notice"
import { useState, useEffect, Suspense } from "react"
import { getRecentEmotions, calculateEmotionSimilarity } from "@/lib/utils/emotion-storage"
import { getAllContents, getTopEmpathyContents, getLatestContents, type Content as FirebaseContent } from "@/lib/firebase/contents"

type TabType = "ai" | "user"

function ContentsInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null
  const [activeTab, setActiveTab] = useState<TabType>("ai")
  const [activeFilter, setActiveFilter] = useState<Emotion | null>(moodParam)
  const [userSortBy, setUserSortBy] = useState<"popular" | "latest">("popular")
  const [aiContents, setAiContents] = useState<Content[]>([])
  const [userContents, setUserContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // AI 추천 콘텐츠 로드
  useEffect(() => {
    const loadAiContents = async () => {
      if (activeTab !== "ai") return

      setIsLoading(true)
      setError(null)

      try {
        // 최근 선택 감정 가져오기
        const recentEmotions = getRecentEmotions()
        
        // Firebase에서 모든 콘텐츠 가져오기
        const firebaseContents = await getAllContents()
        
        // 샘플 데이터와 합치기
        const allContents = [...firebaseContents, ...contents]

        // 감정 유사도 기반 점수 계산
        const scoredContents = allContents.map((content) => {
          let score = 0

          if (recentEmotions.length > 0) {
            // 최근 선택 감정과의 유사도 계산
            const similarity = calculateEmotionSimilarity(recentEmotions, content.tags)
            score += similarity * 100 // 유사도 점수
          }

          // 필터가 있으면 해당 감정이 포함된 콘텐츠에 가중치 추가
          if (activeFilter && content.tags.includes(activeFilter)) {
            score += 50
          }

          return { content, score }
        })

        // 점수 순으로 정렬
        scoredContents.sort((a, b) => b.score - a.score)

        // 상위 10개 선택
        const topContents = scoredContents
          .filter((item) => item.score > 0) // 점수가 0보다 큰 것만
          .slice(0, 10)
          .map((item) => item.content)

        setAiContents(topContents)
      } catch (err: any) {
        console.error("AI 추천 콘텐츠 로드 실패:", err)
        setError("AI 추천 콘텐츠를 불러오는데 실패했습니다.")
        // 에러 발생 시 샘플 데이터 사용
        const filtered = activeFilter
          ? contents.filter((c) => c.tags.includes(activeFilter))
          : contents
        setAiContents(filtered.slice(0, 10))
      } finally {
        setIsLoading(false)
      }
    }

    loadAiContents()
  }, [activeTab, activeFilter])

  // 사용자 추천 콘텐츠 로드
  useEffect(() => {
    const loadUserContents = async () => {
      if (activeTab !== "user") return

      setIsLoading(true)
      setError(null)

      try {
        let firebaseContents: FirebaseContent[] = []

        if (userSortBy === "popular") {
          firebaseContents = await getTopEmpathyContents(activeFilter || undefined, 10)
        } else {
          firebaseContents = await getLatestContents(activeFilter || undefined, 10)
        }

        // 샘플 데이터와 합치기
        const allContents = [...firebaseContents, ...contents]

        // 필터링
        const filtered = activeFilter
          ? allContents.filter((c) => c.tags.includes(activeFilter))
          : allContents

        // 정렬
        const sorted = filtered.sort((a, b) => {
          if (userSortBy === "popular") {
            return (b.empathyCount || 0) - (a.empathyCount || 0)
          } else {
            // 최신순 (샘플 데이터는 임의로 처리)
            return 0
          }
        })

        setUserContents(sorted.slice(0, 10))
      } catch (err: any) {
        console.error("사용자 추천 콘텐츠 로드 실패:", err)
        setError("사용자 추천 콘텐츠를 불러오는데 실패했습니다.")
        // 에러 발생 시 샘플 데이터 사용
        const filtered = activeFilter
          ? contents.filter((c) => c.tags.includes(activeFilter))
          : contents
        setUserContents(filtered.slice(0, 10))
      } finally {
        setIsLoading(false)
      }
    }

    loadUserContents()
  }, [activeTab, activeFilter, userSortBy])

  const displayContents = activeTab === "ai" ? aiContents : userContents

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
          <h1 className="text-lg font-semibold text-foreground">추천 콘텐츠</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border px-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "ai"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI 추천</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("user")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "user"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>사용자 추천</span>
          </button>
        </div>
      </div>

      {/* Sort options (사용자 추천만) */}
      {activeTab === "user" && (
        <section className="px-5 pt-4" aria-label="정렬 옵션">
          <div className="flex gap-2 rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setUserSortBy("popular")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                userSortBy === "popular"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-card-foreground hover:bg-muted"
              }`}
            >
              공감순
            </button>
            <button
              type="button"
              onClick={() => setUserSortBy("latest")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                userSortBy === "latest"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-card-foreground hover:bg-muted"
              }`}
            >
              최신순
            </button>
          </div>
        </section>
      )}

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
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : displayContents.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayContents.map((content) => (
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
