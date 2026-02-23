"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, PenLine, Heart, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getUserPosts } from "@/lib/firebase/user-posts"
import { getReactionCount } from "@/lib/firebase/reactions"
import { CommunityCard } from "@/components/community-card"
import type { Post } from "@/src/data/sample"
import { Timestamp } from "firebase/firestore"
import type { Post as FirebasePost } from "@/lib/firebase/posts"

export function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalReactions, setTotalReactions] = useState(0)

  useEffect(() => {
    const loadPosts = async () => {
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

        // 사용자가 작성한 글 가져오기
        const firebasePosts = await getUserPosts(user.uid)

        // 공감 수 집계
        let total = 0
        const convertedPosts: Post[] = await Promise.all(
          firebasePosts.map(async (p: FirebasePost) => {
            const reactionCount = await getReactionCount(p.id || "")
            total += reactionCount
            return {
              id: p.id || "",
              mood_tags: p.mood_tags,
              body: p.body,
              link: p.link || undefined, // undefined가 아닌 경우만 포함
              created_at:
                p.created_at instanceof Timestamp
                  ? formatTimestamp(p.created_at)
                  : typeof p.created_at === "string"
                  ? p.created_at
                  : "방금 전",
              reactions_count: reactionCount,
              comments_count: p.comments_count || 0,
              authorId: p.user_id,
            }
          })
        )

        setPosts(convertedPosts)
        setTotalReactions(total)
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "글을 불러오는데 실패했습니다."
        console.error("글 로드 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

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
            <h1 className="text-lg font-semibold text-foreground">작성한 글</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              총 {posts.length}개 · 받은 공감 {totalReactions}개
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">글을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : posts.length > 0 ? (
        <div className="px-5 pt-4">
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <CommunityCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <PenLine className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">아직 작성한 글이 없어요</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            첫 번째 글을 작성해보세요. 당신의 마음이 누군가에게 위로가 될 거예요.
          </p>
          <Link
            href="/post/new"
            className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            글 작성하기
          </Link>
        </div>
      )}
    </div>
  )
}
