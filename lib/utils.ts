import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 욕설/공격 단어 필터 (최소 필터)
const blockedWords = [
  '바보', '멍청이', '미친', '미친놈', '미친년', '개새끼', '병신', '좆', '시발', '씨발',
  '개같은', '지랄', '닥쳐', '죽어', '꺼져', '쓰레기', '인간쓰레기', '후레자식',
  '개소리', '헛소리', '말도안돼', '말도 안돼',
  'ㅅㅂ', 'ㅆㅂ', 'ㅂㅅ', 'ㅄ'
]

export function containsBlockedWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return blockedWords.some(word => lowerText.includes(word.toLowerCase()))
}

export function filterBlockedWords(text: string): string {
  let filtered = text
  blockedWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '***')
  })
  return filtered
}
