"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { emotions } from "@/lib/data"
import type { Emotion } from "@/lib/data"
import { EmotionTag } from "@/components/emotion-tag"
import { containsBlockedWords } from "@/lib/utils"

export function PostForm() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<Emotion | null>(null)
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [hasBlockedWords, setHasBlockedWords] = useState(false)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setHasBlockedWords(containsBlockedWords(newContent))
  }

  const handleSubmit = () => {
    if (!selectedMood || !content.trim()) return
    if (hasBlockedWords) {
      alert("부적절한 단어가 포함되어 있습니다. 다시 작성해주세요.")
      return
    }
    
    // 새 글을 sessionStorage에 저장 (새 구조)
    const newPost = {
      id: `p-${Date.now()}`,
      mood_tags: [selectedMood],
      body: content.trim(),
      created_at: "방금 전",
      reactions_count: 0,
      comments_count: 0,
    }
    
    sessionStorage.setItem("newPost", JSON.stringify(newPost))
    setSubmitted(true)
    setTimeout(() => {
      router.push("/feed")
    }, 2000)
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
            disabled={!selectedMood || !content.trim() || hasBlockedWords}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-all disabled:opacity-40"
          >
            올리기
          </button>
        </div>
      </header>

      {/* Mood selection */}
      <section className="px-5 pt-6" aria-label="감정 태그 선택">
        <label className="mb-3 block text-sm font-medium text-foreground">
          지금 나의 감정
        </label>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <EmotionTag
              key={emotion.label}
              label={emotion.label}
              icon={emotion.icon}
              size="sm"
              isSelected={selectedMood === emotion.label}
              onClick={() =>
                setSelectedMood(
                  selectedMood === emotion.label ? null : emotion.label
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Content textarea */}
      <section className="px-5 pt-6" aria-label="글 내용">
        <label className="mb-3 block text-sm font-medium text-foreground">
          마음속 이야기
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="여기는 안전한 공간이에요. 마음 편히 적어보세요..."
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
