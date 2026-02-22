import { PostForm } from "@/components/post-form"
import { BottomNav } from "@/components/bottom-nav"

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-lg">
      <PostForm />
      <BottomNav />
    </main>
  )
}
