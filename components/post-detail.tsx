"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Send, Share2, Flag } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Comment } from "@/lib/data"
import { mockComments } from "@/lib/data"
import type { Post } from "@/src/data/sample"
import { containsBlockedWords } from "@/lib/utils"
import { HelpNotice } from "@/components/help-notice"

interface PostDetailProps {
  post: Post
}

export function PostDetail({ post }: PostDetailProps) {
  const [empathized, setEmpathized] = useState(false)
  const [empathyCount, setEmpathyCount] = useState(post.reactions_count)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [hasBlockedWords, setHasBlockedWords] = useState(false)
  const [reported, setReported] = useState(false)

  const handleEmpathy = () => {
    if (empathized) {
      setEmpathyCount((c) => c - 1)
    } else {
      setEmpathyCount((c) => c + 1)
    }
    setEmpathized(!empathized)
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = e.target.value
    setNewComment(newComment)
    setHasBlockedWords(containsBlockedWords(newComment))
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    if (hasBlockedWords) {
      alert("부적절한 단어가 포함되어 있습니다. 다시 작성해주세요.")
      return
    }
    const comment: Comment = {
      id: `cm-${Date.now()}`,
      author: "나",
      content: newComment.trim(),
      createdAt: "방금 전",
    }
    setComments([comment, ...comments])
    setNewComment("")
    setHasBlockedWords(false)
  }

  const handleReport = () => {
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
    <div className="flex min-h-[100dvh] flex-col bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="피드로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-semibold text-foreground">
            이야기
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleReport()
              }}
              disabled={reported}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="신고하기"
            >
              <Flag className={`h-4.5 w-4.5 ${reported ? "text-muted-foreground" : "text-foreground"}`} />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="공유하기"
            >
              <Share2 className="h-4.5 w-4.5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Post content */}
      <article className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-semibold text-primary">
              익
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">익명</p>
            <p className="text-xs text-muted-foreground">{post.created_at}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {post.mood_tags.map((mood) => (
            <EmotionBadge key={mood} mood={mood} />
          ))}
        </div>

        <p className="mt-4 text-sm leading-7 text-foreground">
          {post.body}
        </p>

        {/* Empathy bar */}
        <div className="mt-6 flex items-center gap-4 border-y border-border py-3">
          <button
            type="button"
            onClick={handleEmpathy}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              empathized
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            aria-pressed={empathized}
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                empathized ? "fill-primary text-primary scale-110" : ""
              }`}
            />
            <span>{empathized ? "공감했어요" : "공감하기"}</span>
            <span className="ml-1 text-xs opacity-70">{empathyCount}</span>
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count + comments.length}</span>
          </span>
        </div>
      </article>

      {/* Comments */}
      <section className="px-5 pt-5" aria-label="댓글">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          따뜻한 한마디
        </h2>
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/30">
                    <span className="text-xs font-medium text-accent-foreground">
                      {comment.author[0]}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-card-foreground">
                    {comment.author}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {comment.createdAt}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-card-foreground">
                {comment.content}
              </p>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10">
            <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              아직 댓글이 없어요. 첫 번째 위로를 남겨보세요.
            </p>
          </div>
        )}
      </section>

      {/* Help notice */}
      <div className="px-5 pt-6 pb-32">
        <HelpNotice />
      </div>

      {/* Comment input - fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-3">
          <input
            type="text"
            value={newComment}
            onChange={handleCommentChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleAddComment()
              }
            }}
            placeholder="따뜻한 한마디를 남겨주세요..."
            className={`flex-1 rounded-full border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
              hasBlockedWords
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary/50 focus:ring-primary/20"
            }`}
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!newComment.trim() || hasBlockedWords}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all disabled:opacity-40"
            aria-label="댓글 보내기"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}
