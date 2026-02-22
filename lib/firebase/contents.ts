import { collection, getDocs, query, where, limit, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"

export interface Content {
  id?: string
  type: string
  title: string
  link: string
  tags: Emotion[]
  comfort_line: string
  why: string
  created_at?: Timestamp | Date
}

// 특정 감정 태그를 가진 콘텐츠 가져오기
export async function getContentsByMood(mood: Emotion, limitCount: number = 5) {
  try {
    const q = query(
      collection(db, "contents"),
      where("tags", "array-contains", mood),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const contents: Content[] = []
    
    querySnapshot.forEach((doc) => {
      contents.push({
        id: doc.id,
        ...doc.data(),
      } as Content)
    })
    
    return contents
  } catch (error) {
    console.error("콘텐츠 가져오기 실패:", error)
    throw error
  }
}
