"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Link as LinkIcon, Loader2 } from "lucide-react"

interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  url?: string
  siteName?: string
  platform?: string
  originalUrl?: string
  error?: string
}

interface LinkPreviewCardProps {
  url: string
  className?: string
}

export function LinkPreviewCard({ url, className = "" }: LinkPreviewCardProps) {
  const [ogData, setOgData] = useState<OpenGraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOGData = async () => {
      if (!url) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
          setOgData(null)
        } else {
          setOgData(data)
        }
      } catch (err: any) {
        console.error("OpenGraph 데이터 가져오기 실패:", err)
        setError("링크 정보를 불러올 수 없습니다.")
        setOgData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOGData()
  }, [url])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div
        className={`group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:bg-muted ${className}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">링크 정보 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 또는 메타데이터 없음 - 기본 카드 UI
  if (error || !ogData || (!ogData.title && !ogData.description)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all hover:bg-primary/10 hover:border-primary/40 ${className}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <LinkIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary/70">관련 링크</p>
          <p className="mt-0.5 line-clamp-1 text-sm text-foreground">{url}</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-primary/70" />
      </a>
    )
  }

  // OpenGraph 데이터 있음 - 향상된 카드 UI
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`group flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-md hover:-translate-y-0.5 ${className}`}
    >
      {/* 썸네일 */}
      {ogData.image ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={ogData.image}
            alt={ogData.title || "링크 미리보기"}
            className="h-full w-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 숨김
              e.currentTarget.style.display = "none"
            }}
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
          <LinkIcon className="h-6 w-6 text-primary/60" />
        </div>
      )}

      {/* 콘텐츠 정보 */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        {/* 플랫폼/사이트명 */}
        {(ogData.platform || ogData.siteName) && (
          <p className="text-xs font-medium text-primary/70">
            {ogData.platform || ogData.siteName}
          </p>
        )}

        {/* 제목 */}
        {ogData.title && (
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground group-hover:text-primary">
            {ogData.title}
          </h4>
        )}

        {/* 설명 */}
        {ogData.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {ogData.description}
          </p>
        )}
      </div>

      {/* 외부 링크 아이콘 */}
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </a>
  )
}
