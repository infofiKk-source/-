import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore"
import { db } from "./config"

export interface Block {
  id?: string
  blockerId: string // 차단한 사람
  blockedId: string // 차단당한 사람
  created_at: Timestamp | Date
}

/**
 * 사용자 차단
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<string> {
  try {
    // 이미 차단했는지 확인
    const existing = await isBlocked(blockerId, blockedId)
    if (existing) {
      throw new Error("이미 차단한 사용자입니다.")
    }
    
    const docRef = await addDoc(collection(db, "blocks"), {
      blockerId,
      blockedId,
      created_at: Timestamp.now(),
    })
    
    return docRef.id
  } catch (error) {
    console.error("차단 실패:", error)
    throw error
  }
}

/**
 * 차단 여부 확인
 */
export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "blocks"),
      where("blockerId", "==", blockerId),
      where("blockedId", "==", blockedId)
    )
    
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  } catch (error) {
    console.error("차단 확인 실패:", error)
    return false
  }
}

/**
 * 양방향 차단 확인 (어느 한쪽이라도 차단했으면 true)
 */
export async function isEitherBlocked(userId1: string, userId2: string): Promise<boolean> {
  try {
    const [blocked1, blocked2] = await Promise.all([
      isBlocked(userId1, userId2),
      isBlocked(userId2, userId1),
    ])
    return blocked1 || blocked2
  } catch (error) {
    console.error("차단 확인 실패:", error)
    return false
  }
}
