import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"

export interface Post {
  id?: string
  mood_tags: Emotion[]
  body: string
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

// 글 목록 가져오기 (필터링 가능)
export async function getPosts(mood?: Emotion, limitCount: number = 5) {
  try {
    let q = query(collection(db, "posts"), orderBy("created_at", "desc"))
    
    if (mood) {
      q = query(q, where("mood_tags", "array-contains", mood), limit(limitCount))
    } else {
      q = query(q, limit(limitCount))
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
  } catch (error) {
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
