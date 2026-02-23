import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "./config"

export interface Report {
  id?: string
  reporterId: string // 신고한 사람
  reportedId?: string // 신고당한 사람 (선택)
  conversationId?: string // 신고된 대화방 (선택)
  messageId?: string // 신고된 메시지 (선택)
  reason: string
  created_at: Timestamp | Date
}

/**
 * 신고하기
 */
export async function createReport(report: Omit<Report, "id" | "created_at">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      ...report,
      created_at: Timestamp.now(),
    })
    
    return docRef.id
  } catch (error) {
    console.error("신고 실패:", error)
    throw error
  }
}
