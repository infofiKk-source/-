import { mockPosts } from "@/lib/data"
import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = mockPosts.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-lg">
      <PostDetail post={post} />
    </main>
  )
}
