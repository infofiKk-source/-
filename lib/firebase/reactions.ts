import { collection, addDoc, getDocs, query, where, Timestamp, increment, updateDoc, doc, onSnapshot, Unsubscribe } from "firebase/firestore"
import { db } from "./config"

export interface Reaction {
  id?: string
  post_id: string
  user_id: string
  created_at: Timestamp | Date
}

// 공감 추가 (중복 방지)
export async function addReaction(postId: string, userId: string) {
  try {
    // 이미 공감했는지 확인
    const existingReaction = await getReaction(postId, userId)
    if (existingReaction) {
      throw new Error("이미 공감했습니다.")
    }
    
    // 공감 추가
    const docRef = await addDoc(collection(db, "reactions"), {
      post_id: postId,
      user_id: userId,
      created_at: Timestamp.now(),
    })
    
    // 해당 글의 reactions_count 증가
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      reactions_count: increment(1),
    })
    
    return docRef.id
  } catch (error) {
    console.error("공감 추가 실패:", error)
    throw error
  }
}

// 특정 사용자가 특정 글에 공감했는지 확인
export async function getReaction(postId: string, userId: string) {
  try {
    const q = query(
      collection(db, "reactions"),
      where("post_id", "==", postId),
      where("user_id", "==", userId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as Reaction
  } catch (error) {
    console.error("공감 확인 실패:", error)
    throw error
  }
}

// 특정 글의 공감 수 가져오기
export async function getReactionCount(postId: string) {
  try {
    const q = query(collection(db, "reactions"), where("post_id", "==", postId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error("공감 수 가져오기 실패:", error)
    throw error
  }
}

// 특정 글의 공감 수 실시간 구독
export function subscribeReactionCount(
  postId: string,
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, "reactions"),
    where("post_id", "==", postId)
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size)
    },
    (error) => {
      console.error("공감 수 구독 실패:", error)
      // 에러 발생 시 현재 count를 0으로 설정하지 않고 기존 값 유지
    }
  )
}
