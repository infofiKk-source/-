"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Flag } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Post } from "@/src/data/sample"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { addReaction, getReaction } from "@/lib/firebase/reactions"

export function CommunityCard({ post }: { post: Post }) {
  const [reported, setReported] = useState(false)
  const [empathized, setEmpathized] = useState(false)
  const [reactionCount, setReactionCount] = useState(post.reactions_count || 0)
  const [isReacting, setIsReacting] = useState(false)

  // 공감 상태 확인
  useEffect(() => {
    const checkReaction = async () => {
      if (!post.id) return
      try {
        const user = getCurrentUser()
        if (user) {
          const reaction = await getReaction(post.id, user.uid)
          setEmpathized(!!reaction)
        }
      } catch (error) {
        // 에러 무시 (로그인 안 된 상태일 수 있음)
      }
    }
    checkReaction()
  }, [post.id])

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (reported) return
    
    const report = {
      id: `report-${Date.now()}`,
      postId: post.id,
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

  const handleEmpathy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!post.id || empathized || isReacting) return

    setIsReacting(true)
    try {
      let user = getCurrentUser()
      if (!user) {
        user = await signInAnonymouslyUser()
      }

      if (!user) {
        alert("로그인이 필요합니다.")
        setIsReacting(false)
        return
      }

      await addReaction(post.id, user.uid)
      setEmpathized(true)
      setReactionCount((c) => c + 1)
    } catch (error: any) {
      if (error.message === "이미 공감했습니다.") {
        setEmpathized(true)
      } else {
        console.error("공감 추가 실패:", error)
      }
    } finally {
      setIsReacting(false)
    }
  }

  const summary = post.body.length > 100 ? post.body.substring(0, 100) + "..." : post.body

  return (
    <Link href={`/post/${post.id}`}>
      <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          {post.mood_tags.length > 0 && (
            <EmotionBadge mood={post.mood_tags[0]} />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{post.created_at}</span>
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
          {summary}
        </p>

        {/* Link indicator */}
        {post.link && (
          <div className="flex items-center gap-1.5 text-xs text-primary/70">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>링크 있음</span>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">익명</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleEmpathy}
              disabled={empathized || isReacting}
              className={`inline-flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
                empathized
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 transition-all ${
                  empathized ? "fill-primary text-primary" : ""
                }`}
              />
              {reactionCount}
            </button>
            <Link
              href={`/post/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comments_count}
            </Link>
          </div>
        </div>
      </article>
    </Link>
  )
}
