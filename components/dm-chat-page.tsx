"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Flag, Loader2 } from "lucide-react"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { getConversation } from "@/lib/firebase/conversations"
import { sendMessage, subscribeMessages, type Message } from "@/lib/firebase/messages"
import { isEitherBlocked } from "@/lib/firebase/blocks"
import { createReport } from "@/lib/firebase/reports"
import { Timestamp } from "firebase/firestore"

interface DMChatPageProps {
  params: Promise<{ conversationId: string }>
}

export function DMChatPage({ params }: DMChatPageProps) {
  const [conversationId, setConversationId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [reported, setReported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const resolvedParams = await params
        const id = resolvedParams.conversationId
        setConversationId(id)

        // 익명 로그인
        let user = getCurrentUser()
        if (!user) {
          user = await signInAnonymouslyUser()
        }

        if (!user) {
          throw new Error("로그인에 실패했습니다.")
        }

        // 대화방 정보 가져오기
        const conversation = await getConversation(id)
        if (!conversation) {
          throw new Error("대화방을 찾을 수 없습니다.")
        }

        // 차단 확인
        const otherUserId = conversation.memberIds.find((uid) => uid !== user.uid)
        if (otherUserId) {
          const blocked = await isEitherBlocked(user.uid, otherUserId)
          setIsBlocked(blocked)
        }

        // 메시지 실시간 구독
        const unsubscribe = subscribeMessages(id, (msgs) => {
          setMessages(msgs)
          setIsLoading(false)
        })

        return () => unsubscribe()
      } catch (err: any) {
        const errorMessage = err?.message || err?.code || "대화방을 불러오는데 실패했습니다."
        console.error("대화방 초기화 실패:", {
          code: err?.code,
          message: err?.message,
          fullError: err,
        })
        setError(`오류: ${errorMessage}`)
        setIsLoading(false)
      }
    }

    init()
  }, [params])

  // 메시지 목록이 업데이트되면 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || isSending || isBlocked) return

    setIsSending(true)
    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error("로그인이 필요합니다.")
      }

      await sendMessage(conversationId, user.uid, newMessage)
      setNewMessage("")
    } catch (err: any) {
      const errorMessage = err?.message || err?.code || "메시지 전송에 실패했습니다."
      console.error("메시지 전송 실패:", {
        code: err?.code,
        message: err?.message,
        fullError: err,
      })
      setError(`전송 실패: ${errorMessage}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleReport = async () => {
    if (reported) return

    try {
      const user = getCurrentUser()
      if (!user) return

      await createReport({
        reporterId: user.uid,
        conversationId,
        reason: "부적절한 대화 내용",
      })

      setReported(true)
      alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.")
    } catch (error) {
      console.error("신고 실패:", error)
      alert("신고 처리 중 오류가 발생했습니다.")
    }
  }

  const formatTime = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/dm"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="메시지 목록으로 돌아가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-semibold text-foreground">익명 대화</h1>
          <button
            type="button"
            onClick={handleReport}
            disabled={reported}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="신고하기"
          >
            <Flag className={`h-4.5 w-4.5 ${reported ? "text-muted-foreground" : "text-foreground"}`} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">메시지를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="mx-5 mt-6 rounded-2xl border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
          </p>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {isBlocked && (
              <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-center">
                <p className="text-xs text-destructive">
                  차단된 사용자와는 대화할 수 없습니다.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((message) => {
                const user = getCurrentUser()
                const isMine = message.senderId === user?.uid

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-card-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.body}</p>
                      <p
                        className={`mt-1 text-xs ${
                          isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!isBlocked && (
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isSending}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all disabled:opacity-40"
                  aria-label="메시지 보내기"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
