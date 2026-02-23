"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { getContentsByMood, type Content as FirebaseContent } from "@/lib/firebase/contents"
import { contents as sampleContents } from "@/src/data/sample"
import { ContentCard } from "@/components/content-card"
import type { Emotion } from "@/lib/data"

interface AIResponseSectionProps {
  emotions: Emotion[]
  userMessage?: string
}

export function AIResponseSection({ emotions, userMessage }: AIResponseSectionProps) {
  const [aiResponse, setAiResponse] = useState<string>("")
  const [relatedContents, setRelatedContents] = useState<FirebaseContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [contentsLoading, setContentsLoading] = useState(true)

  // AI 답변 생성
  useEffect(() => {
    const generateAIResponse = async () => {
      setIsLoading(true)
      try {
        // TODO: 실제 AI API 연동 (OpenAI, Claude 등)
        // 현재는 간단한 템플릿 기반 응답
        const response = generateComfortResponse(emotions, userMessage)
        setAiResponse(response)
      } catch (error) {
        console.error("AI 답변 생성 실패:", error)
        setAiResponse("")
      } finally {
        setIsLoading(false)
      }
    }

    generateAIResponse()
  }, [emotions, userMessage])

  // 관련 콘텐츠 로드
  useEffect(() => {
    const loadContents = async () => {
      setContentsLoading(true)
      try {
        if (emotions.length > 0) {
          const primaryEmotion = emotions[0]
          const firebaseContents = await getContentsByMood(primaryEmotion, 3)
          const combined = [...firebaseContents, ...sampleContents.filter((c) => c.tags.includes(primaryEmotion))]
          setRelatedContents(combined.slice(0, 3))
        } else {
          setRelatedContents([])
        }
      } catch (error) {
        console.error("관련 콘텐츠 로드 실패:", error)
        setRelatedContents([])
      } finally {
        setContentsLoading(false)
      }
    }

    loadContents()
  }, [emotions])

  if (isLoading) {
    return (
      <section className="px-5 pt-6" aria-label="AI 위로">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">위로를 준비하고 있어요...</p>
        </div>
      </section>
    )
  }

  if (!aiResponse) {
    return null
  }

  return (
    <section className="px-5 pt-6" aria-label="AI 위로">
      {/* AI 답변 */}
      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">AI 위로</h3>
        </div>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
          {aiResponse}
        </p>
      </div>

      {/* 관련 콘텐츠 */}
      {contentsLoading ? (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      ) : relatedContents.length > 0 ? (
        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">이런 위로는 어떠세요?</h3>
          <div className="flex flex-col gap-4">
            {relatedContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

/**
 * 위로 응답 생성 (템플릿 기반)
 * 실제로는 OpenAI API 등을 사용해야 합니다.
 */
function generateComfortResponse(emotions: Emotion[], userMessage?: string): string {
  const emotionMessages: Record<Emotion, string> = {
    외로움: "외로움을 느끼는 것은 당신이 깊은 감정을 가진 사람이라는 뜻이에요. 지금 이 순간도 당신은 혼자가 아니에요.",
    불안: "불안은 미래에 대한 걱정에서 오는 거예요. 하지만 지금 이 순간은 안전해요. 천천히 숨을 쉬어보세요.",
    번아웃: "쉬어가는 것도 용기예요. 멈추는 것이 약함이 아니라 자신을 돌보는 지혜예요.",
    무기력: "무기력은 당신이 지쳐있다는 신호예요. 작은 것부터 시작해도 괜찮아요.",
    이별: "이별의 아픔은 당신이 사랑했다는 증거예요. 시간이 지나면 아픔도 추억이 될 거예요.",
    "낮은 자존감": "당신은 이미 충분히 소중한 사람이에요. 자신을 더 자주 인정해주세요.",
    슬픔: "슬픔을 느끼는 것은 자연스러운 일이에요. 감정을 억누르지 말고 그대로 느껴보세요.",
    분노: "분노는 당신의 경계를 보여주는 감정이에요. 그 감정을 인정하고 건강하게 표현해보세요.",
  }

  const primaryEmotion = emotions[0]
  let response = emotionMessages[primaryEmotion] || "지금 이 순간도 당신은 혼자가 아니에요."

  if (userMessage) {
    response += `\n\n"${userMessage}"라는 마음을 가진 당신을 이해하고 있어요.`
  }

  response += "\n\n당신의 감정은 모두 소중하고, 지금 이 순간을 견뎌내고 있는 당신은 이미 충분히 강해요."

  return response
}
