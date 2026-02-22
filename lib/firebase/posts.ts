import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"

export interface Post {
  id?: string
  mood_tags: Emotion[]
  body: string
  link?: string // 관련 링크 (선택사항)
  created_at: Timestamp | Date
  reactions_count: number
  comments_count: number
  user_id: string
}

// 새 글 작성
export async function createPost(post: Omit<Post, "id" | "created_at" | "reactions_count" | "comments_count">) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      ...post,
      created_at: Timestamp.now(),
      reactions_count: 0,
      comments_count: 0,
    })
    return docRef.id
  } catch (error) {
    console.error("글 작성 실패:", error)
    throw error
  }
}

// 정렬 옵션 타입
export type SortOption = "latest" | "popular"

/**
 * 글 목록 가져오기 (필터링 및 정렬 가능)
 * 
 * ⚠️ Firestore Composite Index 필요:
 * - mood_tags (array-contains) + created_at (desc): 최신순 필터링
 * - mood_tags (array-contains) + reactions_count (desc): 공감순 필터링
 * - created_at (desc): 최신순 전체
 * - reactions_count (desc): 공감순 전체
 * 
 * 인덱스 생성 방법:
 * 1. Firebase Console > Firestore Database > Indexes
 * 2. "Create Index" 클릭
 * 3. Collection ID: posts
 * 4. Fields 추가:
 *    - mood_tags: Array
 *    - created_at: Descending (또는 reactions_count: Descending)
 * 5. "Create" 클릭
 */
export async function getPosts(
  mood?: Emotion,
  limitCount: number = 5,
  sortBy: SortOption = "latest"
) {
  try {
    let q
    
    // 정렬 기준 설정
    const orderField = sortBy === "popular" ? "reactions_count" : "created_at"
    const orderDirection: "asc" | "desc" = "desc"
    
    if (mood) {
      // 감정 필터 + 정렬
      q = query(
        collection(db, "posts"),
        where("mood_tags", "array-contains", mood),
        orderBy(orderField, orderDirection),
        limit(limitCount)
      )
    } else {
      // 전체 + 정렬
      q = query(
        collection(db, "posts"),
        orderBy(orderField, orderDirection),
        limit(limitCount)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const posts: Post[] = []
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as Post)
    })
    
    return posts
  } catch (error: any) {
    // Composite index 오류인 경우 안내
    if (error?.code === "failed-precondition") {
      console.error(
        "Firestore Composite Index가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.",
        error
      )
      throw new Error(
        "인덱스가 필요합니다. Firebase Console에서 composite index를 생성해주세요."
      )
    }
    console.error("글 목록 가져오기 실패:", error)
    throw error
  }
}

// 특정 글 가져오기
export async function getPost(postId: string) {
  try {
    const q = query(collection(db, "posts"), where("__name__", "==", postId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as Post
  } catch (error) {
    console.error("글 가져오기 실패:", error)
    throw error
  }
}
