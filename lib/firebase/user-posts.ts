import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Post } from "./posts"

/**
 * 사용자가 작성한 게시글 가져오기
 */
export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, "posts"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    )

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
    console.error("사용자 게시글 가져오기 실패:", error)
    throw error
  }
}
