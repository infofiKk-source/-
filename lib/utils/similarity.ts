import type { Emotion } from "@/lib/data"

/**
 * 감정 태그 기반 유사도 계산
 */
export function calculateEmotionSimilarity(
  tagsA: Emotion[],
  tagsB: Emotion[]
): number {
  if (tagsA.length === 0 || tagsB.length === 0) {
    return 0
  }

  // 공통 태그 개수
  const commonTags = tagsA.filter((tag) => tagsB.includes(tag)).length

  // Jaccard 유사도
  const union = new Set([...tagsA, ...tagsB]).size
  return union > 0 ? commonTags / union : 0
}

/**
 * 텍스트 유사도 계산 (간단한 버전)
 * 실제로는 embedding 기반 cosine similarity를 사용해야 합니다.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) {
    return 0
  }

  const wordsA = textA.toLowerCase().split(/\s+/)
  const wordsB = textB.toLowerCase().split(/\s+/)

  const setA = new Set(wordsA)
  const setB = new Set(wordsB)

  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])

  // Jaccard 유사도
  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * 게시글 종합 유사도 계산
 * - 감정 태그 유사도 (가중치 0.6)
 * - 텍스트 유사도 (가중치 0.4)
 */
export function calculatePostSimilarity(
  postA: { mood_tags: Emotion[]; body: string },
  postB: { mood_tags: Emotion[]; body: string }
): number {
  const emotionSim = calculateEmotionSimilarity(postA.mood_tags, postB.mood_tags)
  const textSim = calculateTextSimilarity(postA.body, postB.body)

  // 가중 평균
  return emotionSim * 0.6 + textSim * 0.4
}
