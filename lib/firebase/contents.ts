import { collection, getDocs, query, where, limit, orderBy, Timestamp } from "firebase/firestore"
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
  empathyCount?: number // 공감 수
  thumbnail?: string // 썸네일 URL
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

/**
 * 공감 수가 높은 콘텐츠 가져오기 (사용자 추천)
 * 
 * ⚠️ Firestore Composite Index 필요:
 * - tags (array-contains) + empathyCount (desc): 감정 필터링 + 공감순
 * - empathyCount (desc): 전체 공감순
 * 
 * 인덱스 생성 방법:
 * 1. Firebase Console > Firestore Database > Indexes
 * 2. "Create Index" 클릭
 * 3. Collection ID: contents
 * 4. Fields 추가:
 *    - tags: Array
 *    - empathyCount: Descending
 * 5. "Create" 클릭
 */
export async function getTopEmpathyContents(
  emotion?: Emotion,
  limitCount: number = 5
): Promise<Content[]> {
  try {
    let q

    if (emotion) {
      // 감정 필터 + 공감순 정렬
      q = query(
        collection(db, "contents"),
        where("tags", "array-contains", emotion),
        orderBy("empathyCount", "desc"),
        limit(limitCount)
      )
    } else {
      // 전체 + 공감순 정렬
      q = query(
        collection(db, "contents"),
        orderBy("empathyCount", "desc"),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    const contents: Content[] = []

    querySnapshot.forEach((doc) => {
      contents.push({
        id: doc.id,
        ...doc.data(),
      } as Content)
    })

    return contents
  } catch (error: any) {
    // Composite index 오류인 경우 안내
    if (error?.code === "failed-precondition") {
      console.error(
        "Firestore Composite Index가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.",
        error
      )
      // 인덱스가 없어도 빈 배열 반환 (샘플 데이터 사용)
      return []
    }
    console.error("공감받는 콘텐츠 가져오기 실패:", error)
    throw error
  }
}

/**
 * 최신순 콘텐츠 가져오기 (사용자 추천)
 */
export async function getLatestContents(
  emotion?: Emotion,
  limitCount: number = 5
): Promise<Content[]> {
  try {
    let q

    if (emotion) {
      // 감정 필터 + 최신순 정렬
      q = query(
        collection(db, "contents"),
        where("tags", "array-contains", emotion),
        orderBy("created_at", "desc"),
        limit(limitCount)
      )
    } else {
      // 전체 + 최신순 정렬
      q = query(
        collection(db, "contents"),
        orderBy("created_at", "desc"),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    const contents: Content[] = []

    querySnapshot.forEach((doc) => {
      contents.push({
        id: doc.id,
        ...doc.data(),
      } as Content)
    })

    return contents
  } catch (error: any) {
    if (error?.code === "failed-precondition") {
      console.error(
        "Firestore Index가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.",
        error
      )
      return []
    }
    console.error("최신 콘텐츠 가져오기 실패:", error)
    throw error
  }
}

/**
 * 모든 콘텐츠 가져오기 (AI 추천용)
 */
export async function getAllContents(): Promise<Content[]> {
  try {
    const q = query(collection(db, "contents"))
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
    console.error("콘텐츠 목록 가져오기 실패:", error)
    throw error
  }
}
