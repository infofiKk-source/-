export type Emotion =
  | "외로움"
  | "불안"
  | "번아웃"
  | "무기력"
  | "이별"
  | "낮은 자존감"
  | "슬픔"
  | "분노"

export const emotions: { label: Emotion; icon: string; color: string }[] = [
  { label: "외로움", icon: "cloud", color: "bg-blue-100 text-blue-700" },
  { label: "불안", icon: "wind", color: "bg-amber-100 text-amber-700" },
  { label: "번아웃", icon: "flame", color: "bg-orange-100 text-orange-700" },
  { label: "무기력", icon: "battery-low", color: "bg-stone-200 text-stone-600" },
  { label: "이별", icon: "heart-crack", color: "bg-rose-100 text-rose-600" },
  { label: "낮은 자존감", icon: "sparkles", color: "bg-emerald-100 text-emerald-700" },
  { label: "슬픔", icon: "droplets", color: "bg-sky-100 text-sky-700" },
  { label: "분노", icon: "zap", color: "bg-red-100 text-red-600" },
]

export type ContentType = "음악" | "영화" | "유튜브" | "책" | "에세이" | "명상" | "팟캐스트"

export interface ContentCard {
  id: string
  title: string
  comfort: string
  reason: string
  link: string
  emotion: Emotion
  type: ContentType
}

export interface CommunityPost {
  id: string
  mood: Emotion
  summary: string
  content: string
  empathyCount: number
  commentCount: number
  author: string
  createdAt: string
}

export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

// 샘플 데이터는 src/data/sample.ts에서 import하세요
export const mockContentCards: ContentCard[] = []

// 샘플 데이터는 src/data/sample.ts에서 import하세요
export const mockPosts: CommunityPost[] = []

export const mockComments: Comment[] = [
  {
    id: "cm1",
    author: "따뜻한손",
    content: "저도 비슷한 마음이에요. 혼자가 아니라는 걸 기억해주세요.",
    createdAt: "1시간 전",
  },
  {
    id: "cm2",
    author: "봄바람",
    content: "괜찮아요. 이런 감정을 느끼는 것 자체가 자연스러운 거예요. 응원합니다.",
    createdAt: "2시간 전",
  },
  {
    id: "cm3",
    author: "달빛산책",
    content: "글을 읽으며 공감이 많이 됐어요. 우리 함께 힘내봐요.",
    createdAt: "4시간 전",
  },
]
