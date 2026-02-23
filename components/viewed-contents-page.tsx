"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getUserViewedContents } from "@/lib/firebase/user-contents"
import { contents as sampleContents } from "@/src/data/sample"
import { ContentCard } from "@/components/content-card"
import type { Content } from "@/src/data/sample"

export function ViewedContentsPage() {
  const [viewedContents, setViewedContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        let user = getCurrentUser()
        if (!user) {
          user = await signInAnonymouslyUser()
        }

        if (!user) {
          throw new Error("로그인이 필요합니다.")
        }

        // 사용자가 읽은 콘텐츠 가져오기
        const views = await getUserViewedContents(user.uid)

        // content_id로 실제 콘텐츠 찾기
        const contents = views
          .map((view) => {
            // Firebase에서 가져온 콘텐츠 또는 샘플 데이터에서 찾기
            const content = sampleContents.find((c) => c.id === view.content_id)
            return content
          })
          .filter((c): c is Content => c !== undefined)

        setViewedContents(contents)
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "콘텐츠를 불러오는데 실패했습니다."
        console.error("콘텐츠 로드 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadContents()
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="내 공간으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">읽은 콘텐츠</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              총 {viewedContents.length}개
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : viewedContents.length > 0 ? (
        <div className="px-5 pt-4">
          <div className="flex flex-col gap-4">
            {viewedContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">아직 읽은 콘텐츠가 없어요</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            콘텐츠를 읽으면 여기에 기록됩니다.
          </p>
          <Link
            href="/contents"
            className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            콘텐츠 보러 가기
          </Link>
        </div>
      )}
    </div>
  )
}
