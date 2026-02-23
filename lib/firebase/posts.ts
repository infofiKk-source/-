import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"

export interface Post {
  id?: string
  mood_tags: Emotion[]
  body: string
  whyItComforted?: string // 왜 위로가 되었는지 (선택사항)
  link?: string // 관련 링크 (선택사항)
  created_at: Timestamp | Date
  reactions_count: number
  comments_count: number
  user_id: string
}

// 새 글 작성
export async function createPost(post: Omit<Post, "id" | "created_at" | "reactions_count" | "comments_count">) {
  try {
    // 기본 필드만 포함 (undefined 필드는 절대 포함하지 않음)
    const postData: Record<string, any> = {
      mood_tags: post.mood_tags,
      body: post.body,
      user_id: post.user_id,
      created_at: Timestamp.now(),
      reactions_count: 0,
      comments_count: 0,
    }

    // link가 존재하고 빈 문자열이 아닐 때만 추가 (undefined/null 체크 포함)
    // post.link가 undefined이거나 null이면 절대 필드를 추가하지 않음
    if (post.link !== undefined && post.link !== null && typeof post.link === "string") {
      const trimmedLink = post.link.trim()
      if (trimmedLink.length > 0) {
        postData.link = trimmedLink
      }
    }

    // whyItComforted가 존재하고 빈 문자열이 아닐 때만 추가 (undefined/null 체크 포함)
    if (post.whyItComforted !== undefined && post.whyItComforted !== null && typeof post.whyItComforted === "string") {
      const trimmedWhyItComforted = post.whyItComforted.trim()
      if (trimmedWhyItComforted.length > 0) {
        postData.whyItComforted = trimmedWhyItComforted
      }
    }

    // 최종 검증: undefined 필드 제거 (안전장치)
    const finalPostData: Record<string, any> = {}
    for (const key in postData) {
      if (postData[key] !== undefined) {
        finalPostData[key] = postData[key]
      }
    }

    // 디버깅: 저장할 데이터 확인
    console.log("📝 저장할 데이터:", JSON.stringify(finalPostData, null, 2))
    console.log("🔍 link 필드 확인:", finalPostData.link === undefined ? "undefined (필드 없음 ✅)" : `"${finalPostData.link}"`)

    // addDoc에 전달 (undefined 필드는 절대 포함되지 않음)
    const docRef = await addDoc(collection(db, "posts"), finalPostData)
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
    
    // 새 스키마(emotionTags)와 기존 스키마(mood_tags) 모두 지원
    // Firestore는 하나의 쿼리에서 하나의 필드만 필터링할 수 있으므로
    // 더 많이 가져온 후 클라이언트에서 필터링
    if (mood) {
      // 필터링을 위해 더 많이 가져오기 (클라이언트에서 필터링)
      q = query(
        collection(db, "posts"),
        orderBy(orderField, orderDirection),
        limit(limitCount * 3) // 필터링을 위해 더 많이 가져오기
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
      const data = doc.data()
      
      // 감정 태그 필터링 (mood 파라미터가 있을 때)
      const emotionTags = data.emotionTags || data.mood_tags || []
      if (mood && !emotionTags.includes(mood)) {
        return // 필터링 조건에 맞지 않으면 건너뛰기
      }
      
      // 새로운 스키마(emotionTags, reason, empathyCount 등)를 기존 스키마로 변환
      const convertedData: Post = {
        id: doc.id,
        mood_tags: emotionTags,
        body: data.reason || data.body || "", // 새로운 스키마의 reason을 body로 매핑
        link: data.link || undefined,
        created_at: data.createdAt || data.created_at || new Date(), // 새로운 스키마의 createdAt을 created_at으로 매핑
        reactions_count: data.empathyCount !== undefined ? data.empathyCount : (data.reactions_count || 0), // 새로운 스키마의 empathyCount를 reactions_count로 매핑
        comments_count: data.comments_count || 0,
        user_id: data.user_id || data.authorName || "익명", // 새로운 스키마의 authorName을 user_id로 매핑 (임시)
      }
      
      // whyItComforted 필드가 있으면 추가
      if (data.whyItComforted) {
        convertedData.whyItComforted = data.whyItComforted
      }
      
      posts.push(convertedData)
    })
    
    // 필터링 후 limit 적용
    const filteredPosts = mood 
      ? posts.filter(p => p.mood_tags.includes(mood))
      : posts
    
    // 정렬 (새 스키마 데이터도 포함하여 정렬)
    const sortedPosts = filteredPosts.sort((a, b) => {
      if (sortBy === "popular") {
        return b.reactions_count - a.reactions_count
      } else {
        const aTime = a.created_at instanceof Timestamp 
          ? a.created_at.toMillis() 
          : a.created_at instanceof Date 
          ? a.created_at.getTime() 
          : 0
        const bTime = b.created_at instanceof Timestamp 
          ? b.created_at.toMillis() 
          : b.created_at instanceof Date 
          ? b.created_at.getTime() 
          : 0
        return bTime - aTime
      }
    })
    
    return sortedPosts.slice(0, limitCount)
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
    const data = doc.data()
    
    // 새로운 스키마를 기존 스키마로 변환
    const convertedData: Post = {
      id: doc.id,
      mood_tags: data.emotionTags || data.mood_tags || [],
      body: data.reason || data.body || "",
      link: data.link || undefined,
      created_at: data.createdAt || data.created_at || new Date(),
      reactions_count: data.empathyCount !== undefined ? data.empathyCount : (data.reactions_count || 0),
      comments_count: data.comments_count || 0,
      user_id: data.user_id || data.authorName || "익명",
    }
    
    if (data.whyItComforted) {
      convertedData.whyItComforted = data.whyItComforted
    }
    
    return convertedData
  } catch (error) {
    console.error("글 가져오기 실패:", error)
    throw error
  }
}
