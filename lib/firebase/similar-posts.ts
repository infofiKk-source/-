import { collection, getDocs, query, where, limit, Timestamp } from "firebase/firestore"
import { db } from "./config"
import type { Emotion } from "@/lib/data"
import type { Post } from "./posts"
import { calculatePostSimilarity } from "@/lib/utils/similarity"

/**
 * 유사한 게시글 찾기
 * 
 * 1. 같은 감정 태그를 가진 게시글 필터링
 * 2. 유사도 계산
 * 3. threshold 이상인 게시글 반환
 */
export async function getSimilarPosts(
  currentPost: { id: string; mood_tags: Emotion[]; body: string },
  threshold: number = 0.8,
  limitCount: number = 5
): Promise<Post[]> {
  try {
    // 같은 감정 태그를 가진 게시글 가져오기
    const similarPosts: Post[] = []

    // 각 감정 태그별로 게시글 가져오기
    for (const mood of currentPost.mood_tags) {
      const q = query(
        collection(db, "posts"),
        where("mood_tags", "array-contains", mood),
        limit(20) // 충분한 후보 가져오기
      )

      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        const post = {
          id: doc.id,
          ...doc.data(),
        } as Post

        // 현재 게시글 제외
        if (post.id === currentPost.id) {
          return
        }

        // 중복 제거
        if (similarPosts.find((p) => p.id === post.id)) {
          return
        }

        similarPosts.push(post)
      })
    }

    // 유사도 계산 및 정렬
    const scoredPosts = similarPosts
      .map((post) => {
        const similarity = calculatePostSimilarity(
          {
            mood_tags: currentPost.mood_tags,
            body: currentPost.body,
          },
          {
            mood_tags: post.mood_tags,
            body: post.body,
          }
        )

        return { post, similarity }
      })
      .filter((item) => item.similarity >= threshold) // threshold 이상만
      .sort((a, b) => b.similarity - a.similarity) // 유사도 높은 순
      .slice(0, limitCount) // 상위 N개
      .map((item) => item.post)

    return scoredPosts
  } catch (error) {
    console.error("유사 게시글 가져오기 실패:", error)
    return []
  }
}
