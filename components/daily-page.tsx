"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DailyComfortCard } from "@/components/daily-comfort-card"
import { Suspense } from "react"
import type { Emotion } from "@/lib/data"

function DailyInner() {
  const searchParams = useSearchParams()
  const moodParam = searchParams.get("mood") as Emotion | null

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
          <h1 className="text-lg font-semibold text-foreground">오늘의 위로</h1>
        </div>
      </header>

      {/* Comfort Card */}
      <section className="px-5 pt-6">
        <DailyComfortCard mood={moodParam} showShareButton={true} />
      </section>

      {/* Info */}
      <section className="px-5 pt-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            오늘의 위로 카드는 하루에 한 번씩 바뀝니다. 
            {moodParam && ` "${moodParam}"에 맞는 위로를 준비했어요.`}
          </p>
        </div>
      </section>
    </div>
  )
}

export function DailyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      }
    >
      <DailyInner />
    </Suspense>
  )
}
