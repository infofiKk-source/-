"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { getTopEmpathyContents } from "@/lib/firebase/contents"
import { PopularContentCard } from "@/components/popular-content-card"
import type { Content } from "@/lib/firebase/contents"
import type { Emotion } from "@/lib/data"
import { contents as sampleContents } from "@/src/data/sample"

interface PopularContentsSectionProps {
  selectedEmotion?: Emotion | null
}

export function PopularContentsSection({ selectedEmotion }: PopularContentsSectionProps) {
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadContents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Firebase에서 공감받는 콘텐츠 가져오기
        const firebaseContents = await getTopEmpathyContents(
          selectedEmotion || undefined,
          5
        )

        // 샘플 데이터와 합치기 (Firebase 데이터가 부족한 경우)
        const allContents = [...firebaseContents]

        // 샘플 데이터도 공감 수 기준으로 정렬 (임시)
        const sampleWithEmpathy = sampleContents
          .filter((c) => !selectedEmotion || c.tags.includes(selectedEmotion))
          .map((c) => ({
            ...c,
            empathyCount: Math.floor(Math.random() * 100) + 10, // 임시 공감 수
          }))
          .sort((a, b) => (b.empathyCount || 0) - (a.empathyCount || 0))
          .slice(0, 5 - allContents.length)

        // Firebase 데이터와 샘플 데이터 합치기
        const combined = [...allContents, ...sampleWithEmpathy]
          .sort((a, b) => (b.empathyCount || 0) - (a.empathyCount || 0))
          .slice(0, 5)

        setContents(combined)
      } catch (err: any) {
        console.error("공감받는 콘텐츠 로드 실패:", err)
        // 에러 발생 시 샘플 데이터만 사용
        const sampleWithEmpathy = sampleContents
          .filter((c) => !selectedEmotion || c.tags.includes(selectedEmotion))
          .map((c) => ({
            ...c,
            empathyCount: Math.floor(Math.random() * 100) + 10,
          }))
          .sort((a, b) => (b.empathyCount || 0) - (a.empathyCount || 0))
          .slice(0, 5)
        setContents(sampleWithEmpathy)
        if (err?.code !== "failed-precondition") {
          setError("콘텐츠를 불러오는데 실패했습니다.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadContents()
  }, [selectedEmotion])

  if (isLoading) {
    return (
      <section className="px-6 pt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            지금 가장 공감받는 콘텐츠
          </h2>
        </div>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    )
  }

  if (contents.length === 0) {
    return null
  }

  return (
    <section className="px-6 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          지금 가장 공감받는 콘텐츠
        </h2>
        <Link
          href="/contents"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          더 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {contents
          .filter((c): c is Content & { id: string } => !!c.id)
          .map((content) => (
            <PopularContentCard key={content.id} content={content} />
          ))}
      </div>
    </section>
  )
}
