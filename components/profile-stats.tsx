"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PenLine, BookOpen, Bookmark } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getUserPosts } from "@/lib/firebase/user-posts"
import { getUserViewedContents } from "@/lib/firebase/user-contents"
import { getSavedPosts, getSavedContents } from "@/lib/firebase/saved"
import { getReactionCount } from "@/lib/firebase/reactions"

export function ProfileStats() {
  const [postsCount, setPostsCount] = useState(0)
  const [reactionsCount, setReactionsCount] = useState(0)
  const [contentsCount, setContentsCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        let user = getCurrentUser()
        if (!user) {
          user = await signInAnonymouslyUser()
        }

        if (!user) return

        // 작성한 글 수 및 공감 수
        const posts = await getUserPosts(user.uid)
        setPostsCount(posts.length)

        let totalReactions = 0
        for (const post of posts) {
          const count = await getReactionCount(post.id || "")
          totalReactions += count
        }
        setReactionsCount(totalReactions)

        // 읽은 콘텐츠 수
        const views = await getUserViewedContents(user.uid)
        setContentsCount(views.length)

        // 저장한 항목 수
        const [savedPosts, savedContents] = await Promise.all([
          getSavedPosts(user.uid),
          getSavedContents(user.uid),
        ])
        setSavedCount(savedPosts.length + savedContents.length)
      } catch (error) {
        console.error("통계 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <section className="px-5 pt-6">
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/profile/my-posts"
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <PenLine className="h-5 w-5 text-primary" />
          {isLoading ? (
            <span className="text-lg font-bold text-card-foreground">-</span>
          ) : (
            <span className="text-lg font-bold text-card-foreground">{postsCount}</span>
          )}
          <span className="text-xs text-muted-foreground">작성한 글</span>
          {reactionsCount > 0 && (
            <span className="text-[10px] text-primary">공감 {reactionsCount}</span>
          )}
        </Link>
        <Link
          href="/profile/viewed-contents"
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          {isLoading ? (
            <span className="text-lg font-bold text-card-foreground">-</span>
          ) : (
            <span className="text-lg font-bold text-card-foreground">{contentsCount}</span>
          )}
          <span className="text-xs text-muted-foreground">읽은 콘텐츠</span>
        </Link>
        <Link
          href="/profile/saved"
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <Bookmark className="h-5 w-5 text-primary" />
          {isLoading ? (
            <span className="text-lg font-bold text-card-foreground">-</span>
          ) : (
            <span className="text-lg font-bold text-card-foreground">{savedCount}</span>
          )}
          <span className="text-xs text-muted-foreground">저장한 항목</span>
        </Link>
      </div>
    </section>
  )
}
