import type { Emotion } from "@/lib/data"

export interface ComfortTemplate {
  id: string
  mood?: Emotion // 특정 감정에 맞는 템플릿 (없으면 전체)
  message: string // 위로 문장
  action: string // 행동 제안
  emoji: string // 이모지
  gradient: string // Tailwind 그라데이션 클래스
}

export const comfortTemplates: ComfortTemplate[] = [
  // 외로움
  {
    id: "lonely-1",
    mood: "외로움",
    message: "혼자라는 것은 약함이 아니에요. 당신은 충분히 소중한 사람입니다.",
    action: "오늘은 나에게 따뜻한 차 한 잔을 선물해보세요.",
    emoji: "🌙",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    id: "lonely-2",
    mood: "외로움",
    message: "외로움은 당신을 더 깊이 알아가는 시간이에요.",
    action: "작은 일상의 소중함을 기록해보세요.",
    emoji: "✨",
    gradient: "from-blue-400/20 to-purple-400/20",
  },
  {
    id: "lonely-3",
    mood: "외로움",
    message: "지금의 외로움도 언젠가는 따뜻한 추억이 될 거예요.",
    action: "좋아하는 음악을 들으며 마음을 정리해보세요.",
    emoji: "🎵",
    gradient: "from-indigo-500/20 to-blue-500/20",
  },

  // 불안
  {
    id: "anxious-1",
    mood: "불안",
    message: "불안은 미래에 대한 걱정이에요. 지금 이 순간에 집중해보세요.",
    action: "심호흡을 3번 천천히 해보세요.",
    emoji: "🌿",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "anxious-2",
    mood: "불안",
    message: "걱정은 걱정만 키울 뿐이에요. 지금 할 수 있는 작은 것부터 시작해보세요.",
    action: "오늘 하루 잘한 일을 하나 적어보세요.",
    emoji: "🌱",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "anxious-3",
    mood: "불안",
    message: "당신은 이미 충분히 잘하고 있어요. 조금만 쉬어도 괜찮아요.",
    action: "5분만 눈을 감고 휴식해보세요.",
    emoji: "🕊️",
    gradient: "from-orange-400/20 to-amber-400/20",
  },

  // 번아웃
  {
    id: "burnout-1",
    mood: "번아웃",
    message: "지쳤을 때는 멈춰도 돼요. 쉬는 것도 중요한 일이에요.",
    action: "오늘은 아무것도 하지 않아도 괜찮아요.",
    emoji: "🌅",
    gradient: "from-red-500/20 to-pink-500/20",
  },
  {
    id: "burnout-2",
    mood: "번아웃",
    message: "무리하지 마세요. 당신의 건강이 가장 중요해요.",
    action: "편안한 자세로 몸을 풀어보세요.",
    emoji: "🌺",
    gradient: "from-rose-500/20 to-red-500/20",
  },
  {
    id: "burnout-3",
    mood: "번아웃",
    message: "쉬는 시간도 성장의 일부예요. 지금은 충전하는 시간이에요.",
    action: "좋아하는 취미 활동을 해보세요.",
    emoji: "🌸",
    gradient: "from-pink-400/20 to-rose-400/20",
  },

  // 무기력
  {
    id: "lethargy-1",
    mood: "무기력",
    message: "무기력함도 감정이에요. 느끼는 것 자체가 괜찮아요.",
    action: "작은 목표 하나를 세워보세요.",
    emoji: "🌊",
    gradient: "from-gray-500/20 to-slate-500/20",
  },
  {
    id: "lethargy-2",
    mood: "무기력",
    message: "느리게 가도 괜찮아요. 당신만의 속도가 있어요.",
    action: "10분만 산책해보세요.",
    emoji: "☁️",
    gradient: "from-slate-400/20 to-gray-400/20",
  },
  {
    id: "lethargy-3",
    mood: "무기력",
    message: "지금은 쉬어가는 시간이에요. 언젠가 다시 움직일 거예요.",
    action: "창밖을 보며 마음을 비워보세요.",
    emoji: "🌫️",
    gradient: "from-gray-500/20 to-zinc-500/20",
  },

  // 이별
  {
    id: "breakup-1",
    mood: "이별",
    message: "이별은 아파요. 그 아픔을 느끼는 것도 치유의 과정이에요.",
    action: "오늘은 눈물 흘려도 괜찮아요.",
    emoji: "💔",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "breakup-2",
    mood: "이별",
    message: "시간이 모든 것을 치유해줄 거예요. 지금은 아파도 괜찮아요.",
    action: "가까운 사람에게 연락해보세요.",
    emoji: "🦋",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "breakup-3",
    mood: "이별",
    message: "당신은 혼자가 아니에요. 주변에 당신을 사랑하는 사람들이 있어요.",
    action: "자신을 위해 작은 선물을 해보세요.",
    emoji: "💐",
    gradient: "from-pink-400/20 to-purple-400/20",
  },

  // 낮은 자존감
  {
    id: "low-self-esteem-1",
    mood: "낮은 자존감",
    message: "당신은 이미 충분히 좋은 사람이에요. 그 사실을 기억해주세요.",
    action: "오늘 자신에게 칭찬 한 마디를 해보세요.",
    emoji: "💎",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "low-self-esteem-2",
    mood: "낮은 자존감",
    message: "완벽하지 않아도 괜찮아요. 당신은 그 자체로 소중해요.",
    action: "좋아하는 옷을 입어보세요.",
    emoji: "🌟",
    gradient: "from-teal-500/20 to-emerald-500/20",
  },
  {
    id: "low-self-esteem-3",
    mood: "낮은 자존감",
    message: "당신의 가치는 다른 사람의 평가로 정해지지 않아요.",
    action: "거울을 보며 미소를 지어보세요.",
    emoji: "✨",
    gradient: "from-green-400/20 to-emerald-400/20",
  },

  // 슬픔
  {
    id: "sadness-1",
    mood: "슬픔",
    message: "슬픔도 감정이에요. 느끼는 것 자체가 자연스러워요.",
    action: "따뜻한 물로 손을 씻어보세요.",
    emoji: "🌧️",
    gradient: "from-indigo-500/20 to-blue-500/20",
  },
  {
    id: "sadness-2",
    mood: "슬픔",
    message: "슬픔은 언젠가 지나갈 거예요. 지금은 그 감정을 인정해주세요.",
    action: "편안한 음악을 들으며 휴식해보세요.",
    emoji: "☔",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    id: "sadness-3",
    mood: "슬픔",
    message: "당신의 슬픔은 소중해요. 그것이 당신을 더 따뜻하게 만들어요.",
    action: "따뜻한 차 한 잔을 마셔보세요.",
    emoji: "🌦️",
    gradient: "from-indigo-400/20 to-blue-400/20",
  },

  // 분노
  {
    id: "anger-1",
    mood: "분노",
    message: "분노도 감정이에요. 느끼는 것 자체는 자연스러워요.",
    action: "심호흡을 깊게 5번 해보세요.",
    emoji: "🔥",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "anger-2",
    mood: "분노",
    message: "분노는 보호하려는 마음이에요. 당신을 이해해요.",
    action: "물을 마시며 마음을 진정시켜보세요.",
    emoji: "⚡",
    gradient: "from-red-500/20 to-orange-500/20",
  },
  {
    id: "anger-3",
    mood: "분노",
    message: "지금은 화가 나도 괜찮아요. 그 감정도 소중해요.",
    action: "짧은 산책을 해보세요.",
    emoji: "🌋",
    gradient: "from-orange-400/20 to-red-400/20",
  },

  // 전체 (mood 없음)
  {
    id: "general-1",
    message: "오늘 하루도 수고했어요. 당신은 이미 충분히 잘하고 있어요.",
    action: "지금 이 순간을 소중하게 느껴보세요.",
    emoji: "🌻",
    gradient: "from-yellow-400/20 to-orange-400/20",
  },
  {
    id: "general-2",
    message: "힘들 때는 쉬어도 돼요. 당신의 건강이 가장 중요해요.",
    action: "따뜻한 물로 몸을 풀어보세요.",
    emoji: "🌞",
    gradient: "from-orange-400/20 to-yellow-400/20",
  },
  {
    id: "general-3",
    message: "작은 것부터 시작해도 괜찮아요. 모든 여정은 한 걸음부터예요.",
    action: "오늘 하루 잘한 일을 생각해보세요.",
    emoji: "⭐",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "general-4",
    message: "당신은 혼자가 아니에요. 많은 사람들이 당신을 응원해요.",
    action: "가까운 사람에게 안부를 전해보세요.",
    emoji: "💫",
    gradient: "from-amber-400/20 to-yellow-400/20",
  },
  {
    id: "general-5",
    message: "지금 이 순간도 소중해요. 오늘 하루 수고했어요.",
    action: "편안한 자세로 몸을 풀어보세요.",
    emoji: "🌙",
    gradient: "from-indigo-400/20 to-purple-400/20",
  },
]
