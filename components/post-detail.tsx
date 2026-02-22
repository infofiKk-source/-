"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Send, Share2, Flag } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Comment } from "@/lib/data"
import type { Post } from "@/src/data/sample"
import { containsBlockedWords } from "@/lib/utils"
import { HelpNotice } from "@/components/help-notice"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { createComment, getComments, type Comment as FirebaseComment } from "@/lib/firebase/comments"
import { addReaction, getReaction } from "@/lib/firebase/reactions"
import { Timestamp } from "firebase/firestore"

interface PostDetailProps {
  post: Post
}

export function PostDetail({ post }: PostDetailProps) {
  const [empathized, setEmpathized] = useState(false)
  const [empathyCount, setEmpathyCount] = useState(post.reactions_count || 0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [hasBlockedWords, setHasBlockedWords] = useState(false)
  const [reported, setReported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 익명 로그인 및 데이터 로드
  useEffect(() => {
    const init = async () => {
      try {
        // 익명 로그인
        let user = getCurrentUser()
        if (!user) {
          try {
            user = await signInAnonymouslyUser()
            setAuthError(null)
          } catch (authErr: any) {
            const errorMessage = authErr?.message || authErr?.code || "인증에 실패했습니다."
            console.error("익명 로그인 실패:", {
              code: authErr?.code,
              message: authErr?.message,
              fullError: authErr,
            })
            setAuthError(`인증 오류: ${errorMessage}`)
            return
          }
        }

        if (!user || !post.id) return

        // 공감 상태 확인
        const reaction = await getReaction(post.id, user.uid)
        setEmpathized(!!reaction)

        // 댓글 목록 가져오기
        const firebaseComments = await getComments(post.id)
        const convertedComments: Comment[] = firebaseComments.map((c) => ({
          id: c.id || "",
          author: "익명",
          content: c.body,
          createdAt: c.created_at instanceof Timestamp
            ? formatTimestamp(c.created_at)
            : "방금 전",
        }))
        setComments(convertedComments)
      } catch (error: any) {
        const errorMessage = error?.message || error?.code || "데이터를 불러오는데 실패했습니다."
        console.error("초기화 실패:", {
          code: error?.code,
          message: error?.message,
          fullError: error,
        })
        if (!authError) {
          setAuthError(`오류: ${errorMessage}`)
        }
      }
    }
    init()
  }, [post.id, authError])

  // Timestamp를 읽기 쉬운 형식으로 변환
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

  const handleEmpathy = async () => {
    if (!post.id) return

    let user = getCurrentUser()
    if (!user) {
      try {
        user = await signInAnonymouslyUser()
        setAuthError(null)
      } catch (authErr: any) {
        const errorMessage = authErr?.message || authErr?.code || "인증에 실패했습니다."
        console.error("익명 로그인 실패:", {
          code: authErr?.code,
          message: authErr?.message,
          fullError: authErr,
        })
        setAuthError(`인증 오류: ${errorMessage}`)
        return
      }
    }

    if (!user) {
      setAuthError("로그인에 실패했습니다.")
      return
    }

    if (empathized) {
      // 공감 취소는 나중에 구현 (현재는 공감만 가능)
      return
    }

    setIsLoading(true)
    try {
      await addReaction(post.id, user.uid)
      setEmpathized(true)
      setEmpathyCount((c) => c + 1)
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || "공감 추가에 실패했습니다."
      console.error("공감 추가 실패:", {
        code: error?.code,
        message: error?.message,
        fullError: error,
      })
      if (error.message === "이미 공감했습니다.") {
        setEmpathized(true)
      } else {
        setAuthError(`공감 실패: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = e.target.value
    setNewComment(newComment)
    setHasBlockedWords(containsBlockedWords(newComment))
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !post.id) return
    if (hasBlockedWords) {
      alert("부적절한 단어가 포함되어 있습니다. 다시 작성해주세요.")
      return
    }

    let user = getCurrentUser()
    if (!user) {
      try {
        user = await signInAnonymouslyUser()
        setAuthError(null)
      } catch (authErr: any) {
        const errorMessage = authErr?.message || authErr?.code || "인증에 실패했습니다."
        console.error("익명 로그인 실패:", {
          code: authErr?.code,
          message: authErr?.message,
          fullError: authErr,
        })
        setAuthError(`인증 오류: ${errorMessage}`)
        return
      }
    }

    if (!user) {
      setAuthError("로그인에 실패했습니다.")
      return
    }

    setIsCommentLoading(true)
    try {
      await createComment({
        post_id: post.id,
        body: newComment.trim(),
        user_id: user.uid,
      })

      // 댓글 목록 새로고침
      const firebaseComments = await getComments(post.id)
      const convertedComments: Comment[] = firebaseComments.map((c) => ({
        id: c.id || "",
        author: "익명",
        content: c.body,
        createdAt: c.created_at instanceof Timestamp
          ? formatTimestamp(c.created_at)
          : "방금 전",
      }))
      setComments(convertedComments)
      setNewComment("")
      setHasBlockedWords(false)
      setAuthError(null)
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || "댓글 작성에 실패했습니다."
      console.error("댓글 작성 실패:", {
        code: error?.code,
        message: error?.message,
        fullError: error,
      })
      setAuthError(`댓글 작성 실패: ${errorMessage}`)
    } finally {
      setIsCommentLoading(false)
    }
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
            disabled={isLoading || empathized}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
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
            <span>{empathized ? "공감했어요" : isLoading ? "처리 중..." : "공감하기"}</span>
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

      {/* Error message */}
      {authError && (
        <section className="px-5 pt-4">
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              {authError}
            </p>
            <p className="mt-2 text-xs text-destructive/70">
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
        </section>
      )}

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
            disabled={!newComment.trim() || hasBlockedWords || isCommentLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all disabled:opacity-40"
            aria-label="댓글 보내기"
          >
            {isCommentLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}
