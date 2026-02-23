import type { Emotion } from "@/lib/data"

const RECENT_EMOTIONS_KEY = "recent_emotions"
const MAX_RECENT_EMOTIONS = 10

/**
 * 최근 선택한 감정 저장
 */
export function saveRecentEmotion(emotion: Emotion) {
  try {
    const recent = getRecentEmotions()
    // 중복 제거 후 맨 앞에 추가
    const filtered = recent.filter((e) => e !== emotion)
    const updated = [emotion, ...filtered].slice(0, MAX_RECENT_EMOTIONS)
    localStorage.setItem(RECENT_EMOTIONS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("최근 감정 저장 실패:", error)
  }
}

/**
 * 최근 선택한 감정 목록 가져오기
 */
export function getRecentEmotions(): Emotion[] {
  try {
    const stored = localStorage.getItem(RECENT_EMOTIONS_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Emotion[]
  } catch (error) {
    console.error("최근 감정 불러오기 실패:", error)
    return []
  }
}

/**
 * 감정 빈도 계산 (가장 최근에 선택한 감정일수록 높은 점수)
 */
export function getEmotionFrequency(): Map<Emotion, number> {
  const recent = getRecentEmotions()
  const frequency = new Map<Emotion, number>()

  recent.forEach((emotion, index) => {
    // 최근에 선택한 감정일수록 높은 점수 (역순 가중치)
    const weight = recent.length - index
    frequency.set(emotion, (frequency.get(emotion) || 0) + weight)
  })

  return frequency
}

/**
 * 감정 유사도 점수 계산
 * 선택한 감정과 콘텐츠 태그의 유사도를 계산
 */
export function calculateEmotionSimilarity(
  selectedEmotions: Emotion[],
  contentTags: Emotion[]
): number {
  if (selectedEmotions.length === 0 || contentTags.length === 0) {
    return 0
  }

  // 공통 태그 개수
  const commonTags = selectedEmotions.filter((e) => contentTags.includes(e)).length

  // 유사도 = 공통 태그 수 / 선택한 감정 수
  return commonTags / selectedEmotions.length
}
