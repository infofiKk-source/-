import { collection, addDoc, getDocs, query, orderBy, where, Timestamp, increment, updateDoc, doc } from "firebase/firestore"
import { db } from "./config"

export interface Comment {
  id?: string
  post_id: string
  body: string
  created_at: Timestamp | Date
  user_id: string
}

// 댓글 작성
export async function createComment(comment: Omit<Comment, "id" | "created_at">) {
  try {
    // 댓글 추가
    const docRef = await addDoc(collection(db, "comments"), {
      ...comment,
      created_at: Timestamp.now(),
    })
    
    // 해당 글의 comments_count 증가
    const postRef = doc(db, "posts", comment.post_id)
    await updateDoc(postRef, {
      comments_count: increment(1),
    })
    
    return docRef.id
  } catch (error) {
    console.error("댓글 작성 실패:", error)
    throw error
  }
}

// 특정 글의 댓글 목록 가져오기
export async function getComments(postId: string) {
  try {
    const q = query(
      collection(db, "comments"),
      where("post_id", "==", postId),
      orderBy("created_at", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    const comments: Comment[] = []
    
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data(),
      } as Comment)
    })
    
    return comments
  } catch (error) {
    console.error("댓글 목록 가져오기 실패:", error)
    throw error
  }
}
