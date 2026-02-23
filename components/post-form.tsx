"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import type { Emotion } from "@/lib/data"
import { EmotionTag } from "@/components/emotion-tag"
import { containsBlockedWords } from "@/lib/utils"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { createPost } from "@/lib/firebase/posts"
import { LinkPreviewCard } from "@/components/link-preview-card"
import { saveRecentEmotion } from "@/lib/utils/emotion-storage"

export function PostForm() {
  const router = useRouter()
  const [selectedMoods, setSelectedMoods] = useState<Emotion[]>([]) // 복수 선택
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [hasBlockedWords, setHasBlockedWords] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 익명 로그인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = getCurrentUser()
        if (!user) {
          await signInAnonymouslyUser()
          setAuthError(null)
        }
      } catch (error: any) {
        const errorMessage = error?.message || error?.code || "인증에 실패했습니다."
        console.error("인증 초기화 실패:", {
          code: error?.code,
          message: error?.message,
          fullError: error,
        })
        setAuthError(`인증 오류: ${errorMessage}`)
      }
    }
    initAuth()
  }, [])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasBlockedWords(containsBlockedWords(newContent))
  }

  const handleMoodToggle = (emotion: Emotion) => {
    setSelectedMoods((prev) => {
      if (prev.includes(emotion)) {
        return prev.filter((m) => m !== emotion)
      } else {
        // 최근 선택 감정 저장
        saveRecentEmotion(emotion)
        return [...prev, emotion]
      }
    })
  }

  const handleSubmit = async () => {
    // 유효성 검사
    if (selectedMoods.length === 0) {
      alert("감정 태그를 최소 1개 이상 선택해주세요.")
      return
    }
    if (!content.trim() && !link.trim()) {
      alert("마음속 이야기 또는 링크를 작성해주세요.")
      return
    }
    if (hasBlockedWords) {
      alert("부적절한 단어가 포함되어 있습니다. 다시 작성해주세요.")
      return
    }
    
    setIsLoading(true)
    
    try {
      // 익명 로그인 확인
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
          setIsLoading(false)
          return
        }
      }
      
      if (!user) {
        throw new Error("로그인에 실패했습니다.")
      }
      
      // Firebase에 글 저장
      await createPost({
        mood_tags: selectedMoods,
        body: content.trim() || "", // 마음속 이야기 (없으면 빈 문자열)
        link: link.trim() || undefined, // 링크가 있으면 저장, 없으면 undefined
        user_id: user.uid,
      })
      
      setSubmitted(true)
      setTimeout(() => {
        router.push("/feed")
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || "알 수 없는 오류가 발생했습니다."
      console.error("글 작성 실패:", {
        code: error?.code,
        message: error?.message,
        fullError: error,
      })
      setAuthError(`글 작성 실패: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6">
        <div className="rounded-full bg-primary/10 p-6">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            마음을 나눠주셔서 감사해요
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            당신의 이야기가 누군가에게 위로가 될 거예요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/feed"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-base font-semibold text-foreground">
            마음 나누기
          </h1>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              selectedMoods.length === 0 ||
              (!content.trim() && !link.trim()) ||
              hasBlockedWords ||
              isLoading
            }
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-all disabled:opacity-40"
          >
            {isLoading ? "올리는 중..." : "올리기"}
          </button>
        </div>
      </header>

      {/* Mood selection */}
      <section className="px-5 pt-6" aria-label="감정 태그 선택">
        <label className="mb-3 block text-sm font-medium text-foreground">
          지금 나의 감정 <span className="text-muted-foreground">(복수 선택 가능)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <EmotionTag
              key={emotion.label}
              label={emotion.label}
              icon={emotion.icon}
              size="sm"
              isSelected={selectedMoods.includes(emotion.label)}
              onClick={() => handleMoodToggle(emotion.label)}
            />
          ))}
        </div>
        {selectedMoods.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedMoods.length}개의 감정이 선택되었습니다.
          </p>
        )}
      </section>

      {/* Content textarea */}
      <section className="px-5 pt-6" aria-label="글 내용">
        <label className="mb-3 block text-sm font-medium text-foreground">
          마음속 이야기 <span className="text-muted-foreground">(또는 링크만 공유해도 됩니다)</span>
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="여기는 안전한 공간이에요. 마음 편히 적어보세요. 링크를 공유할 때는 왜 위로가 되었는지 함께 적어주시면 더 좋아요."
          maxLength={500}
          rows={8}
          className={`w-full resize-none rounded-2xl border bg-card p-4 text-sm leading-relaxed text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
            hasBlockedWords
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-primary/50 focus:ring-primary/20"
          }`}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-xs ${hasBlockedWords ? "text-destructive" : "text-muted-foreground"}`}>
            {hasBlockedWords ? "부적절한 단어가 포함되어 있습니다." : `${content.length}/500`}
          </span>
        </div>
      </section>

      {/* Link input */}
      <section className="px-5 pt-4" aria-label="관련 링크">
        <label className="mb-3 block text-sm font-medium text-foreground">
          관련 링크 (선택사항)
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://youtube.com/... 또는 다른 링크"
          className="w-full rounded-2xl border border-border bg-card p-4 text-sm text-card-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          유튜브, 음악, 영화 등 위로가 되는 링크를 공유해주세요
        </p>
        {/* Link Preview */}
        {link.trim() && (
          <div className="mt-3">
            <LinkPreviewCard url={link.trim()} />
          </div>
        )}
      </section>

      {/* Anonymous toggle */}
      <section className="px-5 pt-4" aria-label="익명 설정">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium text-card-foreground">
              익명으로 올리기
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              닉네임이 공개되지 않아요
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              isAnonymous ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-transform ${
                isAnonymous ? "translate-x-5" : "translate-x-0"
              }`}
            />
            <span className="sr-only">익명 모드 토글</span>
          </button>
        </div>
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

      {/* Encouragement */}
      <section className="mt-auto px-5 pt-8">
        <div className="rounded-2xl bg-warm-glow/40 p-4">
          <p className="font-serif text-xs leading-relaxed text-foreground/60 italic">
            {
              "\"당신이 느끼는 감정은 모두 소중합니다. 솔직한 마음을 나눌 용기를 가져주셔서 고마워요.\""
            }
          </p>
        </div>
      </section>
    </div>
  )
}
