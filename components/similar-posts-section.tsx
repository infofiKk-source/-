"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Loader2 } from "lucide-react"
import { getSimilarPosts } from "@/lib/firebase/similar-posts"
import { CommunityCard } from "@/components/community-card"
import type { Post } from "@/src/data/sample"
import type { Emotion } from "@/lib/data"
import { Timestamp } from "firebase/firestore"

type PostWithAuthor = Post & { authorId?: string }

interface SimilarPostsSectionProps {
  currentPost: {
    id: string
    mood_tags: Emotion[]
    body: string
  }
}

export function SimilarPostsSection({ currentPost }: SimilarPostsSectionProps) {
  const [similarPosts, setSimilarPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSimilarPosts = async () => {
      setIsLoading(true)
      try {
        const posts = await getSimilarPosts(currentPost, 0.8, 5)

        // Post 형식으로 변환
        const convertedPosts: PostWithAuthor[] = posts.map((p) => ({
          id: p.id || "",
          mood_tags: p.mood_tags,
          body: p.body,
          link: p.link,
          created_at:
            p.created_at instanceof Timestamp
              ? formatTimestamp(p.created_at)
              : typeof p.created_at === "string"
              ? p.created_at
              : "방금 전",
          reactions_count: p.reactions_count || 0,
          comments_count: p.comments_count || 0,
          authorId: (p as any).user_id,
        }))

        setSimilarPosts(convertedPosts)
      } catch (error) {
        console.error("유사 게시글 로드 실패:", error)
        setSimilarPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSimilarPosts()
  }, [currentPost.id, currentPost.body])

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

  if (isLoading) {
    return (
      <section className="px-5 pt-6" aria-label="비슷한 이야기">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">비슷한 이야기</h2>
        </div>
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    )
  }

  if (similarPosts.length === 0) {
    return null
  }

  return (
    <section className="px-5 pt-6" aria-label="비슷한 이야기">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">비슷한 이야기</h2>
        <span className="text-xs text-muted-foreground">({similarPosts.length})</span>
      </div>
      <div className="flex flex-col gap-4">
        {similarPosts.map((post) => (
          <CommunityCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
