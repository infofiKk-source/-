import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Content } from "./contents"

export interface ContentView {
  id?: string
  user_id: string
  content_id: string
  viewed_at: Timestamp | Date
}

/**
 * 콘텐츠 조회 기록 추가
 */
export async function recordContentView(userId: string, contentId: string): Promise<string> {
  try {
    // 이미 조회했는지 확인 (중복 방지)
    const existing = await getContentView(userId, contentId)
    if (existing) {
      return existing.id || ""
    }

    const docRef = await addDoc(collection(db, "content_views"), {
      user_id: userId,
      content_id: contentId,
      viewed_at: Timestamp.now(),
    })

    return docRef.id
  } catch (error) {
    console.error("콘텐츠 조회 기록 실패:", error)
    throw error
  }
}

/**
 * 콘텐츠 조회 기록 확인
 */
export async function getContentView(userId: string, contentId: string): Promise<ContentView | null> {
  try {
    const q = query(
      collection(db, "content_views"),
      where("user_id", "==", userId),
      where("content_id", "==", contentId)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as ContentView
  } catch (error) {
    console.error("콘텐츠 조회 기록 확인 실패:", error)
    return null
  }
}

/**
 * 사용자가 읽은 콘텐츠 목록 가져오기
 */
export async function getUserViewedContents(userId: string): Promise<ContentView[]> {
  try {
    const q = query(
      collection(db, "content_views"),
      where("user_id", "==", userId)
    )

    const querySnapshot = await getDocs(q)
    const views: ContentView[] = []

    querySnapshot.forEach((doc) => {
      views.push({
        id: doc.id,
        ...doc.data(),
      } as ContentView)
    })

    // 최신순 정렬
    views.sort((a, b) => {
      const aTime = a.viewed_at instanceof Timestamp ? a.viewed_at.toMillis() : 0
      const bTime = b.viewed_at instanceof Timestamp ? b.viewed_at.toMillis() : 0
      return bTime - aTime
    })

    return views
  } catch (error) {
    console.error("읽은 콘텐츠 목록 가져오기 실패:", error)
    throw error
  }
}
