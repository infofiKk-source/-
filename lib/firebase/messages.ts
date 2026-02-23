import { collection, addDoc, query, where, orderBy, limit, Timestamp, onSnapshot, Unsubscribe } from "firebase/firestore"
import { db } from "./config"
import { updateConversationLastMessage } from "./conversations"

export interface Message {
  id?: string
  conversationId: string
  senderId: string
  body: string
  created_at: Timestamp | Date
}

/**
 * 메시지 전송
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      conversationId,
      senderId,
      body: body.trim(),
      created_at: Timestamp.now(),
    })
    
    // 대화방의 마지막 메시지 업데이트
    await updateConversationLastMessage(conversationId, body.trim())
    
    return docRef.id
  } catch (error) {
    console.error("메시지 전송 실패:", error)
    throw error
  }
}

/**
 * 대화방의 메시지 실시간 구독
 * 
 * ⚠️ Firestore Index 필요:
 * - conversationId + created_at (desc): 메시지 조회
 * 
 * 인덱스 생성 방법:
 * 1. Firebase Console > Firestore Database > Indexes
 * 2. "Create Index" 클릭
 * 3. Collection ID: messages
 * 4. Fields 추가:
 *    - conversationId: Ascending
 *    - created_at: Descending
 * 5. "Create" 클릭
 */
export function subscribeMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("created_at", "desc"),
    limit(50) // 최근 50개만
  )
  
  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message)
      })
      // 시간순 정렬 (오래된 것부터)
      messages.reverse()
      callback(messages)
    },
    (error) => {
      if (error?.code === "failed-precondition") {
        console.error(
          "Firestore Index가 필요합니다. Firebase Console에서 인덱스를 생성해주세요.",
          error
        )
      } else {
        console.error("메시지 구독 실패:", error)
      }
    }
  )
}
