"use client"

import Link from "next/link"
import { Heart, ExternalLink } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Content } from "@/lib/firebase/contents"
import type { Emotion } from "@/lib/data"

interface PopularContentCardProps {
  content: Content & { id: string }
}

export function PopularContentCard({ content }: PopularContentCardProps) {
  const primaryTag = content.tags?.[0] as Emotion | undefined

  return (
    <Link href={`/contents/${content.id}`} className="block">
      <article className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        {/* 썸네일 */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          {content.thumbnail ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ExternalLink className="h-6 w-6 text-primary/40" />
            </div>
          )}
        </div>

        {/* 콘텐츠 정보 */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-primary/70">{content.type}</span>
                {primaryTag && <EmotionBadge mood={primaryTag} />}
              </div>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground group-hover:text-primary">
                {content.title}
              </h3>
            </div>
          </div>

          {/* 공감 수 */}
          <div className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-xs font-medium text-primary">
              {content.empathyCount || 0}
            </span>
            <span className="text-xs text-muted-foreground">공감</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
