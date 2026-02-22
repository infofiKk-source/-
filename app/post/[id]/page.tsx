import { posts } from "@/src/data/sample"
import { PostDetail } from "@/components/post-detail"
import { notFound } from "next/navigation"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = posts.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-lg">
      <PostDetail post={post} />
    </main>
  )
}
