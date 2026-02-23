"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Bookmark, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getSavedPosts, getSavedContents } from "@/lib/firebase/saved"
import { getPost } from "@/lib/firebase/posts"
import { contents as sampleContents } from "@/src/data/sample"
import { CommunityCard } from "@/components/community-card"
import { ContentCard } from "@/components/content-card"
import type { Post } from "@/src/data/sample"
import type { Content } from "@/src/data/sample"
import { Timestamp } from "firebase/firestore"

export function SavedPage() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [savedContents, setSavedContents] = useState<Content[]>([])
  const [activeTab, setActiveTab] = useState<"posts" | "contents">("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSaved = async () => {
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

        // 저장한 게시글 가져오기
        const savedPostsData = await getSavedPosts(user.uid)
        const posts: Post[] = []
        for (const saved of savedPostsData) {
          try {
            const post = await getPost(saved.post_id)
            if (post) {
              posts.push({
                id: post.id || "",
                mood_tags: post.mood_tags,
                body: post.body,
                link: post.link || undefined, // undefined가 아닌 경우만 포함
                created_at:
                  post.created_at instanceof Timestamp
                    ? formatTimestamp(post.created_at)
                    : typeof post.created_at === "string"
                    ? post.created_at
                    : "방금 전",
                reactions_count: post.reactions_count || 0,
                comments_count: post.comments_count || 0,
                authorId: post.user_id,
              })
            }
          } catch (err) {
            console.error(`게시글 ${saved.post_id} 로드 실패:`, err)
          }
        }
        setSavedPosts(posts)

        // 저장한 콘텐츠 가져오기
        const savedContentsData = await getSavedContents(user.uid)
        const contents = savedContentsData
          .map((saved) => {
            const content = sampleContents.find((c) => c.id === saved.content_id)
            return content
          })
          .filter((c): c is Content => c !== undefined)
        setSavedContents(contents)
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "저장한 항목을 불러오는데 실패했습니다."
        console.error("저장한 항목 로드 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadSaved()
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
          <h1 className="text-lg font-semibold text-foreground">저장한 항목</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border px-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            게시글 ({savedPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contents")}
            className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "contents"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            콘텐츠 ({savedContents.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">저장한 항목을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : activeTab === "posts" ? (
        savedPosts.length > 0 ? (
          <div className="px-5 pt-4">
            <div className="flex flex-col gap-4">
              {savedPosts.map((post) => (
                <CommunityCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Bookmark className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">저장한 게시글이 없어요</p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              게시글을 저장하면 여기에 표시됩니다.
            </p>
          </div>
        )
      ) : savedContents.length > 0 ? (
        <div className="px-5 pt-4">
          <div className="flex flex-col gap-4">
            {savedContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Bookmark className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">저장한 콘텐츠가 없어요</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            콘텐츠를 저장하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  )
}
