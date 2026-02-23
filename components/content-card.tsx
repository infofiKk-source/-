"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Bookmark } from "lucide-react"
import { EmotionBadge } from "@/components/emotion-tag"
import type { Content } from "@/src/data/sample"
import { signInAnonymouslyUser, getCurrentUser } from "@/lib/firebase/auth"
import { saveContent, unsaveContent, getSavedContent } from "@/lib/firebase/saved"
import { recordContentView } from "@/lib/firebase/user-contents"

export function ContentCard({ content }: { content: Content }) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 저장 상태 확인
  useEffect(() => {
    const checkSaved = async () => {
      if (!content.id) return
      try {
        const user = getCurrentUser()
        if (user) {
          const saved = await getSavedContent(user.uid, content.id)
          setIsSaved(!!saved)
        }
      } catch (error) {
        // 에러 무시
      }
    }
    checkSaved()
  }, [content.id])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!content.id || isSaving) return

    setIsSaving(true)
    try {
      let user = getCurrentUser()
      if (!user) {
        user = await signInAnonymouslyUser()
      }

      if (!user) {
        alert("로그인이 필요합니다.")
        setIsSaving(false)
        return
      }

      if (isSaved) {
        await unsaveContent(user.uid, content.id)
        setIsSaved(false)
      } else {
        await saveContent(user.uid, content.id)
        setIsSaved(true)
      }
    } catch (error: any) {
      console.error("저장 실패:", error)
      if (error.message !== "이미 저장한 콘텐츠입니다.") {
        alert(error.message || "저장에 실패했습니다.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleView = async () => {
    // 콘텐츠 조회 기록
    try {
      const user = getCurrentUser()
      if (user && content.id) {
        await recordContentView(user.uid, content.id)
      }
    } catch (error) {
      console.error("조회 기록 실패:", error)
    }
  }

  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary/70">{content.type}</span>
          </div>
          <h3 className="text-base font-semibold leading-relaxed text-card-foreground">
            {content.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {content.tags.length > 0 && (
            <EmotionBadge mood={content.tags[0]} />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50 ${
              isSaved ? "text-primary" : "text-foreground"
            }`}
            aria-label={isSaved ? "저장 해제" : "저장하기"}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isSaved ? "fill-primary" : ""}`}
            />
          </button>
        </div>
      </div>

      <p className="font-serif text-sm leading-relaxed text-primary italic">
        {`"${content.comfort_line}"`}
      </p>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {content.why}
      </p>

      <a
        href={content.link}
        onClick={handleView}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <span>보러 가기</span>
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  )
}
