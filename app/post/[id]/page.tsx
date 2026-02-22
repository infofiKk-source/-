import { posts as samplePosts } from "@/src/data/sample"
import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"
import { getPost } from "@/lib/firebase/posts"
import type { Post } from "@/src/data/sample"
import { Timestamp } from "firebase/firestore"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Firebase에서 먼저 찾기
  let post: Post | null = null
  try {
    const firebasePost = await getPost(id)
    if (firebasePost) {
      post = {
        id: firebasePost.id || "",
        mood_tags: firebasePost.mood_tags,
        body: firebasePost.body,
        created_at: firebasePost.created_at instanceof Timestamp
          ? firebasePost.created_at.toDate().toLocaleDateString("ko-KR")
          : typeof firebasePost.created_at === "string"
          ? firebasePost.created_at
          : "방금 전",
        reactions_count: firebasePost.reactions_count || 0,
        comments_count: firebasePost.comments_count || 0,
      }
    }
  } catch (error) {
    console.error("Firebase에서 글 가져오기 실패:", error)
  }

  // Firebase에서 못 찾으면 샘플 데이터에서 찾기
  if (!post) {
    post = samplePosts.find((p) => p.id === id) || null
  }

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-lg">
      <PostDetail post={post} />
    </main>
  )
}
