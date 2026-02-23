import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"
import type { Post } from "./posts"

// 최근 30일 데이터 가져오기
export async function getPostsLast30Days() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo)

    const q = query(
      collection(db, "posts"),
      where("created_at", ">=", thirtyDaysAgoTimestamp)
    )

    const querySnapshot = await getDocs(q)
    const posts: Post[] = []

    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as Post)
    })

    return posts
  } catch (error) {
    console.error("최근 30일 데이터 가져오기 실패:", error)
    throw error
  }
}

// 감정별 집계
export function aggregateByMood(posts: Post[]): { mood: Emotion; count: number }[] {
  const moodCount: Record<Emotion, number> = {} as Record<Emotion, number>

  posts.forEach((post) => {
    post.mood_tags.forEach((mood) => {
      moodCount[mood] = (moodCount[mood] || 0) + 1
    })
  })

  return Object.entries(moodCount)
    .map(([mood, count]) => ({
      mood: mood as Emotion,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

// 날짜별 집계
export function aggregateByDate(posts: Post[]): { date: string; count: number }[] {
  const dateCount: Record<string, number> = {}

  posts.forEach((post) => {
    let date: Date
    if (post.created_at instanceof Timestamp) {
      date = post.created_at.toDate()
    } else if (post.created_at instanceof Date) {
      date = post.created_at
    } else {
      return // 날짜 형식이 맞지 않으면 스킵
    }

    const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD 형식
    dateCount[dateStr] = (dateCount[dateStr] || 0) + 1
  })

  // 최근 30일의 모든 날짜 포함 (0개인 날짜도)
  const result: { date: string; count: number }[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    result.push({
      date: dateStr,
      count: dateCount[dateStr] || 0,
    })
  }

  return result
}
