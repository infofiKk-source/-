"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Flag } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { CommunityPost } from "@/lib/data"

export function CommunityCard({ post }: { post: CommunityPost }) {
  const [reported, setReported] = useState(false)

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (reported) return
    
    const report = {
      id: `report-${Date.now()}`,
      postId: post.id,
      postAuthor: post.author,
      reason: "부적절한 내용",
      createdAt: new Date().toISOString(),
    }
    
    // sessionStorage에 신고 저장 (실제로는 DB에 저장)
    const reports = JSON.parse(sessionStorage.getItem("reports") || "[]")
    reports.push(report)
    sessionStorage.setItem("reports", JSON.stringify(reports))
    
    setReported(true)
    alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.")
  }

  return (
    <Link href={`/post/${post.id}`}>
      <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <EmotionBadge mood={post.mood} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{post.createdAt}</span>
            <button
              type="button"
              onClick={handleReport}
              disabled={reported}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="신고하기"
            >
              <Flag className={`h-3.5 w-3.5 ${reported ? "text-muted-foreground" : "text-foreground"}`} />
            </button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-card-foreground line-clamp-3">
          {post.summary}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">{post.author}</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              {post.empathyCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
