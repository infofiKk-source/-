import { collection, addDoc, getDocs, query, where, Timestamp, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./config"

export interface Conversation {
  id?: string
  memberIds: string[] // 대화 참여자 ID 배열
  created_at: Timestamp | Date
  updated_at: Timestamp | Date
  lastMessage?: string
  lastMessageAt?: Timestamp | Date
}

/**
 * 대화방 생성 또는 조회
 * 
 * ⚠️ Firestore Index 필요:
 * - memberIds (array-contains): 대화방 리스트 조회
 * 
 * 인덱스 생성 방법:
 * 1. Firebase Console > Firestore Database > Indexes
 * 2. "Create Index" 클릭
 * 3. Collection ID: conversations
 * 4. Fields 추가: memberIds (Array)
 * 5. "Create" 클릭
 */
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  try {
    // 두 사용자 ID를 정렬하여 일관된 대화방 생성
    const memberIds = [userId1, userId2].sort()
    
    // 기존 대화방 찾기 (array-contains로 양쪽 사용자 모두 포함하는 대화방 찾기)
    // 주의: 이 방법은 두 사용자가 모두 포함된 대화방을 찾지만, 정확히 두 명만 있는 대화방을 찾지 못할 수 있음
    // 더 정확한 방법은 두 개의 쿼리를 사용하거나, 대화방 ID를 사용자 ID 조합으로 생성하는 것
    const q1 = query(
      collection(db, "conversations"),
      where("memberIds", "array-contains", userId1)
    )
    
    const querySnapshot1 = await getDocs(q1)
    
    // 두 사용자 모두 포함하는 대화방 찾기
    for (const doc of querySnapshot1.docs) {
      const data = doc.data()
      const ids = data.memberIds as string[]
      if (ids.length === 2 && ids.includes(userId1) && ids.includes(userId2)) {
        // 두 사용자만 포함하고 순서가 정렬된 배열과 같은지 확인
        const sortedIds = [...ids].sort()
        if (sortedIds[0] === memberIds[0] && sortedIds[1] === memberIds[1]) {
          return doc.id
        }
      }
    }
    
    // 새 대화방 생성
    const now = Timestamp.now()
    const docRef = await addDoc(collection(db, "conversations"), {
      memberIds,
      created_at: now,
      updated_at: now,
    })
    
    return docRef.id
  } catch (error) {
    console.error("대화방 생성/조회 실패:", error)
    throw error
  }
}

/**
 * 사용자의 대화방 리스트 가져오기
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("memberIds", "array-contains", userId)
    )
    
    const querySnapshot = await getDocs(q)
    const conversations: Conversation[] = []
    
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      } as Conversation)
    })
    
    // 최신 메시지 순으로 정렬
    conversations.sort((a, b) => {
      const aTime = a.lastMessageAt instanceof Timestamp 
        ? a.lastMessageAt.toMillis() 
        : a.updated_at instanceof Timestamp 
        ? a.updated_at.toMillis() 
        : 0
      const bTime = b.lastMessageAt instanceof Timestamp 
        ? b.lastMessageAt.toMillis() 
        : b.updated_at instanceof Timestamp 
        ? b.updated_at.toMillis() 
        : 0
      return bTime - aTime
    })
    
    return conversations
  } catch (error: any) {
    if (error?.code === "failed-precondition") {
      console.error(
        "Firestore Index가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.",
        error
      )
      throw new Error("인덱스가 필요합니다. Firebase Console에서 composite index를 생성해주세요.")
    }
    console.error("대화방 리스트 가져오기 실패:", error)
    throw error
  }
}

/**
 * 특정 대화방 가져오기
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const docRef = doc(db, "conversations", conversationId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Conversation
  } catch (error) {
    console.error("대화방 가져오기 실패:", error)
    throw error
  }
}

/**
 * 대화방의 마지막 메시지 업데이트
 */
export async function updateConversationLastMessage(
  conversationId: string,
  message: string
) {
  try {
    const docRef = doc(db, "conversations", conversationId)
    await setDoc(
      docRef,
      {
        lastMessage: message,
        lastMessageAt: Timestamp.now(),
        updated_at: Timestamp.now(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error("대화방 업데이트 실패:", error)
    throw error
  }
}
