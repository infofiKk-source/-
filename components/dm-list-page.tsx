"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getConversations, type Conversation } from "@/lib/firebase/conversations"
import { onSnapshot, query, collection, where } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Timestamp } from "firebase/firestore"

export function DMListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // 익명 로그인
        let user = getCurrentUser()
        if (!user) {
          user = await signInAnonymouslyUser()
        }

        if (!user) {
          throw new Error("로그인에 실패했습니다.")
        }

        // 초기 로드
        const initialConversations = await getConversations(user.uid)
        setConversations(initialConversations)

        // 실시간 구독
        const q = query(
          collection(db, "conversations"),
          where("memberIds", "array-contains", user.uid)
        )

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const updatedConversations: Conversation[] = []
            snapshot.forEach((doc) => {
              updatedConversations.push({
                id: doc.id,
                ...doc.data(),
              } as Conversation)
            })

            // 최신 메시지 순으로 정렬
            updatedConversations.sort((a, b) => {
              const aTime = a.lastMessageAt instanceof Timestamp 
                ? a.lastMessageAt.toMillis() 
                : a.updated_at instanceof Timestamp 
                ? a.updated_at.toMillis() 
                : 0
              const bTime = b.lastMessageAt instanceof Timestamp 
                ? b.lastMessageAt.toMillis() 
                : b.updated_at instanceof Timestamp 
                ? b.updated_at.toMillis() 
                : 0
              return bTime - aTime
            })

            setConversations(updatedConversations)
            setIsLoading(false)
          },
          (err) => {
            console.error("대화방 구독 실패:", err)
            setError("대화방을 불러오는데 실패했습니다.")
            setIsLoading(false)
          }
        )

        return () => unsubscribe()
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "대화방을 불러오는데 실패했습니다."
        console.error("대화방 로드 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  const formatTime = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return ""
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    const now = new Date()
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
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="피드로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">메시지</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">대화방을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : conversations.length > 0 ? (
        <div className="flex flex-col">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dm/${conversation.id}`}
              className="flex items-center gap-4 border-b border-border bg-card px-5 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  익명 대화
                </p>
                {conversation.lastMessage && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {conversation.lastMessage}
                  </p>
                )}
              </div>
              {conversation.lastMessageAt && (
                <p className="text-xs text-muted-foreground shrink-0">
                  {formatTime(conversation.lastMessageAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <MessageCircle className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">아직 대화가 없어요</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            게시글에서 "익명으로 DM 보내기"를 눌러 대화를 시작해보세요.
          </p>
        </div>
      )}
    </div>
  )
}
